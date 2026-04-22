import React from "react";

export const LogoApp: React.FC = () => {
  return (
    <div className="relative z-10 w-full flex items-center justify-between mb-12">
      <h1 className="text-blue-900 font-bold text-5xl sm:text-6xl md:text-7xl">
        S.O.S Cidade
      </h1>
      <div className="relative w-24 h-24 md:w-40 md:h-40 mr-35 bg-sky-700 rounded-full flex items-center justify-center shadow-md">
        <img src="/logo.svg" alt="Logo SOS Cidade" className="w-16 h-16 md:w-20 md:h-20" />
      </div>
    </div>
  );
};
