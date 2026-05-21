import React from "react";

export const LogoApp: React.FC = () => {
  return (
    <div className="relative z-10 w-full flex items-center justify-between mb-6 sm:mb-12">
      <h1 className="text-blue-900 font-bold text-3xl sm:text-5xl md:text-7xl">
        S.O.S Cidade
      </h1>
      <div className="relative w-14 h-14 sm:w-24 sm:h-24 md:w-40 md:h-40 mr-4 sm:mr-35 bg-sky-700 rounded-full flex items-center justify-center shadow-md">
        <img src="/logo.svg" alt="Logo SOS Cidade" className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20" />
      </div>
    </div>
  );
};
