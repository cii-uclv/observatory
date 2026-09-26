import Link from "next/link";

import { AlertTriangle, ArrowRight } from "lucide-react";

export const CriticalAlert = () => {
	return (
		<section className="border-destructive/20 bg-destructive/10 w-full border-b px-6 py-3">
			<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
				<div className="flex items-center gap-4">
					<span className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
						<AlertTriangle className="text-white" />
					</span>
					<div>
						<h4 className="text-destructive text-sm font-bold tracking-tight uppercase">
							Centro de Alertas Críticas
						</h4>
						<p className="text-destructive-foreground text-xs font-medium">
							Monitoreo activo: No se reportan incidencias críticas en el SEN en este momento.
						</p>
					</div>
				</div>
				<Link
					href="/"
					className="text-destructive hover:text-destructive-foreground flex items-center gap-1 text-xs font-bold transition-colors"
				>
					ACCEDER AL PANEL DE CONTROL <ArrowRight className="h-3 w-3" />
				</Link>
			</div>
		</section>
	);
};
