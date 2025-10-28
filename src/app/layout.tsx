import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Senor Abravanel - Certificados e Certidões",
  description: "Sistema de emissão de certificados e certidões para alunos do Ensino Médio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4 text-sm">
            <div className="font-medium">Senor Abravanel</div>
            <nav className="flex items-center gap-3 text-neutral-600">
              <Link href="/#migracao" className="hover:text-neutral-900">Migração</Link>
              <Link href="/#inconsistencias" className="hover:text-neutral-900">Inconsistências</Link>
              <Link href="/#alunos" className="hover:text-neutral-900">Alunos</Link>
              <Link href="/#impressao" className="hover:text-neutral-900">Impressão</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-4 min-h-dvh">
          {children}
        </main>
      </body>
    </html>
  );
}
