import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/context/auth-context";
import "./globals.css";
import { ThemeProvider } from "@/components/provider/theme-provider";

const roboto = Roboto({
	weight: ["300", "400", "500", "700"],
	subsets: ["latin"],
	variable: "--font-sans",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Task Board Assignment",
	description: "Secure Full-Stack Task Board Application",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${roboto.variable} ${geistMono.variable} font-sans antialiased w-full h-screen overflow-hidden`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>{children}</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
