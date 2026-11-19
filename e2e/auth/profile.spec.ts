import { expect, test } from "@playwright/test";

import {
	getCurrentUserViaApi,
	loginViaApi,
	makeUser,
	registerViaUi,
	signUpViaApi,
} from "../support/auth";

test.describe("Perfil del usuario", () => {
	test("PRF-01 el perfil muestra los datos de /auth/me", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		const me = await getCurrentUserViaApi(context.request);

		await page.goto(`/${user.username}`);

		await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
		await expect(
			page.getByRole("heading", { name: `${user.firstName} ${user.lastName}` })
		).toBeVisible();
		await expect(page.getByRole("main").getByText(`@${user.username}`)).toBeVisible();
		await expect(page.getByText(`ID de usuario: ${me.user_id}`)).toBeVisible();
		await expect(page.getByText(user.email)).toBeVisible();
		await expect(page.getByText("Sin rol principal")).toBeVisible();
		await expect(page.getByText("No registrado").first()).toBeVisible();
	});

	test("PRF-02 un usuario recién registrado no tiene rol principal", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto(`/${user.username}`);

		await expect(page.getByText("Sin rol principal")).toBeVisible();
		await expect(page.getByText("Administrador del Sistema")).toBeHidden();
	});

	test("PRF-03 un username ajeno no muestra el perfil de la sesión actual", async ({
		page,
		context,
	}) => {
		const owner = makeUser();
		const other = makeUser();

		await signUpViaApi(context.request, owner);
		await signUpViaApi(context.request, other);
		await loginViaApi(context.request, owner);

		await page.goto(`/${other.username}`);

		await expect(page).toHaveURL(new RegExp(`/${owner.username}$`));
	});

	test("PRF-04 sin sesión el perfil muestra la alerta de invitado", async ({ page }) => {
		await page.goto("/usuario-invitado-e2e");

		await expect(page.getByText("No hay una sesión activa")).toBeVisible();
		await expect(
			page.getByText("Inicie sesión para consultar los datos de su cuenta.")
		).toBeVisible();
		await expect(page.getByRole("link", { name: "Iniciar sesión" }).first()).toBeVisible();
	});

	test("PRF-05 un fallo al cargar /auth/me muestra error recuperable", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.route("**/api/auth/me*", (route) =>
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

		await page.goto(`/${user.username}`);

		await expect(page.getByText("No se pudo cargar el perfil")).toBeVisible();
		await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
	});

	test("PRF-08 un 403 al cargar /auth/me muestra el mensaje de permisos", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.route("**/api/auth/me*", (route) =>
			route.fulfill({
				status: 403,
				contentType: "application/json",
				body: JSON.stringify({
					code: 403,
					status: "VALIDATION_ERROR",
					message: "Error en la validacion de datos",
					data: { detail: "Acceso denegado. No tiene permisos para ver este recurso." },
				}),
			})
		);

		await page.goto(`/${user.username}`);

		await expect(page.getByText("No se pudo cargar el perfil")).toBeVisible();
		await expect(
			page.getByText("Acceso denegado. No tiene permisos para ver este recurso.")
		).toBeVisible();
		await expect(page.getByText("No hay una sesión activa")).toBeHidden();
	});

	test("PRF-07 username con caracteres reservados no queda en skeleton", async ({ page }) => {
		const base = makeUser();
		const user = { ...base, username: `${base.username}#x` };

		await registerViaUi(page, user);

		await expect(page.getByRole("main").getByText(`@${user.username}`)).toBeVisible();
	});

	test("PRF-06 nombres con acentos se renderizan correctamente", async ({ page }) => {
		const user = makeUser({ firstName: "José", lastName: "Pérez Núñez" });

		await registerViaUi(page, user);

		await expect(page.getByRole("heading", { name: "José Pérez Núñez" })).toBeVisible();
		await expect(page.getByRole("main").getByText(`@${user.username}`)).toBeVisible();
	});
});
