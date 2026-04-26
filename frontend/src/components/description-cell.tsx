import { Row } from "@tanstack/react-table";
import { DenunciaRow } from "./gestor-data-table";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { DialogContent } from "./ui/dialog";
import { DialogHeader } from "./ui/dialog";
import { DialogTitle } from "./ui/dialog";
import { DialogDescription } from "./ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Eye, MapPin, Calendar, User, FileText, AlertCircle } from "lucide-react";

const situacaoStyle: Record<string, string> = {
  "em andamento": "text-orange-700 bg-orange-50 border-orange-300",
  "finalizada": "text-green-700 bg-green-50 border-green-300",
};

export function DescriptionCell({ row }: { row: Row<DenunciaRow> }) {
  const d = row.original;
  const sitStyle = situacaoStyle[d.situacao.toLowerCase()] || "text-gray-600 bg-gray-50 border-gray-300";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Detalhes da Denúncia</DialogTitle>
          <DialogDescription className="break-all">
            Protocolo: <span className="font-bold">{d.protocolo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Tipo
            </p>
            <p className="font-medium">{d.tipoDenuncia}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Data
            </p>
            <p className="font-medium">{d.dataOcorrencia}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Denunciante
            </p>
            <p className="font-medium">{d.identificacao ? d.nomeDenunciante : "Anônimo"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Bairro
            </p>
            <p className="font-medium">{d.bairroOcorrencia}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Situação
            </p>
            <Badge className={`px-3 py-1 text-sm font-medium border rounded-full ${sitStyle}`}>
              {d.situacao}
            </Badge>
          </div>
          <div className="col-span-2 space-y-2 border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Descrição Completa
            </p>
            <p className="text-sm bg-muted p-4 rounded-lg leading-relaxed whitespace-pre-wrap break-all overflow-hidden max-h-48 overflow-y-auto">
              {d.descricaoOcorrencia}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}