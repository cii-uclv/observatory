import { expect, test } from "@playwright/test";

import {
	fillRegister,
	makeUser,
	registerViaUi,
	signUpViaApi,
	submitRegister,
} from "../support/auth";
import { delay, fieldError, globalAuthError } from "../support/errors";

test.describe("Registro de usuarios", () => {
	test("REG-01 registro válido auto-loguea y muestra el perfil", async ({ page, context }) => {
		const user = makeUser();

		await registerViaUi(page, user);

		await expect(page).toHaveURL(new RegExp(`/${user.username}$`));
		await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
		await expect(
			page.getByRole("heading", { name: `${user.firstName} ${user.lastName}` })
		).toBeVisible();
		await expect(page.getByRole("main").getByText(`@${user.username}`)).toBeVisible();
		await expect(page.getByText(user.email)).toBeVisible();
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();

		// El usuario existe realmente en el backend.
		const me = await context.request.get("/api/auth/me/");

		expect(me.status()).toBe(200);
		expect((await me.json()).data.username).toBe(user.username);
	});

	test("REG-02 formulario vacío muestra errores y no llama al backend", async ({ page }) => {
		let signupRequests = 0;

		page.on("request", (request) => {
			if (request.method() === "POST" && request.url().includes("/api/auth/signup/")) {
				signupRequests += 1;
			}
		});

		await page.goto("/register");
		await submitRegister(page);

		await expect(fieldError(page, "username")).toContainText(
			"El nombre de usuario debe tener al menos 3 caracteres"
		);
		await expect(fieldError(page, "email")).toContainText("El correo es obligatorio");
		await expect(fieldError(page, "first_name")).toContainText("El nombre es obligatorio");
		await expect(fieldError(page, "last_name")).toContainText("Los apellidos son obligatorios");
		await expect(fieldError(page, "password")).toContainText(
			"La contraseña debe tener al menos 8 caracteres"
		);
		await expect(fieldError(page, "confirmPassword")).toContainText(
			"Debes confirmar la contraseña"
		);

		await expect.poll(() => signupRequests).toBe(0);
	});

	test("REG-03 username corto, email inválido y password corta muestran errores inline", async ({
		page,
	}) => {
		const user = makeUser();

		await page.goto("/register");
		await fillRegister(page, {
			...user,
			username: "ab",
			email: "correo-invalido",
			password: "short",
		});
		await submitRegister(page);

		await expect(fieldError(page, "username")).toContainText("al menos 3 caracteres");
		await expect(fieldError(page, "email")).toContainText("Correo electrónico inválido");
		await expect(fieldError(page, "password")).toContainText("al menos 8 caracteres");
	});

	test("REG-04 contraseñas distintas muestran error en confirmPassword", async ({ page }) => {
		const user = makeUser();

		await page.goto("/register");
		await fillRegister(page, user);
		await page.locator("#confirmPassword").fill("OtraPassword!2026");
		await submitRegister(page);

		await expect(fieldError(page, "confirmPassword")).toContainText("Las contraseñas no coinciden");
		await expect(page).toHaveURL(/\/register$/);
	});

	test("REG-05 username duplicado muestra el mensaje 409 del backend", async ({
		page,
		request,
	}) => {
		const existing = makeUser();
		await signUpViaApi(request, existing);

		const attempt = makeUser({ username: existing.username });

		await registerViaUi(page, attempt);

		await expect(globalAuthError(page)).toBeVisible();
		await expect(globalAuthError(page)).toContainText(
			`Ya existe un usuario con el nombre de usuario '${existing.username}'`
		);
		await expect(page).toHaveURL(/\/register$/);
	});

	test("REG-06 email duplicado con otra capitalización muestra 409", async ({ page, request }) => {
		const existing = makeUser();
		await signUpViaApi(request, existing);

		const attempt = makeUser({ email: existing.email.toUpperCase() });

		await registerViaUi(page, attempt);

		await expect(globalAuthError(page)).toBeVisible();
		await expect(globalAuthError(page)).toContainText("correo electrónico");
	});

	test("REG-07 normaliza username, nombres y email antes de guardar", async ({ page }) => {
		const user = makeUser();
		const rawUsername = `  ${user.username}  `;
		const rawEmail = `  ${user.email.toUpperCase()}  `;

		await page.goto("/register");
		await fillRegister(page, {
			...user,
			username: rawUsername,
			email: rawEmail,
			firstName: `  ${user.firstName}  `,
			lastName: `  ${user.lastName}  `,
		});
		await submitRegister(page);

		await expect(page).toHaveURL(new RegExp(`/${user.username}$`));
		await expect(page.getByRole("main").getByText(`@${user.username}`)).toBeVisible();
		await expect(page.getByText(user.email)).toBeVisible();
		await expect(
			page.getByRole("heading", { name: `${user.firstName} ${user.lastName}` })
		).toBeVisible();
	});

	test("REG-08 los dos toggles de contraseña son independientes", async ({ page }) => {
		await page.goto("/register");

		const password = page.locator("#password");
		const confirmPassword = page.locator("#confirmPassword");
		const passwordToggle = page.locator("#password").locator("..").getByRole("button");
		const confirmToggle = page.locator("#confirmPassword").locator("..").getByRole("button");

		await expect(password).toHaveAttribute("type", "password");
		await expect(confirmPassword).toHaveAttribute("type", "password");

		await passwordToggle.click();
		await expect(password).toHaveAttribute("type", "text");
		await expect(confirmPassword).toHaveAttribute("type", "password");
		await expect(passwordToggle).toHaveAttribute("aria-label", "Ocultar contraseña");

		await confirmToggle.click();
		await expect(password).toHaveAttribute("type", "text");
		await expect(confirmPassword).toHaveAttribute("type", "text");
		await expect(confirmToggle).toHaveAttribute("aria-label", "Ocultar contraseña");
	});

	test("REG-09 el botón se bloquea durante el envío y no duplica el signup", async ({ page }) => {
		const user = makeUser();
		let signupRequests = 0;

		page.on("request", (request) => {
			if (request.method() === "POST" && request.url().includes("/api/auth/signup/")) {
				signupRequests += 1;
			}
		});

		await page.route("**/api/auth/signup/", async (route) => {
			await delay(700);
			await route.continue();
		});

		await page.goto("/register");
		await fillRegister(page, user);

		const button = page.getByRole("button", { name: "Botón registrarse" });

		await button.click();
		await expect(page.getByRole("button", { name: "Procesando registro" })).toBeDisabled();
		await expect(page.getByRole("button", { name: "Procesando registro" })).toHaveAttribute(
			"aria-busy",
			"true"
		);

		await expect(page).toHaveURL(new RegExp(`/${user.username}$`));
		await expect.poll(() => signupRequests).toBe(1);
	});

	test("REG-10 fallo de red en signup muestra alerta y permite reintentar", async ({ page }) => {
		const user = makeUser();

		await page.route("**/api/auth/signup/", (route) => route.abort("failed"));

		await page.goto("/register");
		await fillRegister(page, user);
		await submitRegister(page);

		await expect(globalAuthError(page)).toBeVisible();
		await expect(page.getByRole("button", { name: "Botón registrarse" })).toBeEnabled();
		await expect(page).toHaveURL(/\/register$/);
	});

	test("REG-11 signup correcto con auto-login fallido lleva a login con aviso", async ({
		page,
	}) => {
		const user = makeUser();

		await page.route("**/api/auth/login/", (route) => route.abort("failed"));

		await registerViaUi(page, user);

		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByText("Cuenta creada")).toBeVisible();
	});
});
