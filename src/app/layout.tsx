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
  description:
    "Sistema de emissão de certificados e certidões para alunos do Ensino Médio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden`}
      >
        <header className="border-b border-neutral-200 shrink-0">
          <div className="mx-auto max-w-6xl px-4 py-1.5 flex items-center gap-4 text-xs min-w-0">
            <div className="font-medium truncate min-w-0">
              Sistema de Certificação | Colégio Estadual Senor Abravanel
            </div>
            <nav className="flex items-center gap-3 text-neutral-600 shrink-0">
              {/* [FEAT:pagina-emissao-documentos_TEC5] menu principal global */}
              <Link href="/" className="hover:text-neutral-900">
                Home
              </Link>
              <Link href="/migracao" className="hover:text-neutral-900">
                Migração
              </Link>
              <Link href="/gestao-alunos" className="hover:text-neutral-900">
                Gestão de Alunos
              </Link>
              <Link href="/emissao-documentos" className="hover:text-neutral-900">
                Emissão de Documentos
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-4 flex-1 min-h-0 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
