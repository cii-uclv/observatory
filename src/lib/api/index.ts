/**
 * API Client Barrel Export
 *
 * Central export point for API client functionality.
 */

export {
	ApiClient,
	apiClient,
	type ApiClientConfig,
	ApiError,
	type ApiErrorResponse,
	ApiErrorType,
	createApiClient,
	defaultClient,
	type HttpMethod,
	type NextFetchRequestConfig,
	type RequestConfig,
} from "./api-client";
