"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api";

import { logout } from "../service";

/**
 * Close the session on the server and clear all client-side data.
 */
export function useLogout() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const clearSession = () => {
		queryClient.clear();
		router.replace("/");
		router.refresh();
	};

	return useMutation({
		mutationFn: logout,
		onSuccess: clearSession,
		// A 401 means the session was already gone: clear the stale UI too.
		onError: (error) => {
			if (error instanceof ApiError && error.status === 401) {
				clearSession();
			}
		},
	});
}
