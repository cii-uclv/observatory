import { z } from "zod";

// Esquema de login
// El backend espera el campo `username`, que acepta nombre de usuario o correo.
export const loginUserSchema = z.object({
	username: z
		.string()
		.trim()
		.min(1, "El usuario o correo es obligatorio")
		.max(254, "El usuario o correo no puede exceder 254 caracteres"),
	password: z
		.string()
		.min(1, "La contraseña es obligatoria")
		.max(128, "La contraseña no puede exceder 128 caracteres"),
});

// Esquema de registro de usuario
export const registerUserSchema = z
	.object({
		username: z
			.string()
			.min(3, "El nombre de usuario debe tener al menos 3 caracteres")
			.max(50, "El nombre de usuario no puede exceder 50 caracteres")
			.trim(),
		email: z
			.string()
			.trim()
			.toLowerCase()
			.min(1, "El correo es obligatorio")
			.email("Correo electrónico inválido"),
		first_name: z
			.string()
			.trim()
			.min(1, "El nombre es obligatorio")
			.max(128, "El nombre no puede exceder 128 caracteres"),
		last_name: z
			.string()
			.trim()
			.min(1, "Los apellidos son obligatorios")
			.max(250, "Los apellidos no pueden exceder 250 caracteres"),
		password: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres")
			.max(128, "La contraseña no puede exceder 128 caracteres"),
		confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
	})
	.superRefine((data, context) => {
		if (data.password !== data.confirmPassword) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Las contraseñas no coinciden",
				path: ["confirmPassword"],
			});
		}
	});

// Tipos inferidos desde los esquemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
