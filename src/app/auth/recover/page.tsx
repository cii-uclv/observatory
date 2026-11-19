import { RecoverSession } from "@/features/auth/components/RecoverSession";

interface RecoverPageProps {
	searchParams: Promise<{
		next?: string;
	}>;
}

export default async function RecoverPage({ searchParams }: RecoverPageProps) {
	const { next } = await searchParams;

	return <RecoverSession nextPath={next ?? null} />;
}
