import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";

import { Footer, Navbar } from "@/components/layouts";

import { Providers } from "./providers";

import "./globals.css";

// Configuración de fuentes
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const publicSans = Public_Sans({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	variable: "--font-public-sans",
});

// Metadatos del sitio
export const metadata: Metadata = {
	title: "Hub Central OCEM - Observatorio Cubano de Energía y Minas",
	description: "Plataforma estratégica cubana",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<body
				className={` ${publicSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<Navbar />
					<main>{children}</main>
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
