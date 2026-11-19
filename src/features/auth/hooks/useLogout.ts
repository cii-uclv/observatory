"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notifySessionLogout } from "@/lib/auth/session-events";

import { logout } from "../service";

/**
 * Close the session on the server and clear all client-side data.
 *
 * A 401 from `/auth/logout/` is already handled by the API client
 * (refresh + retry, then session-expired event), so this hook only clears
 * the UI on success.
 */
export function useLogout() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const clearSession = () => {
		if (notifySessionLogout()) {
			return;
		}

		queryClient.clear();
		router.replace("/login");
		router.refresh();
	};

	return useMutation({
		mutationFn: logout,
		onSuccess: clearSession,
	});
}
