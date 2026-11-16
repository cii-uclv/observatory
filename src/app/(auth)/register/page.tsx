import React from "react";

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function LoginPage() {
	return (
		<main className="bg-background-alt flex min-h-screen w-full items-center justify-center p-4 pt-20">
			<RegisterForm />
		</main>
	);
}
