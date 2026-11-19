import { expect, test } from "@playwright/test";

import { loginViaApi, makeUser, signUpViaApi } from "../support/auth";
import { getAuthCookies } from "../support/cookies";

test.describe("Logout móvil", () => {
	test("OUT-04 móvil: abre el menú hamburguesa y cierra sesión", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto("/");

		await page.getByRole("button", { name: "Abrir menú de navegación" }).click();
		await page.getByRole("button", { name: "Cerrar sesión" }).click();

		await expect(page).toHaveURL(/\/login$/);

		const cookies = await getAuthCookies(context);

		expect(cookies.access).toBeUndefined();
		expect(cookies.refresh).toBeUndefined();
	});
});
