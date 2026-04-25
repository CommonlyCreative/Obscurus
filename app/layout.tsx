import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/database/auth";
import { headers } from "next/headers";
import { TooltipProvider } from "@/components/ui/tooltip"
import Notification from "@/components/shared/Notification";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Obscurus — Deadlock Scrimmages",
    description: "Organize competitive Deadlock scrimmages. Build your team, post matches, and compete.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({ headers: await headers() });

    return (
        <html
            lang="en"
            className={`${inter.variable} dark h-full antialiased`}
        >
            <body className="min-h-full flex flex-col bg-background text-foreground">
                <TooltipProvider>
                    <Navbar />
                    <div className="flex flex-col flex-1 pt-16">
                        {children}
                    </div>
                    <Footer />
                    <Notification userId={session?.user.id} />
                    <Toaster />
                </TooltipProvider>
            </body>
        </html>
    );
}
