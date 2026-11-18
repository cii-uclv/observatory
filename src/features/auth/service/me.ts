/**
 * Current Session Service
 *
 * Reads the authenticated user from `GET /api/auth/me/`.
 * The access token lives in an HttpOnly cookie, so the browser sends it
 * automatically; the frontend never stores tokens.
 */

import { ApiError, defaultClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/constants";

import { AuthMe, AuthSession } from "../types";

function toSession(me: AuthMe): AuthSession {
	const { roles, primary_role: primaryRole, ...user } = me;

	return {
		user,
		roles,
		primaryRole,
	};
}

async function fetchMe(): Promise<AuthMe> {
	return defaultClient.get<AuthMe>(API_ENDPOINTS.AUTH.ME, {
		// A 401 here just means "no session"; avoid the global redirect.
		retryOnUnauthorized: false,
	});
}

/**
 * Get the current session, or `null` when there is no authenticated user.
 *
 * If the access token expired but the refresh cookie is still valid, the
 * session is renewed once before giving up.
 */
export async function getSession(): Promise<AuthSession | null> {
	try {
		return toSession(await fetchMe());
	} catch (error) {
		if (!(error instanceof ApiError) || error.status !== 401) {
			throw error;
		}

		const refreshed = await defaultClient.refreshSession();
		if (!refreshed) {
			return null;
		}

		try {
			return toSession(await fetchMe());
		} catch {
			return null;
		}
	}
}
