import "@/src/app/globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cn } from "@/src/lib/utils";

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'], 
  variable: '--font-sans' 
});

export const metadata: Metadata = {
  title: "SOS Cidade — Denúncias Urbanas de Recife",
  description: "Sistema de denúncias urbanas da Região Metropolitana do Recife. Reporte problemas como buracos, iluminação, lixo, assaltos e muito mais.",
};

import { Footer } from "@/src/components/footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={cn("font-sans", poppins.variable)}>
      <body className="h-screen flex flex-col overflow-hidden">
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden relative z-0">
          {children}
        </main>
        <div className="z-40 bg-white shrink-0 relative">
          <Footer />
        </div>
      </body>
    </html>
  );
}
