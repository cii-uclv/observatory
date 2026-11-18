import { expect, test } from "@playwright/test";

import { fillLogin, loginViaApi, makeUser, signUpViaApi, submitLogin } from "../support/auth";
import { removeCookie } from "../support/cookies";

test.describe("Guardias de rutas protegidas", () => {
	for (const route of ["/modules", "/intranet_acces"]) {
		test(`GRD-01 invitado en ${route} redirige a login con next`, async ({ page }) => {
			await page.goto(route);

			const current = new URL(page.url());

			expect(current.pathname).toBe("/login");
			expect(current.searchParams.get("next")).toBe(route);
		});
	}

	test("GRD-02 tras login desde la guardia vuelve a la ruta original", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);

		await page.goto("/modules");

		const redirected = new URL(page.url());

		expect(redirected.pathname).toBe("/login");
		expect(redirected.searchParams.get("next")).toBe("/modules");

		await fillLogin(page, user);
		await submitLogin(page);

		await expect(page).toHaveURL(/\/modules$/);
		await expect(page.getByText("Modules Page")).toBeVisible();
	});

	test("GRD-03 autenticado accede a /modules", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto("/modules");

		await expect(page).toHaveURL(/\/modules$/);
		await expect(page.getByText("Modules Page")).toBeVisible();
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();
	});

	test("GRD-04 rutas públicas siguen accesibles sin sesión", async ({ page }) => {
		for (const route of ["/", "/about", "/contact"]) {
			const response = await page.goto(route);

			expect(response?.status(), route).toBeLessThan(400);
			expect(new URL(page.url()).pathname, route).toBe(route);
		}
	});

	test.fixme("GRD-05 refresh válido con access ausente recupera la ruta protegida", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await removeCookie(context, "access_token");
		await page.goto("/modules");

		// Comportamiento deseado: el refresh renueva la sesión y se queda en /modules.
		await expect(page).toHaveURL(/\/modules$/);
		await expect(page.getByText("Modules Page")).toBeVisible();
	});
});
