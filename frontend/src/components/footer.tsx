import React from "react";

export function Footer() {
  return (
    <footer className="bg-[#efefef] w-full py-4 mt-auto border-t border-gray-200 relative z-[60]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <img 
            src="/homepage-assets/Cesarschool_id48SvLdR4_0.png" 
            alt="Cesar School" 
            className="h-8 object-contain"
          />
          <img 
            src="/homepage-assets/icon recife.png" 
            alt="Prefeitura do Recife" 
            className="h-8 object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs font-medium text-gray-500">
          <span className="cursor-pointer hover:text-gray-900 transition-colors">Termos de Uso</span>
          <span className="cursor-pointer hover:text-gray-900 transition-colors">Política de Privacidade</span>
          <span className="cursor-pointer hover:text-gray-900 transition-colors">Contato de Suporte</span>
        </div>
      </div>
    </footer>
  );
}
