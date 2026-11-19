/**
 * Session events
 *
 * A small typed event bus used by the API client to notify the React tree
 * about session lifecycle changes without coupling the client to React.
 * Events are also broadcast to other tabs on the same origin.
 */

export type SessionExpiredReason = "no-session" | "retry-failed";

export type AuthEvent =
	| { type: "session:refreshed" }
	| { type: "session:expired"; reason: SessionExpiredReason }
	| { type: "session:unavailable"; message?: string }
	| { type: "session:logout" };

type AuthEventListener = (event: AuthEvent) => void;

const CHANNEL_NAME = "observatory:auth";
const EXPIRATION_DEDUPE_MS = 2000;

const listeners = new Set<AuthEventListener>();

let lastExpiredAt = 0;

const channel =
	typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
		? new BroadcastChannel(CHANNEL_NAME)
		: null;

function isAuthEvent(value: unknown): value is AuthEvent {
	if (typeof value !== "object" || value === null || !("type" in value)) {
		return false;
	}

	const candidate = value as { type: unknown; reason?: unknown; message?: unknown };

	switch (candidate.type) {
		case "session:refreshed":
		case "session:logout":
			return true;
		case "session:expired":
			return candidate.reason === "no-session" || candidate.reason === "retry-failed";
		case "session:unavailable":
			return candidate.message === undefined || typeof candidate.message === "string";
		default:
			return false;
	}
}

function dispatch(event: AuthEvent): void {
	for (const listener of listeners) {
		try {
			listener(event);
		} catch (error) {
			console.error("[auth] session event listener failed", error);
		}
	}
}

function publish(event: AuthEvent): void {
	dispatch(event);
	channel?.postMessage(event);
}

function handleRemoteEvent(event: AuthEvent): void {
	if (event.type === "session:expired") {
		if (!hasAuthEventListeners()) {
			return;
		}

		const now = Date.now();

		if (now - lastExpiredAt < EXPIRATION_DEDUPE_MS) {
			return;
		}

		lastExpiredAt = now;
		dispatch(event);
		return;
	}

	if (event.type === "session:refreshed" || event.type === "session:logout") {
		lastExpiredAt = 0;
	}

	dispatch(event);
}

channel?.addEventListener("message", (event: MessageEvent<unknown>) => {
	if (isAuthEvent(event.data)) {
		handleRemoteEvent(event.data);
	}
});

export function subscribeAuthEvents(listener: AuthEventListener): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

export function hasAuthEventListeners(): boolean {
	return listeners.size > 0;
}

/**
 * Marks the session as renewed and clears the expiration cooldown.
 */
export function notifySessionRefreshed(): void {
	lastExpiredAt = 0;
	publish({ type: "session:refreshed" });
}

/**
 * Emits a session-expired event at most once per burst so concurrent 401s
 * cannot trigger duplicate navigations.
 *
 * @returns `true` when a listener handled the event (or it was already
 * handled); `false` when there is no listener and the caller must fall back.
 */
export function notifySessionExpired(reason: SessionExpiredReason): boolean {
	const now = Date.now();

	if (!hasAuthEventListeners()) {
		channel?.postMessage({ type: "session:expired", reason });
		return false;
	}

	if (now - lastExpiredAt < EXPIRATION_DEDUPE_MS) {
		return true;
	}

	lastExpiredAt = now;
	publish({ type: "session:expired", reason });

	return true;
}

/**
 * Reports a transient failure while checking/refreshing the session.
 * It must not clear the local session.
 */
export function notifySessionUnavailable(message?: string): void {
	dispatch({ type: "session:unavailable", message });
}

/**
 * Emits a logout event so every subscribed consumer can clear its state.
 *
 * @returns `true` when a listener handled it; `false` when the caller must
 * perform the cleanup/navigation itself.
 */
export function notifySessionLogout(): boolean {
	lastExpiredAt = 0;

	if (!hasAuthEventListeners()) {
		channel?.postMessage({ type: "session:logout" });
		return false;
	}

	publish({ type: "session:logout" });

	return true;
}
