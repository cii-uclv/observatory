"use client";

import { useState } from "react";
import Link from "next/link";

import { ChevronDown, CircleAlert, LogOut, ShieldCheck, UserRound } from "lucide-react";

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Skeleton,
} from "@/components/ui";
import { NAVIGATION_CTA, NAVIGATION_MAIN } from "@/const";
import { AuthSession, getRoleLabel, hasAdminRole, useLogout, useSession } from "@/features/auth";
import { getApiErrorMessage } from "@/lib/api";

import Logo from "./Logo";

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

export function Navbar() {
	const [open, setOpen] = useState(false);
	const { session, isLoading } = useSession();
	const { mutate: logout, isPending: isLoggingOut, error: logoutError } = useLogout();

	const isAdmin = session ? hasAdminRole(session.roles) : false;

	const navigationItems = NAVIGATION_MAIN.filter((item) => {
		const itemRoles = item.roles;

		if (item.requiresAuth && !session) {
			return false;
		}

		if (itemRoles?.length && !(session && session.roles.some((role) => itemRoles.includes(role)))) {
			return false;
		}

		return true;
	});

	function closeMenu() {
		setOpen(false);
	}

	function handleLogout() {
		closeMenu();
		logout();
	}

	return (
		<>
			<header className="fixed top-0 left-0 z-50 w-full">
				<nav
					className="bg-background mx-auto flex max-w-7xl items-center justify-between rounded-md px-4 py-3"
					aria-label="Navegación principal"
				>
					{/* Logo */}
					<Logo />

					{/*Main Links desktop */}
					<div className="flex gap-5">
						<ul className="text-foreground hidden items-center gap-8 text-sm font-medium md:flex">
							{navigationItems.map((item) => (
								<li key={item.href}>
									<Link href={item.href} onClick={closeMenu}>
										{item.label}
									</Link>
								</li>
							))}
						</ul>

						{/* Session / CTA desktop */}
						<div className="hidden md:block">
							{isLoading ? (
								<Skeleton className="h-9 w-28" aria-hidden="true" />
							) : session ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											type="button"
											className="border-border bg-card hover:bg-accent focus-visible:ring-ring flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none"
											aria-label={`Menú de usuario de ${getDisplayName(session)}`}
										>
											<span
												className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-bold"
												aria-hidden="true"
											>
												{getInitials(session)}
											</span>
											<span className="max-w-32 truncate">{getDisplayName(session)}</span>
											<ChevronDown className="size-4 opacity-70" aria-hidden="true" />
										</button>
									</DropdownMenuTrigger>

									<DropdownMenuContent align="end" className="w-64">
										<DropdownMenuLabel className="flex flex-col gap-1 px-2 py-2">
											<span className="text-sm font-semibold">{getDisplayName(session)}</span>
											<span className="text-muted-foreground text-xs font-normal">
												@{session.user.username}
											</span>
											{session.roles.length > 0 && (
												<div className="mt-1 flex flex-wrap gap-1">
													{session.roles.map((role) => (
														<Badge key={role} variant="outline" size="xs">
															{getRoleLabel(role)}
														</Badge>
													))}
												</div>
											)}
										</DropdownMenuLabel>

										<DropdownMenuSeparator />

										<DropdownMenuItem asChild>
											<Link href={`/${session.user.username}`}>
												<UserRound className="mr-2 size-4" aria-hidden="true" />
												Mi perfil
											</Link>
										</DropdownMenuItem>

										{isAdmin && (
											<DropdownMenuItem asChild>
												<Link href="/users">
													<ShieldCheck className="mr-2 size-4" aria-hidden="true" />
													Usuarios
												</Link>
											</DropdownMenuItem>
										)}

										<DropdownMenuSeparator />

										<DropdownMenuItem
											className="text-destructive focus:text-destructive"
											disabled={isLoggingOut}
											onSelect={handleLogout}
										>
											<LogOut className="mr-2 size-4" aria-hidden="true" />
											{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Link
									href={NAVIGATION_CTA.href}
									className="bg-chart-1 text-background hover:bg-chart-1/70 rounded-md px-4 py-2 text-sm font-semibold transition"
									onClick={closeMenu}
								>
									{NAVIGATION_CTA.label}
								</Link>
							)}
						</div>
					</div>

					{/* Botón hamburguesa */}
					<button
						type="button"
						onClick={() => setOpen(!open)}
						className="text-foreground text-2xl md:hidden"
						aria-label="Abrir menú de navegación"
						aria-expanded={open}
						aria-controls="mobile-navigation"
					>
						☰
					</button>
				</nav>
			</header>

			{logoutError && (
				<div className="fixed top-20 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm">
					<Alert variant="destructive" icon={<CircleAlert size={18} />}>
						<AlertTitle>No se pudo cerrar sesión</AlertTitle>
						<AlertDescription>
							{getApiErrorMessage(logoutError, "Inténtalo de nuevo. Tu sesión sigue activa.")}
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Menú móvil overlay */}
			<nav
				id="mobile-navigation"
				aria-label="Navegación móvil"
				className={`bg-background fixed top-16 left-0 z-40 w-full shadow-lg transition md:hidden ${
					open ? "block" : "hidden"
				}`}
			>
				<ul className="text-foreground flex flex-col gap-5 p-6 font-medium">
					{navigationItems.map((item) => (
						<li key={item.href} className="flex flex-1">
							<Link href={item.href} onClick={closeMenu} className="w-full">
								{item.label}
							</Link>
						</li>
					))}

					{isLoading ? (
						<Skeleton className="h-10 w-full" aria-hidden="true" />
					) : session ? (
						<li className="border-border mt-2 flex flex-col gap-3 border-t pt-4">
							<div>
								<p className="text-sm font-semibold">{getDisplayName(session)}</p>
								<p className="text-muted-foreground text-xs">@{session.user.username}</p>
								{session.roles.length > 0 && (
									<div className="mt-2 flex flex-wrap gap-1">
										{session.roles.map((role) => (
											<Badge key={role} variant="outline" size="xs">
												{getRoleLabel(role)}
											</Badge>
										))}
									</div>
								)}
							</div>

							<Link href={`/${session.user.username}`} onClick={closeMenu} className="w-full">
								Mi perfil
							</Link>

							{isAdmin && (
								<Link href="/users" onClick={closeMenu} className="w-full">
									Usuarios
								</Link>
							)}

							<Button type="button" variant="outline" loading={isLoggingOut} onClick={handleLogout}>
								Cerrar sesión
							</Button>
						</li>
					) : (
						<li>
							<Link
								href={NAVIGATION_CTA.href}
								onClick={closeMenu}
								className="bg-chart-1 text-background hover:bg-chart-1/70 block rounded-md py-2 text-center font-semibold transition"
							>
								{NAVIGATION_CTA.label}
							</Link>
						</li>
					)}
				</ul>
			</nav>

			{/* Espaciador para que el contenido no quede oculto bajo el navbar */}
			{/* <div className="h-16" /> */}
		</>
	);
}
