import { buildLoginPath, buildProfilePath, sanitizeNextPath } from "../redirect";

describe("sanitizeNextPath", () => {
	it("accepts internal paths", () => {
		expect(sanitizeNextPath("/modules?tab=1")).toBe("/modules?tab=1");
	});

	it("rejects external and protocol-relative paths", () => {
		expect(sanitizeNextPath("https://evil.test")).toBeNull();
		expect(sanitizeNextPath("//evil.test")).toBeNull();
		expect(sanitizeNextPath("/\\evil.test")).toBeNull();
	});

	it("rejects auth-flow destinations", () => {
		expect(sanitizeNextPath("/login?next=/x")).toBeNull();
		expect(sanitizeNextPath("/auth/recover?next=/x")).toBeNull();
	});

	it("ignores empty values", () => {
		expect(sanitizeNextPath()).toBeNull();
		expect(sanitizeNextPath("")).toBeNull();
	});
});

describe("buildLoginPath", () => {
	it("preserves a safe next path", () => {
		expect(buildLoginPath("/modules", { expired: true })).toBe("/login?next=%2Fmodules&expired=1");
	});

	it("drops unsafe next paths", () => {
		expect(buildLoginPath("//evil.test")).toBe("/login");
	});
});

describe("buildProfilePath", () => {
	it("encodes reserved URL characters in usernames", () => {
		expect(buildProfilePath("user#name")).toBe("/user%23name");
		expect(buildProfilePath("user?name")).toBe("/user%3Fname");
	});

	it("keeps simple usernames unchanged", () => {
		expect(buildProfilePath("e2e_user")).toBe("/e2e_user");
	});
});
