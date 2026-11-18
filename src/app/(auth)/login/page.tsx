import { LoginForm } from "@/features/auth/components/LoginForm";

interface LoginPageProps {
	searchParams: Promise<{
		next?: string;
		registered?: string;
	}>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { next, registered } = await searchParams;

	return (
		<main className="bg-background-alt flex min-h-screen w-full items-center justify-center p-4 pt-20">
			<LoginForm nextPath={next} registered={registered === "1"} />
		</main>
	);
}
