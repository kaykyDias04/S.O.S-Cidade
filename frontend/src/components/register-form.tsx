"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { usersAPI } from "@/src/lib/api";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

const registerSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  role: z.enum(["DENUNCIANTE", "GESTOR"], { message: "Selecione um perfil." }),
});

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "DENUNCIANTE" },
  });

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      // Map new role names to legacy API roles if needed
      const apiRole = data.role === "GESTOR" ? "PROFESSOR" : "ALUNO";
      const result = await usersAPI.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: apiRole,
      });

      if (result.success) {
        toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
        form.reset();
      } else {
        toast.error(result.error || "Erro ao realizar cadastro.");
      }
    } catch {
      toast.error("Erro ao realizar cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-center">Cadastro</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input className="bg-stone-100 h-12" placeholder="Seu Nome Completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input className="bg-stone-100 h-12" placeholder="seu.email@mail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input className="bg-stone-100 h-12" type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perfil</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-stone-100 h-12">
                      <SelectValue placeholder="Selecione seu perfil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DENUNCIANTE">Denunciante (Cidadão)</SelectItem>
                    <SelectItem value="GESTOR">Gestor (Prefeitura / Órgão Público)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-700 hover:bg-sky-800 h-12 text-base font-semibold"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
