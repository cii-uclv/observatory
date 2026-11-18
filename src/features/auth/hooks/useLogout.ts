"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../service";

/**
 * Close the session on the server and clear all client-side data.
 */
export function useLogout() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: logout,
		// Always clear the UI, even if the server request failed or the
		// session had already expired.
		onSettled: () => {
			queryClient.clear();
			router.replace("/login");
			router.refresh();
		},
	});
}
