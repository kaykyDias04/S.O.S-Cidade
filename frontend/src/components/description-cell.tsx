import { Row } from "@tanstack/react-table";
import { DenunciaRow } from "./gestor-data-table";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { DialogContent } from "./ui/dialog";
import { DialogHeader } from "./ui/dialog";
import { DialogTitle } from "./ui/dialog";
import { DialogDescription } from "./ui/dialog";
import { Eye } from "lucide-react";

export function DescriptionCell({ row }: { row: Row<DenunciaRow> }) {
  const d = row.original;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Denúncia</DialogTitle>
          <DialogDescription>
            Protocolo: <span className="font-bold">{d.protocolo}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Tipo</p>
            <p>{d.tipoDenuncia}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Data</p>
            <p>{d.dataOcorrencia}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Denunciante</p>
            <p>{d.identificacao ? d.nomeDenunciante : "Anônimo"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Bairro</p>
            <p>{d.bairroOcorrencia}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Situação</p>
            <p className="capitalize">{d.situacao}</p>
          </div>
          <div className="col-span-2 space-y-1 border-t pt-4">
            <p className="text-sm font-semibold text-muted-foreground">Descrição Completa</p>
            <p className="text-sm bg-muted p-3 rounded-md leading-relaxed">
              {d.descricaoOcorrencia}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}