import { ApiClient } from "../api-client";

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

const originalFetch = global.fetch;

afterEach(() => {
	global.fetch = originalFetch;
	jest.restoreAllMocks();
});

describe("ApiClient 401 pipeline", () => {
	it("refreshes the session and retries the original request once", async () => {
		const fetchMock = jest
			.fn()
			.mockResolvedValueOnce(jsonResponse({ code: 401, status: "UNAUTHORIZED" }, 401))
			.mockResolvedValueOnce(jsonResponse({ code: 200, status: "OK", data: {} }))
			.mockResolvedValueOnce(jsonResponse({ code: 200, status: "OK", data: { ok: true } }));

		global.fetch = fetchMock as unknown as typeof fetch;

		const client = new ApiClient({ baseURL: "http://api.test", isServer: false });
		const result = await client.get<{ ok: boolean }>("/users");

		expect(result).toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(String(fetchMock.mock.calls[1][0])).toContain("/auth/refresh");
	});

	it("shares a single refresh between concurrent callers", async () => {
		let resolveRefresh!: (response: Response) => void;

		const fetchMock = jest.fn().mockImplementation(
			() =>
				new Promise<Response>((resolve) => {
					resolveRefresh = resolve;
				})
		);

		global.fetch = fetchMock as unknown as typeof fetch;

		const client = new ApiClient({ baseURL: "http://api.test", isServer: false });
		const first = client.refreshSession();
		const second = client.refreshSession();

		await new Promise((resolve) => setImmediate(resolve));

		expect(fetchMock).toHaveBeenCalledTimes(1);

		resolveRefresh(jsonResponse({ code: 200, status: "OK", data: {} }));

		const [firstOutcome, secondOutcome] = await Promise.all([first, second]);

		expect(firstOutcome.status).toBe("refreshed");
		expect(secondOutcome.status).toBe("refreshed");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("classifies an invalid refresh as no-session", async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce(
				jsonResponse({ code: 401, status: "UNAUTHORIZED", data: null }, 401)
			) as unknown as typeof fetch;

		const client = new ApiClient({ baseURL: "http://api.test", isServer: false });
		const outcome = await client.refreshSession();

		expect(outcome.status).toBe("no-session");
	});

	it("classifies a network failure as unavailable", async () => {
		global.fetch = jest
			.fn()
			.mockRejectedValueOnce(new TypeError("fetch failed")) as unknown as typeof fetch;

		const client = new ApiClient({ baseURL: "http://api.test", isServer: false });
		const outcome = await client.refreshSession();

		expect(outcome.status).toBe("unavailable");
	});

	it("does not refresh login failures", async () => {
		const fetchMock = jest
			.fn()
			.mockResolvedValueOnce(
				jsonResponse({ code: 401, status: "UNAUTHORIZED", message: "Credenciales inválidas" }, 401)
			);

		global.fetch = fetchMock as unknown as typeof fetch;

		const client = new ApiClient({ baseURL: "http://api.test", isServer: false });

		await expect(client.post("/auth/login", { username: "x" })).rejects.toMatchObject({
			status: 401,
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
