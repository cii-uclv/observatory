import { expect, test } from "@playwright/test";

import { loginViaApi, logoutViaUi, makeUser, openUserMenu, signUpViaApi } from "../support/auth";
import {
	corruptAccessToken,
	getAuthCookies,
	logoutWithCookie,
	refreshWithCookie,
} from "../support/cookies";

test.describe("Logout", () => {
	test("OUT-01 logout desde el menú desktop limpia cookies y redirige", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto("/");
		await expect(page.getByRole("button", { name: /Menú de usuario de/ })).toBeVisible();

		await logoutViaUi(page);

		await expect(page).toHaveURL(/\/login$/);

		const cookies = await getAuthCookies(context);

		expect(cookies.access).toBeUndefined();
		expect(cookies.refresh).toBeUndefined();
		await expect(page.getByRole("link", { name: "Iniciar Sesión" })).toBeVisible();
	});

	test("OUT-02 el refresh usado antes del logout queda en blacklist", async ({
		page,
		context,
		request,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		const { refresh } = await getAuthCookies(context);

		expect(refresh).toBeTruthy();

		await page.goto("/");
		await openUserMenu(page);
		await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
		await expect(page).toHaveURL(/\/login$/);

		if (!refresh) {
			throw new Error("No se encontró la cookie refresh después del login");
		}
		const replay = await refreshWithCookie(request, refresh.value);

		expect(replay.status()).toBe(401);
	});

	test("OUT-03 después del logout no se puede volver a una ruta protegida", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto("/modules");
		await expect(page.getByText("Modules Page")).toBeVisible();

		await logoutViaUi(page);
		await expect(page).toHaveURL(/\/login$/);

		await page.goto("/modules");
		await expect(page).toHaveURL(/\/login\?/);

		const current = new URL(page.url());

		expect(current.pathname).toBe("/login");
		expect(current.searchParams.get("next")).toBe("/modules");
	});

	test("OUT-04 logout con access corrupto pero refresh válido revoca la sesión", async ({
		page,
		context,
		request,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		const { refresh } = await getAuthCookies(context);

		expect(refresh).toBeTruthy();

		await corruptAccessToken(context);
		await page.goto("/");

		const menu = page.getByRole("button", { name: /Menú de usuario de/ });

		await expect(menu).toBeVisible();

		await openUserMenu(page);
		await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
		await expect(page).toHaveURL(/\/login$/);

		if (!refresh) {
			throw new Error("No se encontró la cookie refresh después del login");
		}
		const replay = await refreshWithCookie(request, refresh.value);

		expect(replay.status()).toBe(401);
	});

	test("OUT-05 logout directo por API con cookies de sesión devuelve 200", async ({
		context,
		request,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		const { access, refresh } = await getAuthCookies(context);

		expect(access).toBeTruthy();
		expect(refresh).toBeTruthy();

		if (!refresh) {
			throw new Error("No se encontró la cookie refresh después del login");
		}
		if (!access) {
			throw new Error("No se encontró la cookie access después del login");
		}
		const response = await logoutWithCookie(request, access.value, refresh.value);

		expect(response.status()).toBe(200);
	});

	test("OUT-06 un logout con red caída no debe afirmar que la sesión se cerró", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.route("**/api/auth/logout*", (route) => route.abort("failed"));
		await page.goto("/");
		await logoutViaUi(page);

		await expect(page.getByText(/No se pudo cerrar sesión/i)).toBeVisible();
		await expect(page).not.toHaveURL(/\/login$/);

		const cookies = await getAuthCookies(context);

		expect(cookies.refresh).toBeTruthy();
	});
});
