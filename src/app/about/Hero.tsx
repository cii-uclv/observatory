import React from "react";
import Image from "next/image";

export default function Hero() {
	return (
		<section className="bg-background-dark relative h-150 w-full overflow-hidden">
			<Image
				src="/unnamed.png"
				alt="Reunión de equipo sobre mesa de madera"
				className="absolute inset-0 h-full w-full object-cover"
				fill
				priority
				unoptimized
			/>
			<div className="hero-gradient bg-background/40 absolute inset-0" />
			<div className="relative z-10 flex h-full items-center justify-center px-4">
				<div className="border-background/10 bg-background/60 mx-auto max-w-4xl rounded-2xl border p-8 text-center shadow-2xl backdrop-blur-sm md:p-12">
					<h1 className="font-display mb-6 text-4xl font-bold text-white md:text-5xl">
						¿Quiénes Somos?
					</h1>
					<p className="text-muted-foreground text-lg leading-relaxed font-light md:text-xl">
						El Observatorio Tecnológico del Ministerio de Energía y Minas (MINEM) es una plataforma
						dedicada a monitorear, analizar y divulgar las innovaciones tecnológicas en los sectores
						de minería y energía en Cuba. Nuestro objetivo es proporcionar a investigadores,
						profesionales del sector y entidades gubernamentales acceso a información actualizada
						sobre los avances más relevantes en estas áreas.
					</p>
				</div>
			</div>
		</section>
	);
}
