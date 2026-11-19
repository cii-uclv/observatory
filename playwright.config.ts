import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	timeout: 30_000,
	expect: {
		timeout: 10_000,
	},
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
		launchOptions: {
			slowMo: 500, // ms entre acciones
		},
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			testIgnore: /logout-mobile\.spec\.ts/,
		},
		{
			name: "mobile-chromium",
			use: { ...devices["Pixel 7"] },
			testMatch: /logout-mobile\.spec\.ts/,
		},
	],
	webServer: process.env.E2E_NO_WEBSERVER
		? undefined
		: {
				command: "pnpm dev",
				url: baseURL,
				reuseExistingServer: true,
				timeout: 120_000,
			},
});
