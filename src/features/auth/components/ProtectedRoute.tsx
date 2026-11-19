"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CircleAlert, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle, Button } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api";
import { buildLoginPath } from "@/lib/auth/redirect";

import { useSession } from "../hooks/useSession";

interface ProtectedRouteProps {
	children: ReactNode;
}

/**
 * Client-side safety net for protected pages.
 *
 * The proxy blocks requests without an access cookie, but a cached page could
 * still render after the session ends. This guard redirects guests and shows a
 * retryable error when the session could not be checked.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const router = useRouter();
	const { session, isLoading, isError, error, refetch } = useSession();

	useEffect(() => {
		if (isLoading || isError || session) {
			return;
		}

		if (typeof window === "undefined") {
			return;
		}

		const { pathname, search } = window.location;
		router.replace(buildLoginPath(`${pathname}${search}`));
	}, [isError, isLoading, router, session]);

	if (isLoading) {
		return <SessionSkeleton />;
	}

	if (isError) {
		return (
			<div className="container mx-auto py-16">
				<Alert variant="destructive" icon={<CircleAlert size={18} />}>
					<AlertTitle>No pudimos verificar tu acceso</AlertTitle>
					<AlertDescription className="flex flex-col gap-3">
						<p>
							{getApiErrorMessage(
								error,
								"Ocurrió un problema al comprobar tu sesión. Inténtalo de nuevo."
							)}
						</p>
						<Button
							variant="outline"
							size="sm"
							className="self-start"
							onClick={() => void refetch()}
						>
							Reintentar
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!session) {
		return <SessionSkeleton />;
	}

	return <>{children}</>;
}

function SessionSkeleton() {
	return (
		<div
			className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-16"
			aria-busy="true"
			aria-label="Verificando acceso"
		>
			<LoaderCircle className="text-primary size-8 animate-spin" aria-hidden="true" />
			<p className="text-muted-foreground text-sm">Verificando acceso…</p>
		</div>
	);
}
