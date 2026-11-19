import { expect, test } from "@playwright/test";

import { loginViaApi, makeUser, signUpViaApi } from "../support/auth";
import { expectRefreshCookie, removeCookie } from "../support/cookies";

test.describe("Recuperación transparente de sesión", () => {
	test("REC-01 con refresh válido vuelve a la ruta original conservando la query", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await removeCookie(context, "access_token");
		await page.goto("/modules?tab=activos");

		await expect(page).toHaveURL(/\/modules\?tab=activos$/);
		await expect(page.getByText("Modules Page")).toBeVisible();
		await expectRefreshCookie(context);
	});

	test("REC-02 un fallo transitorio de refresh no borra la sesión y permite reintentar", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await removeCookie(context, "access_token");
		await page.route("**/api/auth/refresh*", (route) =>
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

		await page.goto("/modules?tab=activos");

		await expect(page.getByText("No pudimos verificar tu sesión")).toBeVisible();
		await expect(page.getByText("Servidor no disponible")).toBeVisible();
		await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
		await expectRefreshCookie(context);

		await page.unroute("**/api/auth/refresh*");
		await page.getByRole("button", { name: "Reintentar" }).click();

		await expect(page).toHaveURL(/\/modules\?tab=activos$/);
		await expect(page.getByText("Modules Page")).toBeVisible();
	});

	test("REC-03 next externo en recover no permite un open redirect", async ({ page }) => {
		await page.goto(`/auth/recover?next=${encodeURIComponent("https://evil.example")}`);

		await expect(page).toHaveURL(/\/login$/);

		const current = new URL(page.url());

		expect(current.pathname).toBe("/login");
		expect(current.searchParams.get("next")).toBeNull();
	});
});
