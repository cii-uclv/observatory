"use client";

import { useCallback } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { defaultClient } from "@/lib/api/api-client";

import { SESSION_QUERY_KEY } from "../const/query-keys";
import { getSession } from "../service";

/**
 * Current authenticated session (`null` when there is none).
 *
 * The query never retries: a 401 means "guest", not a transient failure.
 */
export function useSession() {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: SESSION_QUERY_KEY,
		queryFn: getSession,
		retry: false,
		staleTime: 60_000,
	});

	const refreshSession = useCallback(async (): Promise<boolean> => {
		const outcome = await defaultClient.refreshSession();
		const refreshed = outcome.status === "refreshed";

		if (refreshed) {
			await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
		}

		return refreshed;
	}, [queryClient]);

	const invalidateSession = useCallback(
		() => queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY }),
		[queryClient]
	);

	return {
		session: query.data ?? null,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isAuthenticated: Boolean(query.data),
		refreshSession,
		invalidateSession,
		refetch: query.refetch,
	};
}
