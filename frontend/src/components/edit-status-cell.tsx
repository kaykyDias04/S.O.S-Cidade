import { Row } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Edit } from "lucide-react";
import { ConfirmationModal } from "./confimation-form-dialog";
import { type DenunciaRow } from "./gestor-data-table"; 
import { useState } from "react";

export const EditStatusCell = ({ row }: { row: Row<DenunciaRow> }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectNovaSituacao = (novaSituacao: string) => {
    // Evita abrir o modal se a pessoa clicou na situação atual
    if (novaSituacao === row.original.situacao.toLowerCase()) return;
    
    setPendingStatus(novaSituacao);
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // AQUI VAI A SUA LÓGICA DE API
      // Exemplo: await api.updateDenuncia(row.original.protocolo, pendingStatus);
      
      // Simulando um tempo de requisição
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log(`Sucesso: Protocolo ${row.original.protocolo} atualizado para ${pendingStatus}`);
      
    } catch (error) {
      console.error("Erro ao atualizar situação", error);
    } finally {
      setIsUpdating(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Edit className="w-3 h-3 mr-2" />
            Editar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSelectNovaSituacao("em andamento")}>
            Em andamento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectNovaSituacao("finalizada")}>
            Finalizada
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isUpdating && setIsModalOpen(false)}
        onConfirm={handleConfirmUpdate}
        title="Atualizar Situação"
        description={`Tem certeza que deseja alterar o status da denúncia (Protocolo: ${row.original.protocolo}) para "${pendingStatus.toUpperCase()}"?`}
        isPending={isUpdating}
      />
    </>
  );
};