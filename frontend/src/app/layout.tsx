import { AuthProvider } from "@/src/contexts/auth-context";
import "@/src/app/globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/src/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "SOS Cidade — Denúncias Urbanas de Recife",
  description: "Sistema de denúncias urbanas da Região Metropolitana do Recife. Reporte problemas como buracos, iluminação, lixo, assaltos e muito mais.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={cn("font-sans", geist.variable)}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
