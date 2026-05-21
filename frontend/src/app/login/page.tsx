"use client";
import { Toaster } from "@/src/components/ui/sonner";
import { LoginForm } from "@/src/components/login-form";
import { RegisterForm } from "@/src/components/register-form";
import { LogoApp } from "@/src/components/logo";

const AuthPage = () => {
  return (
    <div className="bg-stone-100 flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0 overflow-y-auto">
      <Toaster position="top-center" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl p-5 sm:p-8 lg:p-12 overflow-hidden my-auto">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <svg
            className="absolute top-0 left-0 w-full h-auto"
            viewBox="0 0 950 300"
            preserveAspectRatio="none"
          >
            
            <path
              d="M0,0 L1300,0 L1100,5 L500,200 L0,200 Z"
              className="fill-stone-50"
            />
          </svg>
        </div>
        <LogoApp />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-10 lg:gap-16">
          <div className="w-full md:w-1/2">
            <LoginForm />
          </div>
          <div className="hidden md:block w-px bg-stone-200 self-stretch"></div>
          <div className="w-full md:w-1/2">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
