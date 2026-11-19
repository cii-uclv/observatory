/**
 * Redirect helpers for authentication flows.
 */

const NON_RETURNABLE_PREFIXES = ["/login", "/auth/recover"] as const;

/**
 * Accepts only internal, absolute paths that are safe to return to after
 * authentication. Returns `null` for external, protocol-relative or auth-flow
 * destinations.
 */
export function sanitizeNextPath(target?: string | null): string | null {
	if (!target) {
		return null;
	}

	if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) {
		return null;
	}

	if (NON_RETURNABLE_PREFIXES.some((prefix) => target.startsWith(prefix))) {
		return null;
	}

	return target;
}

interface BuildLoginPathOptions {
	expired?: boolean;
}

/**
 * Builds a safe login URL preserving the optional return path.
 */
export function buildLoginPath(next?: string | null, options: BuildLoginPathOptions = {}): string {
	const safeNext = sanitizeNextPath(next);
	const params = new URLSearchParams();

	if (safeNext) {
		params.set("next", safeNext);
	}

	if (options.expired) {
		params.set("expired", "1");
	}

	const query = params.toString();

	return query ? `/login?${query}` : "/login";
}

/**
 * Builds an encoded path for a user profile.
 *
 * Usernames may contain reserved URL characters such as `#` or `?`; encoding
 * them prevents the browser from interpreting part of the username as a
 * fragment or query string.
 */
export function buildProfilePath(username: string): string {
	return `/${encodeURIComponent(username)}`;
}
