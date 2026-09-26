import Link from "next/link";

import {
	AlertTriangle,
	BarChart3,
	Brain,
	Compass,
	Database,
	FileText,
	Map,
	Settings,
} from "lucide-react";

const modules = [
	{
		title: "Buscador Inteligente",
		icon: Compass,
		description: "Localización avanzada de documentación técnica y datos históricos mediante IA.",
	},
	{
		title: "Geoportal de Cuba",
		icon: Map,
		description: "Visualización espacial de la infraestructura energética y recursos minerales.",
	},
	{
		title: "Estadísticas",
		icon: BarChart3,
		description: "Dashboards interactivos y visualización de indicadores clave del sector.",
	},
	{
		title: "Boletines Temáticos",
		icon: FileText,
		description: "Publicaciones periódicas sobre el estado y tendencias de la energía y minas.",
	},
	{
		title: "Gestión IA",
		icon: Brain,
		description: "Herramientas de predicción y modelado de datos mediante redes neuronales.",
	},
	{
		title: "Alertas Críticas",
		icon: AlertTriangle,
		description: "Monitoreo de umbrales críticos y gestión de contingencias en tiempo real.",
		isUrgent: true,
	},
	{
		title: "Registro de Fuentes",
		icon: Database,
		description: "Control y validación de las fuentes de datos primarias integradas al sistema.",
	},
	{
		title: "Administración",
		icon: Settings,
		description: "Configuración del sistema, roles de usuario y auditoría de seguridad.",
	},
];

export const ModuleGrid = () => {
	return (
		<section className="bg-background-alt flex grow flex-col py-16" id="modulos">
			<div className="mx-auto flex w-full max-w-7xl flex-col px-6">
				<div className="flex flex-col gap-3 pb-12 text-center md:text-left">
					<h2 className="border-primary text-foreground border-l-4 pl-4 text-3xl font-bold md:text-4xl">
						Módulos Estratégicos y Operativos
					</h2>
					<p className="text-muted-foreground max-w-2xl">
						Acceda de forma segura a las herramientas de análisis, monitoreo y gestión del sector
						minero-energético nacional.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{modules.map((item, index) => (
						<Link
							key={index}
							href="/"
							className={`group bg-card flex flex-col gap-5 rounded-lg border p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${
								item.isUrgent
									? "hover:border-primary/40 border-destructive/20 bg-destructive/5"
									: "hover:border-primary/20 border-border hover:bg-muted"
							}`}
						>
							<div
								className={`flex h-14 w-14 items-center justify-center rounded-lg shadow-sm transition-all ${
									item.isUrgent
										? "bg-primary text-white"
										: "bg-card text-primary group-hover:bg-primary group-hover:text-white"
								}`}
							>
								<item.icon className="text-3xl" />
							</div>
							<div>
								<h3
									className={`mb-2 text-xl font-bold ${item.isUrgent ? "text-destructive" : "text-foreground"}`}
								>
									{item.title}
								</h3>
								<p
									className={`text-sm leading-relaxed ${item.isUrgent ? "text-destructive-foreground/70" : "text-muted-foreground"}`}
								>
									{item.description}
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
};
