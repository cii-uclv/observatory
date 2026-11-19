export interface AuthTokens {
	access_token: string;
	refresh_token: string;
	token_type: "Bearer";
	expires_in: number;
}

export interface User {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	nombre_completo: string;
	is_active: boolean;
	date_joined: string;
}

export interface UserProfile {
	telefono: string | null;
	fecha_nacimiento: string | null;
	direccion: string | null;
	foto: string | null;
}

export interface UserRoleAssignment {
	id: number;
	nombre: string;
	nombre_completo: string;
	activo: boolean;
	fecha_asignacion: string;
	fecha_vencimiento: string | null;
	info_especifica: RoleSpecificInfo | null;
}

export interface Role {
	id: number;
	nombre: string;
	nombre_completo: string;
	descripcion: string;
	permisos_clave: string[];
}

export enum RoleCode {
	ADM_S = "ADM-S",
	DIR_01 = "DIR-01",
	ANA_S = "ANA-S",
	ANA_T = "ANA-T",
	GES_I = "GES-I",
	ESP_T = "ESP-T",
	COM_01 = "COM-01",
	INV_E = "INV-E",
	USR_P = "USR-P",
}

export interface InfoDirectivo {
	nivel: "jefe_dpto" | "jefe_seccion" | "jefe_empresa" | "director_ministerio";
	departamento_id: number;
	presupuesto_asignado?: number;
	objetivos_estrategicos?: string;
}
export interface InfoAnalista {
	tipo_analista: "senior" | "tecnico";
	herramientas?: string[];
	especialidad?: string;
	area_investigacion_id?: number;
	proyectos_ids?: number[];
}

export interface InfoGestorInformacion {
	taxonomias_gestionadas: string[];
	fuentes_asignadas: number[];
	nivel_normalizacion: string;
}
export interface InfoEspecialistaTematico {
	area_tematica: string;
	grupos_expertos: number[];
	webinars_realizados: number;
}
export interface InfoComunicador {
	nivel_validacion: string;
	boletines_aprobados: number[];
	lineas_editoriales: string;
}
export interface InfoInvestigadorExterno {
	institucion: string;
	grado_academico: string;
	area_interes: string;
	solicitud_id: number | null;
	fecha_aprobacion?: string;
}

export type RoleSpecificInfo =
	| InfoDirectivo
	| InfoAnalista
	| InfoGestorInformacion
	| InfoEspecialistaTematico
	| InfoComunicador
	| InfoInvestigadorExterno;

export interface AuthUser extends User {
	perfil: UserProfile;
	roles: UserRoleAssignment[];
}

export interface LoginResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	user: User;
}

export interface RefreshTokenRequest {
	refresh_token: string;
}

export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}

export interface UpdateProfileRequest {
	first_name?: string;
	last_name?: string;
	email?: string;
	perfil?: {
		telefono?: string;
		fecha_nacimiento?: string;
		direccion?: string;
	};
}
