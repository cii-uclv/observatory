import React from "react";

export default function Navbar() {
	return (
		<nav className="border-input bg-background/95 dark:border-input dark:bg-background/95 sticky top-0 z-50 border-b shadow-sm backdrop-blur">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-20 items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="material-symbols-outlined text-primary text-4xl">volcano</span>
						<div className="flex flex-col">
							<span className="font-display text-foreground text-sm leading-none font-bold tracking-wider md:text-base dark:text-white">
								MINISTERIO DE
							</span>
							<span className="font-display text-foreground text-base leading-none font-bold tracking-wider md:text-xl dark:text-white">
								ENERGÍA Y MINAS<span className="text-primary">.</span>
							</span>
						</div>
					</div>
					<div className="hidden items-center space-x-8 md:flex">
						<a
							className="hover:text-primary text-muted-foreground dark:text-muted-foreground font-medium transition-colors"
							href="/servicios"
						>
							Servicios
						</a>
						<a
							className="hover:text-primary text-muted-foreground dark:text-muted-foreground font-medium transition-colors"
							href="/boletines"
						>
							Boletines
						</a>
						<a className="text-primary border-primary border-b-2 pb-1 font-bold" href="/about">
							Sobre Nosotros
						</a>
					</div>
					<div>
						<button className="bg-foreground text-background dark:bg-background dark:text-foreground rounded-full px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90">
							Iniciar Sesión
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
}
