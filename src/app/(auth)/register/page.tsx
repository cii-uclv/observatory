import React from "react";

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function LoginPage() {
	return (
		<main className="bg-background-alt flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-4">
			<RegisterForm />
		</main>
	);
}
