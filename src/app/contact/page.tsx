import { ContactSection } from "@/features/home/components/ContactSection";

export default function ContactPage() {
	return (
		<main className="flex min-h-[80vh] flex-col">
			<section className="bg-background-alt border-input border-b">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-20">
					<span className="text-primary text-xs font-bold tracking-[0.25em] uppercase">
						Contacto
					</span>
					<h1 className="text-foreground text-3xl font-bold md:text-5xl">Estamos para ayudarte</h1>
					<p className="text-muted-foreground max-w-2xl text-base md:text-lg">
						Escríbenos para consultas técnicas, solicitudes de información o reportes
						institucionales. Nuestro equipo responde en horario laboral.
					</p>
				</div>
			</section>

			<ContactSection />
		</main>
	);
}
