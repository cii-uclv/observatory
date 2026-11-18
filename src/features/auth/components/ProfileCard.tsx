"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CalendarDays, CircleAlert, Mail, MapPin, Phone, UserRound } from "lucide-react";

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	buttonVariants,
	Card,
	CardBody,
	CardHeader,
	Separator,
	Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

import { getRoleLabel } from "../const/roles";
import { useSession } from "../hooks/useSession";
import { AuthSession } from "../types";

function getDisplayName(session: AuthSession): string {
	const fullName = [session.user.first_name, session.user.last_name]
		.filter(Boolean)
		.join(" ")
		.trim();

	return fullName || session.user.username;
}

function getInitials(session: AuthSession): string {
	const initials = [session.user.first_name, session.user.last_name]
		.filter(Boolean)
		.map((part) => part.charAt(0))
		.join("")
		.toUpperCase();

	return initials || session.user.username.slice(0, 2).toUpperCase();
}

function formatBirthDate(value: string | null): string {
	if (!value) {
		return "No registrado";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("es-CU", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

interface ProfileFieldProps {
	icon: ReactNode;
	label: string;
	value: ReactNode;
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
	return (
		<div className="flex items-start gap-3">
			<span
				className="border-border bg-background text-primary flex size-10 shrink-0 items-center justify-center rounded-lg border"
				aria-hidden="true"
			>
				{icon}
			</span>
			<div className="min-w-0">
				<dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
					{label}
				</dt>
				<dd className="text-foreground text-sm wrap-break-word">{value}</dd>
			</div>
		</div>
	);
}

function ProfileSkeleton() {
	return (
		<Card aria-busy="true" aria-label="Cargando perfil">
			<CardBody className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="size-20 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-28" />
					</div>
				</div>
				<Separator />
				<div className="grid gap-6 sm:grid-cols-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-4 w-36" />
							</div>
						</div>
					))}
				</div>
			</CardBody>
		</Card>
	);
}

interface ProfileCardProps {
	username?: string;
}

export function ProfileCard({ username }: ProfileCardProps) {
	const router = useRouter();
	const { session, isLoading, isError, refetch } = useSession();

	useEffect(() => {
		if (!session || !username || session.user.username === username) {
			return;
		}

		router.replace(`/${session.user.username}`);
	}, [router, session, username]);

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (isError) {
		return (
			<Alert variant="destructive" icon={<CircleAlert size={18} />}>
				<AlertTitle>No se pudo cargar el perfil</AlertTitle>
				<AlertDescription className="flex flex-col gap-3">
					<p>No pudimos obtener los datos de su cuenta. Inténtelo de nuevo.</p>
					<Button variant="outline" size="sm" className="self-start" onClick={() => void refetch()}>
						Reintentar
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	if (session && username && session.user.username !== username) {
		return <ProfileSkeleton />;
	}

	if (!session) {
		return (
			<Alert variant="info" icon={<UserRound size={18} />}>
				<AlertTitle>No hay una sesión activa</AlertTitle>
				<AlertDescription className="flex flex-col gap-3">
					<p>Inicie sesión para consultar los datos de su cuenta.</p>
					<Link href="/login" className={cn(buttonVariants({ size: "sm" }), "self-start")}>
						Iniciar sesión
					</Link>
				</AlertDescription>
			</Alert>
		);
	}

	const { user, roles, primaryRole } = session;
	const displayName = getDisplayName(session);

	return (
		<Card variant="elevated" padding="none">
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<div
						className="bg-primary text-primary-foreground flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold"
						aria-hidden="true"
					>
						{getInitials(session)}
					</div>
					<div className="min-w-0">
						<h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
						<p className="text-muted-foreground text-sm">@{user.username}</p>
						<p className="text-muted-foreground text-xs">ID de usuario: {user.user_id}</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{primaryRole ? (
						<Badge variant="default" size="sm">
							{getRoleLabel(primaryRole)}
						</Badge>
					) : (
						<Badge variant="secondary" size="sm">
							Sin rol principal
						</Badge>
					)}
					{roles
						.filter((role) => role !== primaryRole)
						.map((role) => (
							<Badge key={role} variant="outline" size="sm">
								{getRoleLabel(role)}
							</Badge>
						))}
				</div>
			</CardHeader>

			<CardBody>
				<Separator className="mb-6" />

				<dl className="grid gap-6 sm:grid-cols-2">
					<ProfileField
						icon={<Mail size={18} />}
						label="Correo electrónico"
						value={user.email || "No registrado"}
					/>
					<ProfileField
						icon={<Phone size={18} />}
						label="Teléfono"
						value={user.phone || "No registrado"}
					/>
					<ProfileField
						icon={<CalendarDays size={18} />}
						label="Fecha de nacimiento"
						value={formatBirthDate(user.birth_date)}
					/>
					<ProfileField
						icon={<MapPin size={18} />}
						label="Dirección"
						value={user.address || "No registrada"}
					/>
				</dl>
			</CardBody>
		</Card>
	);
}
