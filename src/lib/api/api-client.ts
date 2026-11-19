/**
 * API Client
 *
 * Centralized and scalable API client for Next.js App Router.
 * Compatible with both Server Components and Client Components.
 * Prepared for React Query integration.
 *
 * Features:
 * - Configurable baseURL
 * - Dynamic headers
 * - HTTP-only cookie-based authentication (credentials: 'include')
 * - Automatic envelope unwrapping (`{ code, status, message, data }`)
 * - Single-flight refresh + retry on 401
 * - Typed error handling
 * - Server/Client Component compatibility
 * - No UI logic
 * - 100% TypeScript
 *
 * Auth Strategy:
 * - Uses HTTP-only cookies set by backend
 * - Automatically sends credentials with each request
 * - No token management needed on frontend
 */

import { buildLoginPath } from "@/lib/auth/redirect";
import { notifySessionExpired, notifySessionRefreshed } from "@/lib/auth/session-events";
import { API_ENDPOINTS } from "@/lib/constants";

// ============================================================================
// Types
// ============================================================================

/**
 * HTTP Methods supported by the API client
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Request configuration options
 */
export interface RequestConfig extends Omit<RequestInit, "method" | "body"> {
	/**
	 * Custom headers to merge with default headers
	 */
	headers?: HeadersInit;
	/**
	 * Query parameters as object (will be converted to URLSearchParams)
	 */
	params?: Record<string, string | number | boolean | null | undefined>;
	/**
	 * Next.js specific caching options (only works in Server Components)
	 */
	next?: NextFetchRequestConfig;
	/**
	 * Whether to include auth token in request
	 * @deprecated Ignored. Authentication is handled via HTTP-only cookies.
	 * @default true
	 */
	includeAuth?: boolean;
	/**
	 * Custom timeout in milliseconds
	 */
	timeout?: number;
	/**
	 * Credentials policy for cookies
	 * @default 'include' - Always send credentials (HTTP-only cookies)
	 */
	credentials?: RequestCredentials;
	/**
	 * Return the raw response body instead of unwrapping the backend envelope.
	 * Useful for endpoints that need the pagination metadata (`count`, `results`, ...).
	 * @default false
	 */
	raw?: boolean;
	/**
	 * Whether to attempt a token refresh and retry once on a 401 response.
	 * Automatically disabled for login/signup/refresh endpoints.
	 * @default true
	 */
	retryOnUnauthorized?: boolean;
}

/**
 * Next.js fetch request config for Server Components
 */
export interface NextFetchRequestConfig {
	/**
	 * Revalidate time in seconds
	 */
	revalidate?: number | false;
	/**
	 * Cache tags for revalidation
	 */
	tags?: string[];
	/**
	 * Cache strategy
	 */
	cache?: "force-cache" | "no-store" | "no-cache" | "reload" | "default";
}

/**
 * API Error Response structure
 */
export interface ApiErrorResponse {
	message: string;
	code?: string;
	statusCode?: number;
	errors?: Record<string, string[]>;
	[key: string]: unknown;
}

/**
 * Error types for better error handling
 */
export enum ApiErrorType {
	NETWORK = "NETWORK",
	TIMEOUT = "TIMEOUT",
	CLIENT = "CLIENT", // 4xx
	SERVER = "SERVER", // 5xx
	UNKNOWN = "UNKNOWN",
}

/**
 * Typed API Error class
 */
export class ApiError extends Error {
	readonly type: ApiErrorType;
	readonly status: number;
	readonly code?: string;
	readonly response?: ApiErrorResponse;
	readonly originalError?: Error;

	constructor(
		message: string,
		type: ApiErrorType,
		status: number = 0,
		code?: string,
		response?: ApiErrorResponse,
		originalError?: Error
	) {
		super(message);
		this.name = "ApiError";
		this.type = type;
		this.status = status;
		this.code = code;
		this.response = response;
		this.originalError = originalError;

		// Maintains proper stack trace for where our error was thrown
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ApiError);
		}
	}

	/**
	 * Check if error is a client error (4xx)
	 */
	isClientError(): boolean {
		return this.type === ApiErrorType.CLIENT;
	}

	/**
	 * Check if error is a server error (5xx)
	 */
	isServerError(): boolean {
		return this.type === ApiErrorType.SERVER;
	}

	/**
	 * Check if error is a network error
	 */
	isNetworkError(): boolean {
		return this.type === ApiErrorType.NETWORK;
	}

	/**
	 * Check if error is a timeout
	 */
	isTimeout(): boolean {
		return this.type === ApiErrorType.TIMEOUT;
	}
}

/**
 * Result of a session refresh attempt.
 *
 * - `refreshed`: the refresh cookie was valid and new cookies were issued.
 * - `no-session`: the refresh token is missing, expired or blacklisted.
 * - `unavailable`: the refresh could not be checked (network/5xx/server-side).
 */
export type RefreshOutcome =
	| { status: "refreshed" }
	| { status: "no-session"; error: ApiError }
	| { status: "unavailable"; error: ApiError };

/**
 * API Client configuration
 */
export interface ApiClientConfig {
	/**
	 * Base URL for all API requests
	 */
	baseURL: string;
	/**
	 * Default headers to include in all requests
	 */
	defaultHeaders?: HeadersInit;
	/**
	 * Function to get auth token (called on each request if includeAuth is true)
	 * @deprecated Not used. Authentication is handled via HTTP-only cookies with credentials: 'include'
	 */
	getAuthToken?: () => string | null | Promise<string | null>;
	/**
	 * Custom header name for auth token
	 * @deprecated Not used. Authentication is handled via HTTP-only cookies.
	 * @default 'Authorization'
	 */
	authHeaderName?: string;
	/**
	 * Auth token prefix (e.g., 'Bearer')
	 * @deprecated Not used. Authentication is handled via HTTP-only cookies.
	 * @default 'Bearer'
	 */
	authTokenPrefix?: string;
	/**
	 * Default timeout in milliseconds
	 * @default 30000 (30 seconds)
	 */
	defaultTimeout?: number;
	/**
	 * Whether we're in a Server Component context
	 * Auto-detected if not provided
	 */
	isServer?: boolean;
	/**
	 * Callback invoked when the session cannot be refreshed (refresh failed).
	 * In the browser the default behavior redirects to `/login`.
	 */
	onUnauthorized?: () => void | Promise<void>;
}

// ============================================================================
// API Client Class
// ============================================================================

/**
 * Centralized API Client
 *
 * Uses HTTP-only cookies for authentication. Credentials are automatically
 * sent with every request via `credentials: 'include'`.
 *
 * Usage:
 * ```ts
 * const client = new ApiClient({
 *   baseURL: 'https://api.example.com',
 * });
 *
 * // Login (sets HTTP-only cookie on response)
 * await client.post('/auth/login/', { username, password }, { includeAuth: false });
 *
 * // Subsequent requests automatically send the cookie
 * const user = await client.get<User>('/api/user/');
 * ```
 */
export class ApiClient {
	private config: Required<
		Omit<ApiClientConfig, "getAuthToken" | "defaultHeaders" | "onUnauthorized">
	> &
		Pick<ApiClientConfig, "getAuthToken" | "defaultHeaders" | "onUnauthorized">;

	/**
	 * Single-flight refresh promise, shared by all concurrent 401s.
	 */
	private refreshPromise: Promise<RefreshOutcome> | null = null;

	constructor(config: ApiClientConfig) {
		// Validate baseURL
		if (!config.baseURL) {
			throw new Error("ApiClient: baseURL is required");
		}

		// Normalize baseURL (remove trailing slash)
		const baseURL = config.baseURL.replace(/\/$/, "");

		this.config = {
			baseURL,
			defaultHeaders: config.defaultHeaders || {},
			getAuthToken: config.getAuthToken,
			authHeaderName: config.authHeaderName || "Authorization",
			authTokenPrefix: config.authTokenPrefix || "Bearer",
			defaultTimeout: config.defaultTimeout ?? 30000,
			isServer: config.isServer ?? typeof window === "undefined",
			onUnauthorized: config.onUnauthorized,
		};
	}

	/**
	 * Base request method
	 *
	 * Unwraps the backend envelope (`{ code, status, message, data }`) by default.
	 * On a `401`, attempts a single-flight refresh and retries the request once.
	 *
	 * @template T - Response type (the envelope `data` payload)
	 * @param method - HTTP method
	 * @param endpoint - API endpoint (relative to baseURL)
	 * @param data - Request body (for POST, PUT, PATCH)
	 * @param config - Request configuration
	 * @returns Promise with typed response
	 */
	async request<T>(
		method: HttpMethod,
		endpoint: string,
		data?: unknown,
		config: RequestConfig = {}
	): Promise<T> {
		const { raw = false, retryOnUnauthorized = true } = config;

		try {
			const body = await this.execute(method, endpoint, data, config);
			return this.unwrapResponse<T>(body, raw);
		} catch (error) {
			const shouldRefresh =
				retryOnUnauthorized &&
				!this.config.isServer &&
				error instanceof ApiError &&
				error.status === 401 &&
				this.canRefresh(endpoint);

			if (!shouldRefresh) {
				throw error;
			}

			const outcome = await this.refreshSession();

			if (outcome.status === "refreshed") {
				try {
					const retryBody = await this.execute(method, endpoint, data, {
						...config,
						retryOnUnauthorized: false,
					});

					return this.unwrapResponse<T>(retryBody, raw);
				} catch (retryError) {
					if (retryError instanceof ApiError && retryError.status === 401) {
						await this.notifyUnauthorized("retry-failed");
					}

					throw retryError;
				}
			}

			if (outcome.status === "no-session") {
				await this.notifyUnauthorized("no-session");
				throw error;
			}

			// Session could not be checked (network/5xx): keep the local session.
			throw outcome.error;
		}
	}

	/**
	 * Execute a request and parse the JSON body (without unwrapping the envelope).
	 */
	private async execute(
		method: HttpMethod,
		endpoint: string,
		data: unknown,
		config: RequestConfig
	): Promise<unknown> {
		const {
			headers: customHeaders = {},
			params,
			next,
			credentials = "include", // HTTP-only cookies
			timeout = this.config.defaultTimeout,
			raw: _raw,
			retryOnUnauthorized: _retryOnUnauthorized,
			...fetchOptions
		} = config;

		// Build URL
		const url = this.buildURL(endpoint, params);

		// Build headers (no auth token, using cookies)
		const headers = await this.buildHeaders(customHeaders, false);

		// Build request body
		const body = this.buildBody(data, method);

		// Build fetch options
		const fetchConfig: RequestInit = {
			...fetchOptions,
			method,
			headers,
			body,
			credentials, // Include HTTP-only cookies
		};

		// Add Next.js specific options for Server Components
		if (this.config.isServer && next) {
			// Next.js extends RequestInit with 'next' property
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(fetchConfig as any).next = next;
		}

		let timeoutId: NodeJS.Timeout | undefined;
		try {
			// Create abort controller for timeout
			const controller = new AbortController();
			timeoutId = setTimeout(() => controller.abort(), timeout);
			fetchConfig.signal = controller.signal;

			// Make request
			const response = await fetch(url, fetchConfig);
			clearTimeout(timeoutId);

			// Handle response
			return await this.handleResponse(response);
		} catch (error) {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			// Handle errors
			throw this.handleError(error, url);
		}
	}

	/**
	 * Refresh the session using the HttpOnly refresh cookie.
	 * Single-flight: concurrent callers share the same promise.
	 *
	 * The outcome is classified so callers can distinguish a real logout
	 * (`no-session`) from a transient failure (`unavailable`).
	 */
	refreshSession(): Promise<RefreshOutcome> {
		if (this.config.isServer) {
			return Promise.resolve({
				status: "unavailable",
				error: new ApiError(
					"Session refresh is not available on the server",
					ApiErrorType.UNKNOWN,
					0,
					"REFRESH_UNAVAILABLE_SERVER"
				),
			});
		}

		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		const refresh = async (): Promise<RefreshOutcome> => {
			try {
				await this.execute("POST", API_ENDPOINTS.AUTH.REFRESH, undefined, {
					credentials: "include",
				});

				notifySessionRefreshed();

				return { status: "refreshed" } as const;
			} catch (error) {
				const apiError =
					error instanceof ApiError
						? error
						: new ApiError(
								error instanceof Error ? error.message : "Session refresh failed",
								ApiErrorType.UNKNOWN,
								0,
								"REFRESH_FAILED",
								undefined,
								error instanceof Error ? error : undefined
							);

				if (apiError.status === 400 || apiError.status === 401) {
					return { status: "no-session", error: apiError } as const;
				}

				return { status: "unavailable", error: apiError } as const;
			}
		};

		// The refresh token rotates, so concurrent tabs must not refresh at the
		// same time. Web Locks serializes the exchange across tabs on this origin.
		const locked: Promise<RefreshOutcome> =
			typeof navigator !== "undefined" && "locks" in navigator
				? navigator.locks
						.request<Promise<RefreshOutcome>>("observatory:auth:refresh", () => refresh())
						.then((outcome) => outcome)
				: refresh();

		this.refreshPromise = locked.finally(() => {
			this.refreshPromise = null;
		});

		return this.refreshPromise;
	}

	/**
	 * Endpoints that must never trigger a refresh/retry loop.
	 */
	private canRefresh(endpoint: string): boolean {
		const normalized = endpoint.split("?")[0].replace(/\/+$/, "") || "/";
		const nonRefreshable = [
			API_ENDPOINTS.AUTH.LOGIN,
			API_ENDPOINTS.AUTH.REGISTER,
			API_ENDPOINTS.AUTH.REFRESH,
		];

		return !nonRefreshable.some((path) => normalized === path || normalized.startsWith(`${path}/`));
	}

	/**
	 * Unwrap the backend envelope unless `raw` was requested.
	 */
	private unwrapResponse<T>(body: unknown, raw: boolean): T {
		if (raw) {
			return body as T;
		}

		if (this.isEnvelope(body)) {
			return body.data as T;
		}

		return body as T;
	}

	/**
	 * Detect the standard backend envelope.
	 */
	private isEnvelope(value: unknown): value is { code: number; status: string; data: unknown } {
		return (
			typeof value === "object" &&
			value !== null &&
			"code" in value &&
			"status" in value &&
			"data" in value
		);
	}

	/**
	 * Called when the session is gone: notify listeners or fall back to a
	 * full-page redirect when there is no React bridge mounted.
	 */
	private async notifyUnauthorized(reason: "no-session" | "retry-failed"): Promise<void> {
		if (notifySessionExpired(reason)) {
			return;
		}

		if (this.config.onUnauthorized) {
			await this.config.onUnauthorized();
			return;
		}

		if (typeof window === "undefined") {
			return;
		}

		const { pathname, search } = window.location;

		if (pathname.startsWith("/login") || pathname.startsWith("/auth/recover")) {
			return;
		}

		window.location.assign(buildLoginPath(`${pathname}${search}`, { expired: true }));
	}

	/**
	 * GET request
	 */
	async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		return this.request<T>("GET", endpoint, undefined, config);
	}

	/**
	 * POST request
	 */
	async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
		return this.request<T>("POST", endpoint, data, config);
	}

	/**
	 * PUT request
	 */
	async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
		return this.request<T>("PUT", endpoint, data, config);
	}

	/**
	 * PATCH request
	 */
	async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
		return this.request<T>("PATCH", endpoint, data, config);
	}

	/**
	 * DELETE request
	 */
	async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		return this.request<T>("DELETE", endpoint, undefined, config);
	}

	// ========================================================================
	// Private Methods
	// ========================================================================

	/**
	 * Build full URL from endpoint and params
	 */
	private buildURL(
		endpoint: string,
		params?: Record<string, string | number | boolean | null | undefined>
	): string {
		// Ensure endpoint starts with /
		const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
		let url = `${this.config.baseURL}${normalizedEndpoint}`;

		// Add query parameters
		if (params && Object.keys(params).length > 0) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					searchParams.append(key, String(value));
				}
			});
			const queryString = searchParams.toString();
			if (queryString) {
				url += `?${queryString}`;
			}
		}

		return url;
	}

	/**
	 * Build headers for request
	 *
	 * Note: Authentication is handled via HTTP-only cookies.
	 * No auth token is added to headers.
	 */
	private async buildHeaders(
		customHeaders: HeadersInit,
		_includeAuth: boolean // Deprecated parameter, ignored
	): Promise<HeadersInit> {
		const headers = new Headers(this.config.defaultHeaders);

		// Add default Content-Type for requests with body
		if (!headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json");
		}

		// Authentication is handled via HTTP-only cookies (credentials: 'include')
		// No auth token header is needed

		// Merge custom headers (custom headers take precedence)
		if (customHeaders instanceof Headers) {
			customHeaders.forEach((value, key) => {
				headers.set(key, value);
			});
		} else if (Array.isArray(customHeaders)) {
			customHeaders.forEach(([key, value]) => {
				headers.set(key, value);
			});
		} else {
			Object.entries(customHeaders).forEach(([key, value]) => {
				if (value) {
					headers.set(key, String(value));
				}
			});
		}

		return headers;
	}

	/**
	 * Build request body
	 */
	private buildBody(data: unknown, method: HttpMethod): string | undefined {
		// Only include body for methods that support it
		if (!["POST", "PUT", "PATCH"].includes(method) || data === undefined) {
			return undefined;
		}

		// If data is already a string, return as-is (for FormData, etc.)
		if (typeof data === "string") {
			return data;
		}

		// If data is FormData, URLSearchParams, or Blob, return as-is
		if (data instanceof FormData || data instanceof URLSearchParams || data instanceof Blob) {
			// These types are valid for RequestInit.body
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return data as any;
		}

		// Otherwise, stringify JSON
		return JSON.stringify(data);
	}

	/**
	 * Handle response and parse body
	 */
	private async handleResponse<T>(response: Response): Promise<T> {
		// Handle empty responses (204 No Content, etc.)
		if (response.status === 204 || response.status === 205) {
			return undefined as T;
		}

		// Check if response is ok
		if (!response.ok) {
			const errorData = await this.parseErrorResponse(response);
			throw new ApiError(
				errorData.message || `HTTP error! status: ${response.status}`,
				this.getErrorType(response.status),
				response.status,
				errorData.code,
				errorData
			);
		}

		// Parse response body
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			try {
				return await response.json();
			} catch (error) {
				throw new ApiError(
					"Failed to parse JSON response",
					ApiErrorType.UNKNOWN,
					response.status,
					undefined,
					undefined,
					error instanceof Error ? error : new Error(String(error))
				);
			}
		}

		// Return text response if not JSON
		if (contentType && contentType.includes("text/")) {
			return (await response.text()) as T;
		}

		// Return blob for binary data
		if (
			contentType &&
			(contentType.includes("image/") || contentType.includes("application/octet-stream"))
		) {
			return (await response.blob()) as T;
		}

		// Default: return empty object
		return {} as T;
	}

	/**
	 * Parse error response
	 */
	private async parseErrorResponse(response: Response): Promise<ApiErrorResponse> {
		try {
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				return await response.json();
			}
		} catch {
			// Ignore parsing errors
		}

		return {
			message: `HTTP error! status: ${response.status}`,
			statusCode: response.status,
		};
	}

	/**
	 * Get error type from status code
	 */
	private getErrorType(status: number): ApiErrorType {
		if (status >= 400 && status < 500) {
			return ApiErrorType.CLIENT;
		}
		if (status >= 500) {
			return ApiErrorType.SERVER;
		}
		return ApiErrorType.UNKNOWN;
	}

	/**
	 * Handle and transform errors
	 */
	private handleError(error: unknown, url: string): ApiError {
		// Already an ApiError, re-throw
		if (error instanceof ApiError) {
			return error;
		}

		// AbortError (timeout)
		if (error instanceof Error && error.name === "AbortError") {
			return new ApiError(
				`Request timeout: ${url}`,
				ApiErrorType.TIMEOUT,
				0,
				"TIMEOUT",
				undefined,
				error
			);
		}

		// Network errors
		if (error instanceof TypeError && error.message.includes("fetch")) {
			return new ApiError(
				`Network error: ${error.message}`,
				ApiErrorType.NETWORK,
				0,
				"NETWORK_ERROR",
				undefined,
				error
			);
		}

		// Unknown errors
		return new ApiError(
			error instanceof Error ? error.message : "Unknown error occurred",
			ApiErrorType.UNKNOWN,
			0,
			"UNKNOWN_ERROR",
			undefined,
			error instanceof Error ? error : new Error(String(error))
		);
	}
}

// ============================================================================
// Default Instance Factory
// ============================================================================

/**
 * Create a default API client instance
 *
 * Usage:
 * ```ts
 * const api = createApiClient({
 *   baseURL: process.env.NEXT_PUBLIC_API_URL!,
 * });
 * ```
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
	return new ApiClient(config);
}

/**
 * Default API client instance (client-side singleton).
 *
 * Uses the Next.js rewrite path (`/api`) so the browser reaches the
 * Django backend through the Next.js proxy. Authentication is handled
 * via HTTP-only cookies sent automatically with `credentials: "include"`.
 *
 * Usage:
 * ```ts
 * import { defaultClient } from '@/lib/api/api-client';
 * const data = await defaultClient.get<User>('/users/1');
 * ```
 */
export const defaultClient = (() => {
	// base url , only api because of next.js rewrites, see next.config.ts
	const baseURL = "/api";

	return createApiClient({
		baseURL,
		// Authentication is handled via HTTP-only cookies
		// Set by the backend in login response
		// No token management needed on frontend
	});
})();

/**
 * @deprecated Renamed to `defaultClient` to avoid confusion with the
 * `ApiClient` class. Migrate your imports:
 *
 * ```ts
 * // Before
 * import { apiClient } from "@/lib/api/api-client";
 * // After
 * import { defaultClient } from "@/lib/api/api-client";
 * ```
 */
export const apiClient = defaultClient;
