// src/features/home/components/ContactSection.tsx
"use client";
import Link from "next/link";

export const ContactSection = () => {
	return (
		<section className="bg-background-alt py-24" id="contacto">
			<div className="mx-auto max-w-[1200px] px-6">
				<div className="flex flex-col gap-16 lg:flex-row">
					{/* COLUMNA IZQUIERDA: FORMULARIO */}
					<div className="lg:w-2/3">
						<div className="mb-10">
							<h2 className="border-primary text-foreground mb-4 border-l-4 pl-4 text-3xl font-black md:text-4xl">
								Contacte con Nosotros
							</h2>
							<p className="text-muted-foreground ml-5">
								Utilice el siguiente formulario para enviarnos sus consultas técnicas, solicitudes
								de información o reportes institucionales.
							</p>
						</div>

						<form
							className="grid grid-cols-1 gap-6 md:grid-cols-2"
							onSubmit={(e) => e.preventDefault()}
						>
							<div className="flex flex-col gap-2">
								<label className="text-foreground ml-1 text-sm font-bold" htmlFor="fullName">
									Nombre Completo
								</label>
								<input
									className="focus:border-primary focus:ring-primary border-input bg-background/50 w-full rounded-lg border px-4 py-3 transition-all outline-none focus:ring-1"
									id="fullName"
									placeholder="Ej. Juan Pérez García"
									type="text"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-foreground ml-1 text-sm font-bold" htmlFor="email">
									Correo Institucional
								</label>
								<input
									className="focus:border-primary focus:ring-primary border-input bg-background/50 w-full rounded-lg border px-4 py-3 transition-all outline-none focus:ring-1"
									id="email"
									placeholder="usuario@dominio.cu"
									type="email"
								/>
							</div>

							<div className="flex flex-col gap-2 md:col-span-2">
								<label className="text-foreground ml-1 text-sm font-bold" htmlFor="subject">
									Asunto
								</label>
								<input
									className="focus:border-primary focus:ring-primary border-input bg-background/50 w-full rounded-lg border px-4 py-3 transition-all outline-none focus:ring-1"
									id="subject"
									placeholder="Motivo de su mensaje"
									type="text"
								/>
							</div>

							<div className="flex flex-col gap-2 md:col-span-2">
								<label className="text-foreground ml-1 text-sm font-bold" htmlFor="message">
									Mensaje
								</label>
								<textarea
									className="focus:border-primary focus:ring-primary border-input bg-background/50 min-h-[160px] w-full resize-none rounded-lg border px-4 py-3 transition-all outline-none focus:ring-1"
									id="message"
									placeholder="Escriba aquí los detalles de su consulta..."
								></textarea>
							</div>

							<div className="mt-2 md:col-span-2">
								<button className="bg-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-10 py-4 font-bold text-white shadow-lg transition-all hover:opacity-90 md:w-auto">
									<span className="material-symbols-outlined !text-[20px]">send</span>
									Enviar Mensaje
								</button>
							</div>
						</form>
					</div>

					{/* COLUMNA DERECHA: INFO DE CONTACTO */}
					<div className="lg:w-1/3">
						<div className="border-input bg-background/50 h-full rounded-2xl border p-8">
							<h3 className="text-foreground mb-8 flex items-center gap-2 text-xl font-bold">
								<span className="material-symbols-outlined text-primary">info</span>
								Información de Contacto
							</h3>

							<div className="flex flex-col gap-8">
								{/* Dirección */}
								<div className="flex gap-4">
									<div className="text-primary border-input bg-card flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm">
										<span className="material-symbols-outlined">location_on</span>
									</div>
									<div>
										<h4 className="text-foreground mb-1 text-sm font-bold tracking-wide uppercase">
											Dirección Física
										</h4>
										<p className="text-muted-foreground text-sm leading-relaxed">
											Avenida Salvador Allende No. 666, Plaza de la Revolución, La Habana, Cuba.
										</p>
									</div>
								</div>

								{/* Teléfono */}
								<div className="flex gap-4">
									<div className="text-primary border-input bg-card flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm">
										<span className="material-symbols-outlined">call</span>
									</div>
									<div>
										<h4 className="text-foreground mb-1 text-sm font-bold tracking-wide uppercase">
											Atención Telefónica
										</h4>
										<p className="text-muted-foreground text-sm leading-relaxed">
											(+53) 7 877 5000
											<br />
											Lunes - Viernes: 8:00 AM - 4:30 PM
										</p>
									</div>
								</div>

								{/* Digital */}
								<div className="flex gap-4">
									<div className="text-primary border-input bg-card flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm">
										<span className="material-symbols-outlined">mail</span>
									</div>
									<div>
										<h4 className="text-foreground mb-1 text-sm font-bold tracking-wide uppercase">
											Canales Digitales
										</h4>
										<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
											contacto@ocem.minem.gob.cu
										</p>
										<div className="flex gap-3">
											{["language", "share", "rss_feed"].map((icon) => (
												<Link
													key={icon}
													href="/"
													className="hover:bg-primary hover:border-primary border-input bg-card text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:text-white"
												>
													<span className="material-symbols-outlined !text-[18px]">{icon}</span>
												</Link>
											))}
										</div>
									</div>
								</div>
							</div>

							{/* Nota al pie */}
							<div className="border-input mt-12 border-t pt-8">
								<div className="border-destructive/20 bg-destructive/5 rounded-xl p-4">
									<p className="text-destructive text-xs leading-relaxed font-medium italic">
										&quot;Comprometidos con la transparencia y el acceso a la información
										estratégica del sector energético cubano.&quot;
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
