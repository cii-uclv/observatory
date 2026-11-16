import React from "react";
import Image from "next/image";

export default function Hero() {
	return (
		<section className="bg-background-dark relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-16">
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
				<div className="border-background/10 bg-background/60 mx-auto max-w-4xl rounded-lg border p-8 text-center shadow-2xl backdrop-blur-sm md:p-12">
					<h1 className="mb-6 font-sans text-4xl font-bold text-white md:text-5xl">
						¿Quiénes Somos?
					</h1>
					<p className="text-foreground text-lg leading-relaxed md:text-xl">
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
