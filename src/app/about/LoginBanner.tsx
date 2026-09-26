import React from "react";

import { ArrowRight } from "lucide-react";

export default function LoginBanner() {
	return (
		<div className="relative">
			<div className="absolute -top-8 right-0 left-0 z-30 flex justify-center px-4">
				<a
					className="bg-primary hover:bg-primary/90 group text-background flex transform items-center gap-3 rounded-lg px-8 py-4 font-bold shadow-lg transition-all hover:scale-105"
					href="/login"
				>
					Inicia Sesión en nuestro observatorio
					<span className="bg-background text-primary rounded-full p-1 transition-transform group-hover:translate-x-1">
						<ArrowRight className="text-sm" />
					</span>
				</a>
			</div>
		</div>
	);
}
