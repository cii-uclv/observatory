import { expect, test } from "@playwright/test";

import {
	createInactiveUser,
	fillLogin,
	makeUser,
	openUserMenu,
	signUpViaApi,
	submitLogin,
} from "../support/auth";
import { countAuthRequests, fieldError, globalAuthError } from "../support/errors";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

test.describe("Login de usuarios", () => {
	test("LOG-01 login con username redirige al inicio y persiste la sesión", async ({
		page,
		request,
	}) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.goto("/login");
		await fillLogin(page, user);
		await submitLogin(page);

		await expect(page).toHaveURL(`${BASE_URL}/`);
		const menu = page.getByRole("button", { name: /Menú de usuario de/ });

		await expect(menu).toBeVisible();
		await expect(menu).toContainText(`${user.firstName} ${user.lastName}`);

		await page.reload();

		await expect(menu).toBeVisible();
		await expect(menu).toContainText(user.firstName);
	});

	test("LOG-02 login con email en mayúsculas y espacios funciona", async ({ page, request }) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.goto("/login");
		await fillLogin(page, {
			username: `  ${user.email.toUpperCase()}  `,
			password: user.password,
		});
		await submitLogin(page);

		await expect(page).toHaveURL(`${BASE_URL}/`);
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();
	});

	test("LOG-03 campos vacíos muestran errores y no llaman al backend", async ({ page }) => {
		const loginRequests = countAuthRequests(page, "/api/auth/login/");

		await page.goto("/login");
		await submitLogin(page);

		await expect(fieldError(page, "username")).toContainText("El usuario o correo es obligatorio");
		await expect(fieldError(page, "password")).toContainText("La contraseña es obligatoria");
		await expect.poll(() => loginRequests.length).toBe(0);
	});

	test("LOG-04 password incorrecta muestra el mensaje 401 y permanece en login", async ({
		page,
		request,
	}) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.goto("/login");
		await fillLogin(page, { username: user.username, password: "WrongPassword!" });
		await submitLogin(page);

		await expect(globalAuthError(page)).toContainText("Credenciales de autenticación inválidas.");
		await expect(page).toHaveURL(/\/login$/);
	});

	test("LOG-05 usuario inexistente no revela si la cuenta existe", async ({ page }) => {
		const user = makeUser();

		await page.goto("/login");
		await fillLogin(page, user);
		await submitLogin(page);

		await expect(globalAuthError(page)).toContainText("Credenciales de autenticación inválidas.");
	});

	test.fixme("LOG-06 usuario inactivo muestra el mensaje de cuenta dada de baja", async ({
		page,
		context,
	}) => {
		// Requiere fixture de administrador o acceso directo a BD: la API
		// pública no permite desactivar una cuenta (DELETE propio da 500).
		const user = await createInactiveUser(context.request);

		await page.goto("/login");
		await fillLogin(page, user);
		await submitLogin(page);

		await expect(globalAuthError(page)).toContainText("inactiva o dada de baja");
	});

	test("LOG-07 toggle de contraseña y estado de carga del botón", async ({ page, request }) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.route("**/api/auth/login/", async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 700));
			await route.continue();
		});

		await page.goto("/login");

		const password = page.locator("#password");
		const toggle = page.locator("#password").locator("..").getByRole("button");

		await expect(password).toHaveAttribute("type", "password");
		await toggle.click();
		await expect(password).toHaveAttribute("type", "text");
		await expect(toggle).toHaveAttribute("aria-label", "Ocultar contraseña");

		await fillLogin(page, user);
		await submitLogin(page);

		await expect(page.getByRole("button", { name: "Procesando login" })).toBeDisabled();
		await expect(page.getByRole("button", { name: "Procesando login" })).toHaveAttribute(
			"aria-busy",
			"true"
		);

		await expect(page).toHaveURL(`${BASE_URL}/`);
	});

	test("LOG-08 respeta ?next=/modules y conserva la query", async ({ page, request }) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.goto("/login?next=%2Fmodules%3Fx%3D1");
		await fillLogin(page, user);
		await submitLogin(page);

		await expect(page).toHaveURL(`${BASE_URL}/modules?x=1`);
		await expect(page.getByText("Modules Page")).toBeVisible();
	});

	test("LOG-09 rechaza next externos y rutas de login", async ({ page, request }) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		const payloads = ["//evil.com", "https://evil.com", "/login", "/login?x=1"];

		for (const payload of payloads) {
			await page.goto(`/login?next=${encodeURIComponent(payload)}`);
			await fillLogin(page, user);
			await submitLogin(page);
			await expect(page, `payload: ${payload}`).toHaveURL(`${BASE_URL}/`);

			const current = new URL(page.url());

			expect(current.origin, `payload: ${payload}`).toBe(new URL(BASE_URL).origin);
			expect(current.pathname, `payload: ${payload}`).toBe("/");
		}
	});

	test("LOG-09b rechaza next con barra invertida", async ({ page, request }) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.goto(`/login?next=${encodeURIComponent("/\\evil.com")}`);
		await fillLogin(page, user);
		await submitLogin(page);
		await expect(page).toHaveURL(`${BASE_URL}/`);

		const current = new URL(page.url());

		expect(current.origin).toBe(new URL(BASE_URL).origin);
		expect(current.pathname).toBe("/");
	});

	test("LOG-10 aviso ?registered=1 se muestra y limpia el query param", async ({ page }) => {
		await page.goto("/login?registered=1");

		await expect(page.getByText("Cuenta creada")).toBeVisible();
		await expect(page.getByText("Ya puedes iniciar sesión con tus credenciales.")).toBeVisible();
		await expect(page).not.toHaveURL(/registered=1/);
	});

	test("LOG-11 error 500 y caída de red muestran alerta y permiten reintentar", async ({
		page,
		request,
	}) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.route("**/api/auth/login/", (route) =>
			route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({
					code: 500,
					status: "INTERNAL_SERVER_ERROR",
					message: "Servidor no disponible",
					data: null,
				}),
			})
		);

		await page.goto("/login");
		await fillLogin(page, user);
		await submitLogin(page);

		await expect(globalAuthError(page)).toContainText("Servidor no disponible");
		await expect(page.getByRole("button", { name: "Botón entrar" })).toBeEnabled();

		await page.unroute("**/api/auth/login/");
		await page.route("**/api/auth/login/", (route) => route.abort("failed"));

		await submitLogin(page);

		await expect(globalAuthError(page)).toBeVisible();
		await expect(page.getByRole("button", { name: "Botón entrar" })).toBeEnabled();
	});

	test("LOG-12 el menú de usuario muestra el nombre y permite abrir el perfil", async ({
		page,
		request,
	}) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		await page.goto("/login");
		await fillLogin(page, user);
		await submitLogin(page);
		await openUserMenu(page);

		await expect(page.getByRole("menuitem", { name: "Mi perfil" })).toBeVisible();
		await page.getByRole("menuitem", { name: "Mi perfil" }).click();

		await expect(page).toHaveURL(`${BASE_URL}/${user.username}`);
		await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
	});
});
