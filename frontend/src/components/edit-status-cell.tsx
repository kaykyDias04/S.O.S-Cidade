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
import { denunciasAPI } from "@/src/lib/api";
import { useDenunciasStore } from "@/src/store/useDenunciasStore";
import { toast } from "sonner";

export const EditStatusCell = ({ row, table }: { row: Row<DenunciaRow>; table?: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectNovaSituacao = (novaSituacao: string) => {
    if (novaSituacao.toLowerCase() === row.original.situacao.toLowerCase()) return;

    setPendingStatus(novaSituacao);
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setIsUpdating(true);

    try {
      // Find the denuncia ID from the store by matching protocolo
      const denuncias = useDenunciasStore.getState().denuncias;
      const denuncia = denuncias.find(d => d.protocolo === row.original.protocolo);

      if (denuncia) {
        // Call the backend API to persist the status change
        const response = await denunciasAPI.update(denuncia.id, { situacao: pendingStatus });

        if (response.success) {
          toast.success(`Status atualizado para "${pendingStatus}"`);
        } else {
          toast.error("Erro ao atualizar status no servidor.");
          return;
        }
      }

      // Update local table state
      const tableMeta = table?.options.meta as any;
      if (tableMeta && tableMeta.updateRow) {
        tableMeta.updateRow(row.original.protocolo, pendingStatus);
      }

      // Also update the global store
      useDenunciasStore.getState().updateDenunciaLocalmente(row.original.protocolo, pendingStatus);

    } catch (error) {
      console.error("Erro ao atualizar situação", error);
      toast.error("Erro ao atualizar status.");
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
          <DropdownMenuItem
            onClick={() => handleSelectNovaSituacao("Em andamento")}
            disabled={row.original.situacao.toLowerCase() === "em andamento"}
          >
            Em andamento
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSelectNovaSituacao("Finalizada")}
            disabled={row.original.situacao.toLowerCase() === "finalizada"}
          >
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