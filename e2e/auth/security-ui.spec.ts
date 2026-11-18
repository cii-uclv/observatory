import { expect, test } from "@playwright/test";

import {
	fillLogin,
	fillRegister,
	loginViaApi,
	makeUser,
	registerViaUi,
	signUpViaApi,
	submitLogin,
	submitRegister,
} from "../support/auth";
import { getAuthCookies } from "../support/cookies";
import { expectFieldError, fieldError, globalAuthError } from "../support/errors";

test.describe("Seguridad de cookies y contrato de UI", () => {
	test("UI-01 cookies HttpOnly con path y SameSite correctos", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);

		await page.goto("/login");
		await fillLogin(page, user);
		await submitLogin(page);
		await expect(page).toHaveURL(/\/$|\/\?/);

		const { access, refresh } = await getAuthCookies(context);

		expect(access).toMatchObject({
			path: "/",
			httpOnly: true,
			sameSite: "Lax",
		});
		expect(refresh).toMatchObject({
			path: "/api/auth/",
			httpOnly: true,
			sameSite: "Lax",
		});
	});

	test("UI-02 los tokens no son accesibles desde JavaScript", async ({ page, context }) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto("/");

		const storage = await page.evaluate(() => ({
			cookie: document.cookie,
			localStorage: { ...localStorage },
			sessionStorage: { ...sessionStorage },
		}));

		expect(storage.cookie).not.toContain("access_token");
		expect(storage.cookie).not.toContain("refresh_token");
		expect(JSON.stringify(storage.localStorage)).not.toContain("access");
		expect(JSON.stringify(storage.sessionStorage)).not.toContain("access");
	});

	test("UI-03 access se envía a /api/auth y refresh no se filtra a /api/users", async ({
		page,
		context,
	}) => {
		const user = makeUser();
		await signUpViaApi(context.request, user);
		await loginViaApi(context.request, user);

		await page.goto("/");

		const meRequestPromise = page.waitForRequest(
			(request) => new URL(request.url()).pathname === "/api/auth/me"
		);
		const usersRequestPromise = page.waitForRequest(
			(request) => new URL(request.url()).pathname === "/api/users"
		);

		await page.evaluate(async () => {
			await fetch("/api/auth/me", { credentials: "include" }).catch(() => undefined);
			await fetch("/api/users", { credentials: "include" }).catch(() => undefined);
		});

		const meRequest = await meRequestPromise;
		const usersRequest = await usersRequestPromise;
		const meHeaders = await meRequest.allHeaders();
		const usersHeaders = await usersRequest.allHeaders();

		expect(meHeaders.cookie ?? "").toContain("access_token");
		expect(meHeaders.authorization).toBeUndefined();
		expect(usersHeaders.cookie ?? "").toContain("access_token");
		expect(usersHeaders.cookie ?? "").not.toContain("refresh_token");
	});

	test("UI-04 los errores de campo cumplen el contrato accesible", async ({ page }) => {
		await page.goto("/login");
		await submitLogin(page);

		await expectFieldError(page, "username", "El usuario o correo es obligatorio");
		await expectFieldError(page, "password", "La contraseña es obligatoria");

		const usernameError = fieldError(page, "username");

		await expect(usernameError).toHaveAttribute("role", "alert");
		await expect(page.locator("#username")).toHaveAttribute("aria-required", "true");
	});

	test("UI-05 los datos del usuario no se interpretan como HTML", async ({ page }) => {
		const payload = '<img src=x onerror="window.__e2eXss=1">';
		const user = makeUser({ firstName: payload, lastName: "Seguro" });

		await registerViaUi(page, user);

		await expect(page.locator("h2").filter({ hasText: payload })).toBeVisible();
		await expect(page.locator("h2 img")).toHaveCount(0);

		const xss = await page.evaluate(() => (window as Window & { __e2eXss?: number }).__e2eXss);

		expect(xss).toBeUndefined();
	});

	test("UI-06 el error de registro se limpia al iniciar un nuevo submit", async ({
		page,
		context,
	}) => {
		const existing = makeUser();
		await signUpViaApi(context.request, existing);

		const attempt = makeUser({ username: existing.username });

		await page.goto("/register");
		await fillRegister(page, attempt);
		await submitRegister(page);
		await expect(globalAuthError(page)).toBeVisible();

		await page.locator("#username").fill(makeUser().username);
		await page.route("**/api/auth/signup/", async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 700));
			await route.continue();
		});
		await submitRegister(page);

		await expect(globalAuthError(page)).toBeHidden();
	});
});
