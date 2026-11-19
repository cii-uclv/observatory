import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
	testEnvironment: "node",
	testPathIgnorePatterns: [
		"/node_modules/",
		"/e2e/",
		"/playwright-report/",
		"/test-results/",
	],
};

export default createJestConfig(customJestConfig);
