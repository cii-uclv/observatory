"use client";
import Link from "next/link";

import { Globe, Mail, MapPin, Phone, Send, Share2 } from "lucide-react";

export const ContactSection = () => {
	return (
		<section className="bg-background-alt py-20" id="contacto">
			<div className="mx-auto max-w-7xl px-6">
				<div className="flex flex-col gap-16 lg:flex-row">
					{/* COLUMNA IZQUIERDA: FORMULARIO */}
					<div className="lg:w-2/3">
						<div className="mb-10">
							<h2 className="border-primary text-foreground mb-4 border-l-4 pl-4 text-3xl font-bold md:text-4xl">
								Contacte con Nosotros
							</h2>
							<p className="text-muted-foreground">
								Utilice el siguiente formulario para enviarnos sus consultas técnicas, solicitudes
								de información o reportes institucionales.
							</p>
						</div>

						<form
							className="grid grid-cols-1 gap-6 md:grid-cols-2"
							onSubmit={(e) => e.preventDefault()}
						>
							<div className="flex flex-col gap-2">
								<label className="text-foreground text-sm font-semibold" htmlFor="fullName">
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
								<label className="text-foreground text-sm font-semibold" htmlFor="email">
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
								<label className="text-foreground text-sm font-semibold" htmlFor="subject">
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
								<label className="text-foreground text-sm font-semibold" htmlFor="message">
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
									<span className="text-[20px]">
										<Send />
									</span>
									Enviar Mensaje
								</button>
							</div>
						</form>
					</div>

					{/* COLUMNA DERECHA: INFO DE CONTACTO */}
					<div className="lg:w-1/3">
						<div className="border-input bg-background/50 h-full rounded-lg border p-8">
							<h3 className="text-foreground mb-8 flex items-center gap-2 text-xl font-bold">
								<span className="text-primary">
									<MapPin />
								</span>
								Información de Contacto
							</h3>

							<div className="flex flex-col gap-8">
								{/* Dirección */}
								<div className="flex gap-4">
									<div className="text-primary border-input bg-card flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border shadow-sm">
										<span className="text-primary">
											<MapPin />
										</span>
									</div>
									<div>
										<h4 className="text-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
											Dirección Física
										</h4>
										<p className="text-muted-foreground text-sm leading-relaxed">
											Avenida Salvador Allende No. 666, Plaza de la Revolución, La Habana, Cuba.
										</p>
									</div>
								</div>

								{/* Teléfono */}
								<div className="flex gap-4">
									<div className="text-primary border-input bg-card flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border shadow-sm">
										<span className="text-primary">
											<Phone />
										</span>
									</div>
									<div>
										<h4 className="text-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
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
									<div className="text-primary border-input bg-card flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border shadow-sm">
										<span className="text-primary">
											<Mail />
										</span>
									</div>
									<div>
										<h4 className="text-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
											Canales Digitales
										</h4>
										<p className="text-muted-foreground mb-4 text-sm leading-relaxed">
											contacto@ocem.minem.gob.cu
										</p>
										<div className="flex gap-3">
											{["Globe", "Share2", "Mail"].map((icon) => {
												const IconComponent =
													icon === "Globe" ? Globe : icon === "Share2" ? Share2 : Mail;
												return (
													<Link
														key={icon}
														href="/"
														className="hover:bg-primary hover:border-primary border-input bg-card text-muted-foreground flex h-9 w-9 items-center justify-center rounded-lg border transition-all hover:text-white"
													>
														<span className="text-[18px]">
															<IconComponent />
														</span>
													</Link>
												);
											})}
										</div>
									</div>
								</div>
							</div>

							{/* Nota al pie */}
							<div className="border-input mt-12 border-t pt-8">
								<div className="border-destructive/20 bg-destructive/5 rounded-lg p-4">
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
