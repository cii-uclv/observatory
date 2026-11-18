import { ProfileCard } from "@/features/auth/components/ProfileCard";

interface PerfilPageProps {
	params: Promise<{ username: string }>;
}

export default async function PerfilPage({ params }: PerfilPageProps) {
	const { username } = await params;

	return (
		<div className="bg-background-alt min-h-screen pt-24 pb-16">
			<div className="mx-auto w-full max-w-4xl px-6">
				<div className="mb-8">
					<p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Cuenta</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Mi perfil</h1>
					<p className="text-muted-foreground mt-2">
						Datos de la cuenta autenticada en el Observatorio Cubano de Energía y Minas.
					</p>
				</div>

				<ProfileCard username={username} />
			</div>
		</div>
	);
}
