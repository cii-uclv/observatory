import { type APIRequestContext, type BrowserContext, type Cookie, expect } from "@playwright/test";

const DEFAULT_BASE_URL = "http://localhost:3000";

export function getBaseURL(): string {
	return process.env.E2E_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function getCookie(
	context: BrowserContext,
	name: string
): Promise<Cookie | undefined> {
	const cookies = await context.cookies();

	return cookies.find((cookie) => cookie.name === name);
}

export async function getAuthCookies(context: BrowserContext): Promise<{
	access?: Cookie;
	refresh?: Cookie;
}> {
	const cookies = await context.cookies();

	return {
		access: cookies.find((cookie) => cookie.name === "access_token"),
		refresh: cookies.find((cookie) => cookie.name === "refresh_token"),
	};
}

export async function removeCookie(context: BrowserContext, name: string): Promise<void> {
	await context.clearCookies({ name });
}

export async function corruptAccessToken(context: BrowserContext): Promise<void> {
	const baseURL = new URL(getBaseURL());

	await context.addCookies([
		{
			name: "access_token",
			value: "invalid.jwt.token",
			domain: baseURL.hostname,
			path: "/",
			httpOnly: true,
			secure: baseURL.protocol === "https:",
			sameSite: "Lax",
			expires: Math.floor(Date.now() / 1000) + 60 * 60,
		},
	]);
}

export async function corruptAuthCookies(context: BrowserContext): Promise<void> {
	const baseURL = new URL(getBaseURL());

	await context.addCookies([
		{
			name: "access_token",
			value: "invalid.jwt.token",
			domain: baseURL.hostname,
			path: "/",
			httpOnly: true,
			secure: baseURL.protocol === "https:",
			sameSite: "Lax",
			expires: Math.floor(Date.now() / 1000) + 60 * 60,
		},
		{
			name: "refresh_token",
			value: "invalid.refresh.token",
			domain: baseURL.hostname,
			path: "/api/auth/",
			httpOnly: true,
			secure: baseURL.protocol === "https:",
			sameSite: "Lax",
			expires: Math.floor(Date.now() / 1000) + 60 * 60,
		},
	]);
}

export async function expectAccessCookie(context: BrowserContext): Promise<Cookie> {
	const access = await getCookie(context, "access_token");

	expect(access, "access_token cookie should exist").toBeTruthy();

	return access as Cookie;
}

export async function expectRefreshCookie(context: BrowserContext): Promise<Cookie> {
	const refresh = await getCookie(context, "refresh_token");

	expect(refresh, "refresh_token cookie should exist").toBeTruthy();

	return refresh as Cookie;
}

/**
 * Calls refresh from an isolated API context using an explicit refresh cookie.
 * Useful to prove rotation/blacklist without touching the browser jar.
 */
export async function refreshWithCookie(
	request: APIRequestContext,
	refreshToken: string
): Promise<import("@playwright/test").APIResponse> {
	return request.post("/api/auth/refresh", {
		data: {},
		headers: { Cookie: `refresh_token=${refreshToken}` },
		failOnStatusCode: false,
	});
}

export async function logoutWithCookie(
	request: APIRequestContext,
	accessToken: string,
	refreshToken: string
): Promise<import("@playwright/test").APIResponse> {
	return request.post("/api/auth/logout", {
		data: {},
		headers: {
			Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
		},
		failOnStatusCode: false,
	});
}
