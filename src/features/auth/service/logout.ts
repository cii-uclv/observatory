/**
 * Logout Service
 *
 * Handles user logout and session termination.
 * Relies on the HttpOnly cookies so the backend can blacklist the refresh token.
 */

import { apiClient, ApiError, ApiErrorType } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/constants";

import { ApiEnvelope } from "../types";

/**
 * Logout response from the server.
 * The backend blacklists the refresh token and clears both cookies.
 */
export type LogoutResponse = ApiEnvelope<{
	message: string;
	detail: string;
}>;

/**
 * Logout the currently authenticated user
 *
 * Sends the authenticated request with cookies so the backend can revoke the
 * refresh token and delete the HttpOnly cookies from the browser.
 *
 * @returns Promise resolving to the logout response
 * @throws ApiError if the user is not authenticated or server error occurs
 */
export async function logout(): Promise<LogoutResponse> {
	try {
		const response = await apiClient.post<LogoutResponse>(
			API_ENDPOINTS.AUTH.LOGOUT,
			{},
			{
				// ✅ ENVIAR cookies en logout (usuario está autenticado)
				credentials: "include",
			}
		);

		return response;
	} catch (error) {
		// Re-throw ApiError as-is for proper error handling
		if (error instanceof ApiError) {
			throw error;
		}

		// Wrap other errors as ApiError
		throw new ApiError(
			error instanceof Error ? error.message : "Logout failed",
			ApiErrorType.UNKNOWN
		);
	}
}
