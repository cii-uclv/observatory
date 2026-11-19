/**
 * API error helpers.
 *
 * The backend returns 401 bodies in two different shapes:
 * - Domain errors: `{ code, status: "UNAUTHORIZED", message, data }`
 * - DRF errors wrapped by the custom handler:
 *   `{ code, status: "VALIDATION_ERROR", message, data: { detail, ... } }`
 *
 * These helpers normalize both shapes into a user-facing message.
 */

import { ApiError } from "./api-client";

const GENERIC_MESSAGES = new Set([
	"Error en la validacion de datos",
	"Error en la validación de datos",
	"HTTP error!",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function normalizeMessage(value?: string | null): string | null {
	const message = value?.trim();

	return message ? message : null;
}

function isGenericMessage(message: string): boolean {
	return GENERIC_MESSAGES.has(message) || message.startsWith("HTTP error!");
}

function extractMessage(value: unknown, depth = 0): string | null {
	if (depth > 4) {
		return null;
	}

	if (typeof value === "string") {
		return normalizeMessage(value);
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			const message = extractMessage(item, depth + 1);
			if (message) {
				return message;
			}
		}

		return null;
	}

	if (!isRecord(value)) {
		return null;
	}

	const priorityKeys = ["detail", "message", "error", "non_field_errors", "messages"];

	for (const key of priorityKeys) {
		const message = extractMessage(value[key], depth + 1);
		if (message) {
			return message;
		}
	}

	for (const nested of Object.values(value)) {
		const message = extractMessage(nested, depth + 1);
		if (message) {
			return message;
		}
	}

	return null;
}

function hasTokenNotValidCode(value: unknown, depth = 0): boolean {
	if (depth > 4) {
		return false;
	}

	if (Array.isArray(value)) {
		return value.some((item) => hasTokenNotValidCode(item, depth + 1));
	}

	if (!isRecord(value)) {
		return false;
	}

	if (value.code === "token_not_valid") {
		return true;
	}

	return Object.values(value).some((nested) => hasTokenNotValidCode(nested, depth + 1));
}

/**
 * Returns the most specific user-facing message available for an API error.
 */
export function getApiErrorMessage(
	error: unknown,
	fallback = "Ha ocurrido un error inesperado."
): string {
	if (!(error instanceof ApiError)) {
		return error instanceof Error && error.message ? error.message : fallback;
	}

	const response = error.response;

	if (error.isTimeout()) {
		return "La solicitud tardó demasiado. Inténtalo de nuevo.";
	}

	if (error.isNetworkError()) {
		return "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
	}

	if (error.status === 401 && response && hasTokenNotValidCode(response)) {
		return "Tu sesión ha expirado. Inicia sesión de nuevo.";
	}

	const detail = extractMessage(response?.data);
	if (detail && !isGenericMessage(detail)) {
		return detail;
	}

	const responseMessage = normalizeMessage(response?.message);
	if (responseMessage && !isGenericMessage(responseMessage)) {
		return responseMessage;
	}

	const ownMessage = normalizeMessage(error.message);
	if (ownMessage && !isGenericMessage(ownMessage)) {
		return ownMessage;
	}

	if (error.status === 401) {
		return "Tu sesión ha expirado. Inicia sesión de nuevo.";
	}

	if (error.status === 403) {
		return "No tienes permisos para realizar esta acción.";
	}

	return fallback;
}

export function isUnauthorized(error: unknown): error is ApiError {
	return error instanceof ApiError && error.status === 401;
}

export function isForbidden(error: unknown): error is ApiError {
	return error instanceof ApiError && error.status === 403;
}
