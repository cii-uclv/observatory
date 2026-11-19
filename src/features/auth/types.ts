/**
 * Auth Types
 *
 * Tipos que reflejan el contrato real del backend.
 */

/**
 * Envelope estándar de respuesta del backend.
 */
export interface ApiEnvelope<TData> {
	code: number;
	status: string;
	message: string;
	data: TData;
}

/**
 * Datos devueltos por login y refresh (el envelope ya fue desenvuelto).
 * Los tokens también quedan en cookies HttpOnly; el frontend no los almacena.
 */
export interface AuthTokensPayload {
	message: string;
	detail: string;
	access: string;
	refresh: string;
}

/**
 * Perfil del usuario autenticado devuelto por `GET /auth/me/`.
 * No incluye flags de staff ni permisos finos.
 */
export interface AuthMe {
	user_id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string | null;
	birth_date: string | null;
	address: string | null;
	roles: string[];
	primary_role: string | null;
}

/**
 * Datos del usuario dentro de la sesión de UI.
 */
export type AuthSessionUser = Omit<AuthMe, "roles" | "primary_role">;

/**
 * Sesión normalizada que consume el frontend.
 * `null` en el hook significa que no hay sesión activa.
 */
export interface AuthSession {
	user: AuthSessionUser;
	roles: string[];
	primaryRole: string | null;
}

/**
 * Datos públicos del usuario devueltos por signup.
 */
export interface AuthUser {
	user_id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string | null;
	birth_date: string | null;
	address: string | null;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	date_joined: string;
	created_at: string;
	updated_at: string | null;
	last_login: string | null;
}
