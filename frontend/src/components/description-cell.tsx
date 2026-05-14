import { Row } from "@tanstack/react-table";
import { DenunciaRow } from "./gestor-data-table";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { DialogContent } from "./ui/dialog";
import { DialogHeader } from "./ui/dialog";
import { DialogTitle } from "./ui/dialog";
import { DialogDescription } from "./ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Eye, MapPin, Calendar, User, FileText, AlertCircle, ImageIcon } from "lucide-react";
import { useState } from "react";

const situacaoStyle: Record<string, string> = {
  "em andamento": "text-orange-700 bg-orange-50 border-orange-300",
  "finalizada": "text-green-700 bg-green-50 border-green-300",
};

export function DescriptionCell({ row }: { row: Row<DenunciaRow> }) {
  const d = row.original;
  const sitStyle = situacaoStyle[d.situacao.toLowerCase()] || "text-gray-600 bg-gray-50 border-gray-300";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // imagens pode vir como string JSON (do banco) ou como array já parseado
  const imagensList: string[] = (() => {
    if (!d.imagens) return [];
    if (Array.isArray(d.imagens)) return d.imagens;
    try { return JSON.parse(d.imagens as unknown as string); } catch { return []; }
  })();

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

          <div className="col-span-2 space-y-2 border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Fotos da Ocorrência
            </p>
            
            {imagensList.length > 0 ? (
              selectedImage ? (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Foto ampliada"
                    className="w-full max-h-72 object-contain rounded-lg border border-stone-200 bg-stone-50"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black/80"
                  >
                    Voltar para miniaturas
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {imagensList.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(src)}
                      className="w-20 h-20 rounded-lg overflow-hidden border border-stone-200 hover:border-sky-400 transition-colors cursor-pointer bg-stone-50"
                    >
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )
            ) : (
              <p className="text-xs text-stone-400 italic">Nenhuma foto foi anexada a esta denúncia.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}