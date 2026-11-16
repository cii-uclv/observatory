/**
 * Sign Up Service
 *
 * Handles user registration and account creation.
 * Signup does not open a session: the user must log in afterwards.
 */

import { apiClient, ApiError, ApiErrorType } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/constants";

import { RegisterUserInput } from "../schemas/auth";
import { SignUpResponse } from "../types";

export type { SignUpResponse } from "../types";

/**
 * Sign up (register) a new user
 *
 * Sends the registration data expected by the backend
 * (`username`, `email`, `password`, `first_name`, `last_name`).
 *
 * After a successful registration the user must log in with `signIn`.
 *
 * @param payload - Registration form values
 * @returns Promise resolving to the created user envelope
 * @throws ApiError if validation fails, username/email already exists, or server error occurs
 */
export async function signUp(payload: RegisterUserInput): Promise<SignUpResponse> {
	try {
		const { confirmPassword: _confirmPassword, ...userData } = payload;
		const response = await apiClient.post<SignUpResponse>(API_ENDPOINTS.AUTH.REGISTER, userData, {
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
			error instanceof Error ? error.message : "Sign up failed",
			ApiErrorType.UNKNOWN
		);
	}
}
