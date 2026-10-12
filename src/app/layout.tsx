import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Marlon Sotero · Apresentações de empreendimentos", template: "%s · Marlon Sotero" },
  description: "Apresentações de empreendimentos selecionados por Marlon Sotero, corretor de imóveis em São José do Rio Preto/SP.",
  // Links são enviados diretamente aos clientes; não há interesse em indexação.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f8fafc" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Renderização por requisição: necessária para o nonce da CSP (ver src/proxy.ts).
  await connection();
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-4 focus:py-3 focus:text-white">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
