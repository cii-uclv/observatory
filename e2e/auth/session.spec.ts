import { expect, test } from "@playwright/test";

import { loginViaApi, logoutViaUi, makeUser, signUpViaApi } from "../support/auth";
import {
	corruptAccessToken,
	corruptAuthCookies,
	getAuthCookies,
	refreshWithCookie,
} from "../support/cookies";

test.describe("Sesión, access token y refresh", () => {
	test("SES-01 la sesión persiste en reload y en una nueva pestaña", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto(`/${user.username}`);
		await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();

		await page.reload();
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();

		const secondPage = await context.newPage();

		await secondPage.goto(`/${user.username}`);
		await expect(secondPage.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
		await expect(secondPage.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();

		await secondPage.close();
	});

	test("SES-02 access inválido con refresh válido se renueva automáticamente", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		const before = await getAuthCookies(context);

		expect(before.refresh).toBeTruthy();
		expect(before.access).toBeTruthy();

		await corruptAccessToken(context);

		const refreshResponse = page.waitForResponse(
			(response) =>
				response.url().includes("/api/auth/refresh") &&
				response.request().method() === "POST" &&
				response.status() === 200
		);

		await page.goto(`/${user.username}`);

		const refresh = await refreshResponse;

		expect(refresh.status()).toBe(200);
		await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();

		const after = await getAuthCookies(context);

		expect(after.access).toBeTruthy();
		expect(after.access?.value).not.toBe("invalid.jwt.token");
	});

	test("SES-03 la rotación invalida el refresh anterior", async ({ page, context, request }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		const before = await getAuthCookies(context);

		expect(before.refresh).toBeTruthy();

		await corruptAccessToken(context);

		const refreshResponse = page.waitForResponse(
			(response) =>
				response.url().includes("/api/auth/refresh") &&
				response.request().method() === "POST" &&
				response.status() === 200
		);

		await page.goto(`/${user.username}`);
		await refreshResponse;

		const after = await getAuthCookies(context);

		expect(after.refresh).toBeTruthy();
		expect(after.refresh?.value).not.toBe(before.refresh?.value);

		if (!before.refresh) {
			throw new Error("No se encontró la cookie refresh anterior");
		}
		const replay = await refreshWithCookie(request, before.refresh.value);

		expect(replay.status()).toBe(401);
	});

	test("SES-04 sin sesión el perfil muestra estado invitado sin bucles", async ({ page }) => {
		let refreshRequests = 0;

		page.on("request", (request) => {
			if (request.method() === "POST" && request.url().includes("/api/auth/refresh")) {
				refreshRequests += 1;
			}
		});

		await page.goto("/no-existe-e2e");

		await expect(page.getByText("No hay una sesión activa")).toBeVisible();
		await expect(page.getByRole("link", { name: "Iniciar sesión" }).first()).toBeVisible();

		await page.waitForTimeout(800);
		expect(refreshRequests).toBeLessThanOrEqual(1);
	});

	test("SES-05 access y refresh inválidos terminan en estado invitado", async ({
		page,
		context,
	}) => {
		await corruptAuthCookies(context);
		await page.goto("/no-existe-e2e");

		await expect(page.getByText("No hay una sesión activa")).toBeVisible();
		await expect(page.getByText("Mi perfil")).toBeVisible();
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeHidden();
	});

	test("SES-06 la sesión no aparece en el HTML servido como datos sensibles", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		const response = await page.goto("/");
		const html = (await response?.text()) ?? "";

		expect(html).not.toContain('"access":');
		expect(html).not.toContain('"refresh":');
		expect(html).not.toContain(user.email);
	});

	test("SES-07 un fallo 500 de /auth/me muestra error recuperable en el perfil", async ({
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
		await expect(page.getByText("No hay una sesión activa")).toBeHidden();
	});

	test("SES-08 logout en una pestaña cierra la sesión en las demás", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto("/");
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();

		const secondPage = await context.newPage();

		await secondPage.goto("/");
		await expect(secondPage.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();

		await logoutViaUi(page);

		await expect(page).toHaveURL(/\/login$/);
		await expect(secondPage).toHaveURL(/\/login$/);
		await expect(secondPage.getByRole("button", { name: /Menú de usuario de/ })).toBeHidden();
	});
});
