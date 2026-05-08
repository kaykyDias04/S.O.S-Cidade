import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { usersAPI } from "@/src/lib/api";
import { ConfirmationModal } from "./confimation-form-dialog";
import { toast } from "sonner";

interface CriarGestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CriarGestorModal = ({ isOpen, onClose, onSuccess }: CriarGestorModalProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmacaoSenha: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmacaoSenha) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    if (formData.senha !== formData.confirmacaoSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    setIsConfirmationOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await usersAPI.create({
        name: formData.nome,
        email: formData.email,
        password: formData.senha,
        role: "GESTOR",
      });

      if (response.success) {
        toast.success("Gestor criado com sucesso!");
        setFormData({ nome: "", email: "", senha: "", confirmacaoSenha: "" });
        setIsConfirmationOpen(false);
        onClose();
        onSuccess();
      } else {
        setError(response.error || "Erro ao criar gestor.");
        setIsConfirmationOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao criar gestor.");
      setIsConfirmationOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isConfirmationOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleInitialSubmit}>
            <DialogHeader>
              <DialogTitle>Criar Usuário Gestor</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo gestor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: joao@soscidade.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmacaoSenha">Confirmação de Senha</Label>
                <Input
                  id="confirmacaoSenha"
                  name="confirmacaoSenha"
                  type="password"
                  value={formData.confirmacaoSenha}
                  onChange={handleChange}
                />
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer bg-sky-700 hover:bg-sky-800 text-white">
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Cadastro"
        description={`Tem certeza que deseja cadastrar o gestor "${formData.nome}" (${formData.email})?`}
        isPending={isSubmitting}
      />
    </>
  );
};
