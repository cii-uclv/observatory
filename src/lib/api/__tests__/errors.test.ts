import { ApiError, ApiErrorType } from "../api-client";
import { getApiErrorMessage, isForbidden, isUnauthorized } from "../errors";

describe("API error helpers", () => {
	it("uses the domain message for login failures", () => {
		const error = new ApiError("Credenciales inválidas", ApiErrorType.CLIENT, 401, "UNAUTHORIZED", {
			message: "Credenciales de autenticación inválidas.",
			code: "UNAUTHORIZED",
			status: "UNAUTHORIZED",
			data: null,
		});

		expect(getApiErrorMessage(error)).toBe("Credenciales de autenticación inválidas.");
	});

	it("normalizes DRF token errors into a session-expired message", () => {
		const error = new ApiError(
			"HTTP error! status: 401",
			ApiErrorType.CLIENT,
			401,
			"VALIDATION_ERROR",
			{
				message: "Error en la validacion de datos",
				code: "VALIDATION_ERROR",
				status: "VALIDATION_ERROR",
				data: {
					detail: "Given token not valid for any token type",
					code: "token_not_valid",
				},
			}
		);

		expect(getApiErrorMessage(error)).toBe("Tu sesión ha expirado. Inicia sesión de nuevo.");
	});

	it("falls back for server errors without a specific message", () => {
		const error = new ApiError(
			"HTTP error! status: 500",
			ApiErrorType.SERVER,
			500,
			"INTERNAL_SERVER_ERROR",
			{
				message: "HTTP error! status: 500",
				code: "INTERNAL_SERVER_ERROR",
				data: null,
			}
		);

		expect(getApiErrorMessage(error, "Fallback")).toBe("Fallback");
	});

	it("translates network and timeout failures", () => {
		const network = new ApiError("Network error: fetch failed", ApiErrorType.NETWORK);
		const timeout = new ApiError("Request timeout", ApiErrorType.TIMEOUT);

		expect(getApiErrorMessage(network)).toBe(
			"No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."
		);
		expect(getApiErrorMessage(timeout)).toBe("La solicitud tardó demasiado. Inténtalo de nuevo.");
	});

	it("detects unauthorized and forbidden errors", () => {
		const unauthorized = new ApiError("auth", ApiErrorType.CLIENT, 401);
		const forbidden = new ApiError("perm", ApiErrorType.CLIENT, 403);

		expect(isUnauthorized(unauthorized)).toBe(true);
		expect(isForbidden(forbidden)).toBe(true);
		expect(isUnauthorized(forbidden)).toBe(false);
	});
});
