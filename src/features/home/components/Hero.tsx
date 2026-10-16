import { Search } from "lucide-react";

export const Hero = () => {
	return (
		<section className="relative w-full">
			<div
				className="relative flex min-h-screen w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-16"
				style={{
					backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('/wind_farm.png')`,
				}}
			>
				<div className="flex max-w-7xl flex-col gap-6 text-center">
					<div className="bg-destructive/90 mb-2 inline-flex items-center self-center rounded-full px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase">
						HUB CENTRAL DE DATOS
					</div>
					<h1 className="text-4xl leading-tight font-bold text-white drop-shadow-md md:text-5xl lg:text-7xl">
						Observatorio Cubano de <br />
						<span className="text-destructive">ENERGÍA Y MINAS</span>
					</h1>
					<p className="text-background/80 mx-auto max-w-3xl text-lg leading-relaxed md:text-xl">
						Plataforma estratégica para la soberanía energética y el desarrollo minero sostenible.
						Información en tiempo real para la toma de decisiones.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<div className="group relative w-full max-w-lg">
							<div className="relative">
								<input
									type="text"
									className="bg-background/95 text-foreground focus:ring-destructive border-input h-14 w-full rounded-lg border-none pr-14 pl-14 text-lg shadow-2xl transition-all focus:ring-2"
									placeholder="Buscador inteligente de recursos..."
								/>
								<Search className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-5 -translate-y-1/2 text-[28px] transition-colors" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
