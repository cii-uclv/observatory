import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

// Page temporal para verificar el funcionamiento del Navbar
export default function About() {
	return (
		<ProtectedRoute>
			<div className="flex min-h-[80vh] min-w-[90vw] items-center justify-center">
				<p>Intranet Acces Page</p>
			</div>
		</ProtectedRoute>
	);
}
