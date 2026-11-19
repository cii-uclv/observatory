"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { buildLoginPath } from "@/lib/auth/redirect";
import { subscribeAuthEvents } from "@/lib/auth/session-events";

import { SESSION_QUERY_KEY } from "../const/query-keys";

/**
 * Bridges API-client session events into React Query and the Next.js router.
 */
export function AuthEventBridge() {
	const router = useRouter();
	const queryClient = useQueryClient();

	useEffect(
		() =>
			subscribeAuthEvents((event) => {
				switch (event.type) {
					case "session:refreshed":
						void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
						break;

					case "session:expired": {
						queryClient.clear();

						if (typeof window === "undefined") {
							return;
						}

						const { pathname, search } = window.location;

						if (pathname.startsWith("/login") || pathname.startsWith("/auth/recover")) {
							return;
						}

						router.replace(buildLoginPath(`${pathname}${search}`, { expired: true }));
						router.refresh();
						break;
					}

					case "session:logout":
						queryClient.clear();
						router.replace("/login");
						router.refresh();
						break;

					case "session:unavailable":
						break;
				}
			}),
		[queryClient, router]
	);

	return null;
}
