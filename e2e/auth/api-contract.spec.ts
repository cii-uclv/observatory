import { expect, test } from "@playwright/test";

import { loginViaApi, makeUser, signUpViaApi, toSignUpPayload } from "../support/auth";
import { getAuthCookies, refreshWithCookie } from "../support/cookies";

test.describe("Contrato de autenticación a través del rewrite /api", () => {
	test("API-01 login exitoso devuelve envelope y cookies HttpOnly", async ({ context }) => {
		const user = makeUser();
		const api = context.request;
		await signUpViaApi(api, user);

		const response = await api.post("/api/auth/login/", {
			data: { username: user.username, password: user.password },
		});
		const body = await response.json();

		expect(response.status()).toBe(200);
		expect(body).toMatchObject({
			code: 200,
			status: "OK",
			data: {
				message: expect.any(String),
				detail: expect.any(String),
				access: expect.any(String),
				refresh: expect.any(String),
			},
		});

		const { access, refresh } = await getAuthCookies(context);

		expect(access).toMatchObject({
			name: "access_token",
			path: "/",
			httpOnly: true,
			sameSite: "Lax",
		});
		expect(refresh).toMatchObject({
			name: "refresh_token",
			path: "/api/auth/",
			httpOnly: true,
			sameSite: "Lax",
		});
	});

	test("API-02 login inválido e incompleto devuelve 401/400 con envelope", async ({ request }) => {
		const user = makeUser();
		await signUpViaApi(request, user);

		const wrongPassword = await request.post("/api/auth/login/", {
			data: { username: user.username, password: "WrongPassword!" },
			failOnStatusCode: false,
		});
		const wrongBody = await wrongPassword.json();

		expect(wrongPassword.status()).toBe(401);
		expect(wrongBody).toMatchObject({
			code: 401,
			status: "UNAUTHORIZED",
			message: "Credenciales de autenticación inválidas.",
		});

		const missingPassword = await request.post("/api/auth/login/", {
			data: { username: user.username },
			failOnStatusCode: false,
		});
		const missingBody = await missingPassword.json();

		expect(missingPassword.status()).toBe(400);
		expect(missingBody).toMatchObject({
			code: 400,
			status: "VALIDATION_ERROR",
			data: { password: expect.any(Array) },
		});
	});

	test("API-03 /auth/me responde 401 sin sesión y 200 con sesión", async ({ request, context }) => {
		const anonymous = await request.get("/api/auth/me/", { failOnStatusCode: false });

		expect(anonymous.status()).toBe(401);
		expect(await anonymous.json()).toMatchObject({ code: 401 });

		const api = context.request;
		const user = makeUser();
		await signUpViaApi(api, user);
		await loginViaApi(api, user);

		const authenticated = await api.get("/api/auth/me/");

		expect(authenticated.status()).toBe(200);
		expect(await authenticated.json()).toMatchObject({
			code: 200,
			status: "OK",
			data: {
				user_id: expect.any(Number),
				username: user.username,
				email: user.email,
				first_name: user.firstName,
				last_name: user.lastName,
				roles: expect.any(Array),
			},
		});
	});

	test("API-04 refresh rota tokens y bloquea el refresh anterior", async ({ request, context }) => {
		const api = context.request;
		const user = makeUser();
		await signUpViaApi(api, user);
		await loginViaApi(api, user);

		const { refresh: oldRefresh } = await getAuthCookies(context);

		expect(oldRefresh).toBeTruthy();

		const refreshResponse = await api.post("/api/auth/refresh/", { data: {} });

		expect(refreshResponse.status()).toBe(200);

		const { refresh: newRefresh } = await getAuthCookies(context);

		expect(newRefresh).toBeTruthy();
		expect(newRefresh?.value).not.toBe(oldRefresh?.value);

		if (!oldRefresh) {
			throw new Error("No se encontró la cookie refresh anterior");
		}

		const replay = await refreshWithCookie(request, oldRefresh.value);

		expect(replay.status()).toBe(401);
	});

	test("API-05 logout limpia cookies y blacklistea el refresh", async ({ request, context }) => {
		const api = context.request;
		const user = makeUser();
		await signUpViaApi(api, user);
		await loginViaApi(api, user);

		const { access, refresh } = await getAuthCookies(context);

		expect(access).toBeTruthy();
		expect(refresh).toBeTruthy();

		const logoutResponse = await api.post("/api/auth/logout/", { data: {} });

		expect(logoutResponse.status()).toBe(200);

		const afterLogout = await getAuthCookies(context);

		expect(afterLogout.access).toBeUndefined();
		expect(afterLogout.refresh).toBeUndefined();

		if (!refresh) {
			throw new Error("No se encontró la cookie refresh después del login");
		}

		const replay = await refreshWithCookie(request, refresh.value);

		expect(replay.status()).toBe(401);

		const response = await request.post("/api/auth/logout/", { data: {} });

		expect(response.status()).toBe(401);
	});

	test("API-06 signup devuelve 201, valida datos y detecta duplicados", async ({ request }) => {
		const user = makeUser();

		const created = await request.post("/api/auth/signup/", {
			data: toSignUpPayload(user),
			failOnStatusCode: false,
		});
		const createdBody = await created.json();

		expect(created.status()).toBe(201);
		expect(createdBody).toMatchObject({
			code: 201,
			data: {
				user_id: expect.any(Number),
				username: user.username,
				email: user.email,
				is_active: true,
				is_staff: false,
				is_superuser: false,
			},
		});

		const duplicate = await request.post("/api/auth/signup/", {
			data: {
				...toSignUpPayload(user),
				email: `other_${user.email}`,
			},
			failOnStatusCode: false,
		});
		const duplicateBody = await duplicate.json();

		expect(duplicate.status()).toBe(409);
		expect(duplicateBody).toMatchObject({
			code: 409,
			status: "CONFLICT",
			message: expect.stringContaining(user.username),
		});

		const invalid = await request.post("/api/auth/signup/", {
			data: {
				username: "ab",
				email: "not-an-email",
				password: "short",
				first_name: "",
				last_name: "",
			},
			failOnStatusCode: false,
		});
		const invalidBody = await invalid.json();

		expect(invalid.status()).toBe(400);
		expect(invalidBody).toMatchObject({
			code: 400,
			status: "VALIDATION_ERROR",
			data: expect.any(Object),
		});
	});
});
