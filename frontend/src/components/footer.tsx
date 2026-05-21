"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer className="bg-[#efefef] w-full py-2 sm:py-3 mt-auto border-t border-gray-200 relative z-[60]">
      <div className={cn(
        "mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 transition-all duration-300",
        isHome ? "max-w-7xl" : "max-w-none w-full"
      )}>
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <img
            src="/homepage-assets/Cesarschool_id48SvLdR4_0.png"
            alt="Cesar School"
            className="h-5 sm:h-6 md:h-8 object-contain"
          />
          <img
            src="/homepage-assets/icon recife.png"
            alt="Prefeitura do Recife"
            className="h-5 sm:h-6 md:h-8 object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6 text-[10px] sm:text-xs font-medium text-gray-500">
          <span className="cursor-pointer hover:text-gray-900 transition-colors">Termos de Uso</span>
          <span className="cursor-pointer hover:text-gray-900 transition-colors">Política de Privacidade</span>
          <span className="cursor-pointer hover:text-gray-900 transition-colors">Contato de Suporte</span>
        </div>
      </div>
    </footer>
  );
}
