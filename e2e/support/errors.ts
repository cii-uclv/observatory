import { expect, type Page } from "@playwright/test";

/**
 * Global form error rendered by LoginForm/RegisterForm.
 */
export function globalAuthError(page: Page) {
	return page.locator('div[role="alert"][aria-live="assertive"]:not(#__next-route-announcer__)');
}

export function fieldError(page: Page, field: string) {
	return page.locator(`#${field}-error`);
}

export function fieldInput(page: Page, field: string) {
	return page.locator(`#${field}`);
}

export async function expectGlobalAuthError(page: Page, text?: string | RegExp) {
	const alert = globalAuthError(page);

	await expect(alert).toBeVisible();

	if (text) {
		await expect(alert).toContainText(text);
	}

	return alert;
}

export async function expectFieldError(page: Page, field: string, text: string | RegExp) {
	const error = fieldError(page, field);

	await expect(error).toBeVisible();
	await expect(error).toContainText(text);
	await expect(fieldInput(page, field)).toHaveAttribute("aria-invalid", "true");
	await expect(fieldInput(page, field)).toHaveAttribute(
		"aria-describedby",
		new RegExp(`${field}-error`)
	);

	return error;
}

/**
 * Collects requests matching a predicate while the test runs.
 */
export function trackRequests(page: Page, predicate: (url: string, method: string) => boolean) {
	const requests: string[] = [];

	page.on("request", (request) => {
		if (predicate(request.url(), request.method())) {
			requests.push(request.url());
		}
	});

	return requests;
}

export function countAuthRequests(page: Page, endpoint: string) {
	return trackRequests(page, (url, method) => method === "POST" && url.includes(endpoint));
}

export async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}
