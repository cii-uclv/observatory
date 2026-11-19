/**
 * Role codes emitted by the backend JWT/`/auth/me/` (`^[A-Z]{3}-[A-Z]$`).
 */
export const ADMIN_ROLES: readonly string[] = ["ADM-S", "ADMIN"];

export const ROLE_LABELS: Record<string, string> = {
	"ADM-S": "Administrador del Sistema",
	"DIR-01": "Directivo",
	"ANA-S": "Analista Senior",
	"ANA-T": "Analista Técnico",
	"GES-I": "Gestor de Información",
	"ESP-T": "Especialista Temático",
	"COM-01": "Comunicador",
	"INV-E": "Investigador Externo",
	"USR-P": "Usuario Público",
};

export function getRoleLabel(code: string): string {
	return ROLE_LABELS[code] ?? code;
}

export function hasAdminRole(roles: readonly string[]): boolean {
	return roles.some((role) => ADMIN_ROLES.some((adminRole) => adminRole === role));
}
