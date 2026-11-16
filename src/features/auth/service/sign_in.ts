/**
 * Sign In Service
 *
 * Handles user authentication and login flow.
 * The backend sets HttpOnly cookies, so every request must send credentials.
 */

import { apiClient, ApiError, ApiErrorType } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/constants";

import { LoginUserInput } from "../schemas/auth";
import { AuthTokensResponse } from "../types";

/**
 * Login response from the server (envelope + tokens in `data`).
 * The HttpOnly cookies are set by the backend in the same response.
 */
export type SignInResponse = AuthTokensResponse;

/**
 * Sign in (login) a user
 *
 * Sends `{ username, password }`; the backend accepts a username or an email
 * in the `username` field. On success it sets the `access_token` and
 * `refresh_token` HttpOnly cookies.
 *
 * @param payload - Object containing username (or email) and password
 * @returns Promise resolving to the backend response envelope
 * @throws ApiError if credentials are invalid or server error occurs
 */
export async function signIn(payload: LoginUserInput): Promise<SignInResponse> {
	try {
		const response = await apiClient.post<SignInResponse>(API_ENDPOINTS.AUTH.LOGIN, payload, {
			// ✅ Recibir y guardar las cookies HttpOnly emitidas por el backend
			credentials: "include",
		});

		return response;
	} catch (error) {
		// Re-throw ApiError as-is for proper error handling
		if (error instanceof ApiError) {
			throw error;
		}

		// Wrap other errors as ApiError
		throw new ApiError(
			error instanceof Error ? error.message : "Sign in failed",
			ApiErrorType.UNKNOWN
		);
	}
}
