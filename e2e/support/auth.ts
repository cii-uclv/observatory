import { type APIRequestContext, expect, type Page } from "@playwright/test";

export interface TestUser {
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface AuthTokens {
	access: string;
	refresh: string;
	message: string;
	detail: string;
}

export interface ApiEnvelope<TData> {
	code: number;
	status: string;
	message: string;
	data: TData;
}

export interface ApiUser {
	user_id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string | null;
	birth_date: string | null;
	address: string | null;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
}

let userCounter = 0;

function uniqueSuffix(): string {
	userCounter += 1;

	return `${Date.now().toString(36)}${userCounter.toString(36)}${Math.random()
		.toString(36)
		.slice(2, 6)}`;
}

/**
 * Creates a unique user that satisfies both the frontend and backend rules.
 */
export function makeUser(overrides: Partial<TestUser> = {}): TestUser {
	const suffix = uniqueSuffix();
	const username = (`e2e_${suffix}`
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "")
		.slice(0, 40) || `e2e_${Date.now()}`) as string;

	return {
		username,
		email: `${username}@example.com`,
		password: "E2ePassword!2026",
		firstName: "E2E",
		lastName: `User ${suffix.slice(-4)}`,
		...overrides,
	};
}

export function toSignUpPayload(user: TestUser) {
	return {
		username: user.username,
		email: user.email,
		password: user.password,
		first_name: user.firstName,
		last_name: user.lastName,
	};
}

export function getApiBaseURL(): string {
	return process.env.E2E_BASE_URL ?? "http://localhost:3000";
}

async function expectJsonStatus(
	response: import("@playwright/test").APIResponse,
	expected: number
) {
	const text = await response.text();

	expect(response.status(), text).toBe(expected);

	return JSON.parse(text) as unknown;
}

export async function signUpViaApi(request: APIRequestContext, user: TestUser): Promise<ApiUser> {
	const response = await request.post("/api/auth/signup/", {
		data: toSignUpPayload(user),
		failOnStatusCode: false,
	});
	const body = (await expectJsonStatus(response, 201)) as ApiEnvelope<ApiUser> | ApiUser;

	return "data" in body ? body.data : body;
}

export async function loginViaApi(
	request: APIRequestContext,
	user: Pick<TestUser, "username" | "password">
): Promise<AuthTokens> {
	const response = await request.post("/api/auth/login/", {
		data: { username: user.username, password: user.password },
		failOnStatusCode: false,
	});
	const body = (await expectJsonStatus(response, 200)) as ApiEnvelope<AuthTokens>;

	return body.data;
}

export async function getCurrentUserViaApi(request: APIRequestContext): Promise<ApiUser> {
	const response = await request.get("/api/auth/me/", { failOnStatusCode: false });
	const body = (await expectJsonStatus(response, 200)) as ApiEnvelope<ApiUser>;

	return body.data;
}

export async function logoutViaApi(request: APIRequestContext): Promise<void> {
	const response = await request.post("/api/auth/logout/", {
		data: {},
		failOnStatusCode: false,
	});

	await expectJsonStatus(response, 200);
}

/**
 * Creates a user, logs in, and soft-deletes it so it can no longer authenticate.
 * The access token remains usable for the delete request itself.
 */
export async function createInactiveUser(
	request: APIRequestContext,
	overrides: Partial<TestUser> = {}
): Promise<TestUser> {
	const user = makeUser(overrides);
	const created = await signUpViaApi(request, user);
	const tokens = await loginViaApi(request, user);

	const response = await request.delete(`/api/users/${created.user_id}/`, {
		headers: { Authorization: `Bearer ${tokens.access}` },
		failOnStatusCode: false,
	});

	expect(response.status(), await response.text()).toBe(204);

	return user;
}

export async function softDeleteUser(
	request: APIRequestContext,
	accessToken: string,
	userId: number
): Promise<void> {
	await request.delete(`/api/users/${userId}/`, {
		headers: { Authorization: `Bearer ${accessToken}` },
		failOnStatusCode: false,
	});
}

export async function fillLogin(page: Page, user: Pick<TestUser, "username" | "password">) {
	await page.locator("#username").fill(user.username);
	await page.locator("#password").fill(user.password);
}

export async function submitLogin(page: Page) {
	await page.getByRole("button", { name: "Botón entrar" }).click();
}

export async function loginViaUi(
	page: Page,
	user: Pick<TestUser, "username" | "password">,
	path = "/login"
) {
	await page.goto(path);
	await fillLogin(page, user);
	await submitLogin(page);
}

export async function fillRegister(page: Page, user: TestUser) {
	await page.locator("#username").fill(user.username);
	await page.locator("#email").fill(user.email);
	await page.locator("#first_name").fill(user.firstName);
	await page.locator("#last_name").fill(user.lastName);
	await page.locator("#password").fill(user.password);
	await page.locator("#confirmPassword").fill(user.password);
}

export async function submitRegister(page: Page) {
	await page.getByRole("button", { name: "Botón registrarse" }).click();
}

export async function registerViaUi(page: Page, user: TestUser) {
	await page.goto("/register");
	await fillRegister(page, user);
	await submitRegister(page);
}

export async function openUserMenu(page: Page) {
	await page.getByRole("button", { name: /Menú de usuario de/ }).click();
}

export async function logoutViaUi(page: Page) {
	await openUserMenu(page);
	await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
}
