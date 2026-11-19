"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle } from "lucide-react";

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	buttonVariants,
	Card,
	CardBody,
} from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api";
import { buildLoginPath, sanitizeNextPath } from "@/lib/auth/redirect";

import { RECOVER_QUERY_KEY } from "../const/query-keys";
import { getSession } from "../service";

interface RecoverSessionProps {
	nextPath: string | null;
}

/**
 * Transparent recovery step for the proxy guard.
 *
 * The proxy cannot read the refresh cookie, so it sends protected requests
 * here. This component checks the real session and either returns the user to
 * the requested page or falls back to the login screen.
 */
export function RecoverSession({ nextPath }: RecoverSessionProps) {
	const router = useRouter();
	const safeNext = sanitizeNextPath(nextPath) ?? "/";
	const loginPath = buildLoginPath(nextPath);

	const query = useQuery({
		queryKey: [...RECOVER_QUERY_KEY, nextPath],
		queryFn: getSession,
		retry: false,
		staleTime: 0,
		refetchOnMount: "always",
	});

	const isRedirecting = query.isSuccess;

	useEffect(() => {
		if (!isRedirecting) {
			return;
		}

		router.replace(query.data ? safeNext : loginPath);
		router.refresh();
	}, [isRedirecting, loginPath, query.data, router, safeNext]);

	return (
		<main className="bg-background-alt flex min-h-screen w-full items-center justify-center p-4 pt-20">
			<Card className="w-full max-w-md" aria-live="polite">
				<CardBody className="space-y-5 text-center">
					{query.isError ? (
						<>
							<Alert variant="destructive" icon={<CircleAlert size={18} />}>
								<AlertTitle>No pudimos verificar tu sesión</AlertTitle>
								<AlertDescription>
									{getApiErrorMessage(query.error, "No pudimos verificar tu sesión.")}
								</AlertDescription>
							</Alert>
							<div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
								<Button onClick={() => void query.refetch()} disabled={query.isFetching}>
									{query.isFetching ? "Reintentando…" : "Reintentar"}
								</Button>
								<Link href={loginPath} className={buttonVariants({ variant: "outline" })}>
									Ir a iniciar sesión
								</Link>
							</div>
						</>
					) : (
						<>
							<LoaderCircle
								className="text-primary mx-auto size-8 animate-spin"
								aria-hidden="true"
							/>
							<div className="space-y-2">
								<h1 className="text-xl font-bold tracking-tight">Verificando tu sesión</h1>
								<p className="text-muted-foreground text-sm">
									Estamos comprobando si tu sesión sigue activa.
								</p>
							</div>
						</>
					)}
				</CardBody>
			</Card>
		</main>
	);
}
