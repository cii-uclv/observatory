import React from "react";
import Image from "next/image";

import { Activity, Gavel, Laptop, Map, Megaphone, Mountain, User, Wrench, Zap } from "lucide-react";

const teamMembers = [
	{
		name: "Ismarys Salgado Machin",
		position: "La Habana, Cuba",
		icon: User,
		description:
			"Especialista con amplia trayectoria en gestión de patentes, servicios de información, la gestión de la innovación y los procesos editoriales.",
	},
	{
		name: "Jose Manuel",
		position: "Ing. Eléctrico",
		icon: Zap,
		description:
			"Departamento de Energía. Especialista en redes de alta tensión y optimización energética.",
	},
	{
		name: "Alberto Moreno",
		position: "Ing. Minas",
		icon: Mountain,
		description:
			"Departamento de Minería. Experto en análisis geológico y sostenibilidad ambiental.",
		img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAj6ZwyUvJhCnQ6EFjnyxeqAnkJdQdgBbl-sCz9QFAMbv_K5VU9oY1lbe9Z_5Kr_OZ_1OBGLNi5tvFMLwMuGfdbgSBePEmfGeS_KNXL9O0zxDJ7LeKWpDffn1jhSYQmrXo62g96ih19-FaA6ZjYnngL7e-eipXQdrFAMYSpoqavzj4C-sdofjlyXtAZkKkEPUhG3Th5VYR3w6LOFov2s3aA8mFTarmf1dRIzvatz3OW1VOle83xEZXpzzCOynl_CsPStU0q4mX3SHm-",
	},
	{
		name: "Laura Hernández",
		position: "Geóloga Senior",
		icon: Map,
		description:
			"Especialista en cartografía geológica y evaluación de recursos minerales. Experta en sistemas de información geográfica.",
	},
	{
		name: "Carlos Rodríguez",
		position: "Analista de Datos",
		icon: Activity,
		description:
			"Encargado del análisis estadístico de la producción minera y energética. Experto en minería de datos y predicción.",
	},
	{
		name: "Elena García",
		position: "Comunicadora",
		icon: Megaphone,
		description:
			"Responsable de la divulgación científica y relaciones públicas. Gestión de contenidos y comunicación estratégica.",
	},
	{
		name: "Roberto Sánchez",
		position: "Ing. de Sistemas",
		icon: Laptop,
		description:
			"Especialista en ciberseguridad y arquitectura de software para infraestructuras críticas.",
	},
	{
		name: "Ana Torres",
		position: "Asesora Legal",
		icon: Gavel,
		description:
			"Experta en derecho minero y regulaciones energéticas internacionales y cumplimiento normativo.",
	},
	{
		name: "Miguel Ángel",
		position: "Gestor de Proyectos",
		icon: Wrench,
		description:
			"Certificado PMP con experiencia en coordinación de proyectos de exploración y explotación minera.",
	},
];

export default function TeamGrid() {
	return (
		<section className="bg-background-alt dark:bg-background-dark py-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 className="border-primary text-foreground mb-12 border-l-4 pl-4 font-sans text-3xl font-bold md:text-4xl dark:text-white">
					Equipo de Trabajo
				</h2>
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{teamMembers.map(({ name, position, icon: Icon, description, img }) => (
						<div
							key={name}
							className="group relative overflow-hidden rounded-lg bg-gradient-to-b via-[#500e16] to-neutral-900 pt-8 shadow-xl transition-all duration-300 hover:shadow-2xl"
						>
							<div className="relative flex h-80 w-full items-end justify-center overflow-hidden">
								{img ? (
									<Image
										src={img}
										alt={name}
										className="h-full transform object-cover object-top transition-transform duration-500 group-hover:scale-105"
										width={400}
										height={320}
										unoptimized
									/>
								) : (
									<div className="bg-muted dark:bg-card flex h-full w-full items-center justify-center">
										<span className="text-muted-foreground text-6xl">
											<Icon />
										</span>
									</div>
								)}
							</div>
							<div className="bg-background dark:bg-card absolute right-4 bottom-4 left-4 rounded-lg p-4 shadow-lg">
								<div className="flex items-start justify-between">
									<div>
										<h3 className="text-foreground font-sans text-lg font-bold dark:text-white">
											{name}
										</h3>
										<p className="text-primary mt-1 text-xs font-semibold tracking-wider uppercase">
											{position}
										</p>
									</div>
									<div className="bg-primary/10 rounded-lg p-2">
										<span className="text-primary">
											<Icon />
										</span>
									</div>
								</div>
								<div className="border-input dark:border-input mt-3 border-t pt-3">
									<p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed transition-all group-hover:line-clamp-none">
										{description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
