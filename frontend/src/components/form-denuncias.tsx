"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/auth-context";
import { useDenuncia } from "@/src/hooks/useDenuncias";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Switch } from "@/src/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

import { ConfirmationModal } from "./confimation-form-dialog";
import { ProtocolModal } from "./protocol-modal";

const BAIRROS_RECIFE = [
  "Boa Viagem", "Casa Amarela", "Casa Forte", "Boa Vista", "Santo Amaro",
  "Afogados", "Imbiribeira", "Pina", "Piedade", "Encruzilhada",
  "Espinheiro", "Graças", "Madalena", "Torre", "Várzea",
  "Dois Irmãos", "Apipucos", "Brejo da Guabiraba", "Iputinga",
  "Tejipió", "Mustardinha", "San Martin", "Areias", "Caçote",
  "Jardim São Paulo", "Arruda", "Água Fria", "Beberibe", "Campina do Barreto",
  "Porto da Madeira", "Outro",
];

const denunciaSchema = z.object({
  tipoDenuncia: z.enum([
    "BURACO_VIA", "ILUMINACAO", "LIXO", "ASSALTO",
    "TRANSITO", "ALAGAMENTO", "VANDALISMO", "OUTRO"
  ], { message: "Selecione o tipo da denúncia." }),
  isAnonima: z.boolean().default(true),
  bairro: z.string().min(2, { message: "Selecione o bairro da ocorrência." }),
  descricao: z
    .string()
    .min(20, { message: "Descreva com no mínimo 20 caracteres." }),
  consentimento: z
    .boolean()
    .refine((val) => val === true, { message: "Você precisa autorizar o compartilhamento dos dados." }),
});

type DenunciaFormData = z.input<typeof denunciaSchema>;

const tipoLabels: Record<string, string> = {
  BURACO_VIA: "Buraco na Via",
  ILUMINACAO: "Iluminação Pública",
  LIXO: "Descarte Irregular de Lixo",
  ASSALTO: "Assalto / Violência",
  TRANSITO: "Problema de Trânsito",
  ALAGAMENTO: "Alagamento / Esgoto",
  VANDALISMO: "Vandalismo",
  OUTRO: "Outro",
};

export function FormDenuncias() {
  const form = useForm<DenunciaFormData>({
    resolver: zodResolver(denunciaSchema),
    defaultValues: {
      tipoDenuncia: "" as any,
      isAnonima: true,
      bairro: "",
      descricao: "",
      consentimento: false,
    },
  });

  const router = useRouter();
  const { user } = useAuth();
  const { create } = useDenuncia();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [dataToSubmit, setDataToSubmit] = useState<DenunciaFormData | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState("");

  function handleFormValidation(values: DenunciaFormData) {
    setDataToSubmit(values);
    setIsConfirmModalOpen(true);
  }

  async function handleConfirmSubmit() {
    if (!dataToSubmit) return;
    setIsPending(true);

    try {
      const denunciaData = {
        tipoDenuncia: tipoLabels[dataToSubmit.tipoDenuncia] || dataToSubmit.tipoDenuncia,
        identificacao: !dataToSubmit.isAnonima,
        nomeDenunciante: dataToSubmit.isAnonima ? "Anônimo" : (user?.name || "Anônimo"),
        bairroOcorrencia: dataToSubmit.bairro,
        descricaoOcorrencia: dataToSubmit.descricao,
        dataOcorrencia: new Date().toLocaleDateString("pt-BR"),
        protocolo: "",
        situacao: "Em andamento",
      };

      const result = await create(denunciaData);

      if (result && result.protocolo) {
        setGeneratedProtocol(result.protocolo);

        setIsConfirmModalOpen(false);
        setDataToSubmit(null);

        form.reset({
          tipoDenuncia: "" as any,
          isAnonima: true,
          bairro: "",
          descricao: "",
          consentimento: false,
        });

        setTimeout(() => {
          setIsProtocolModalOpen(true);
        }, 100);

        toast.success("Denúncia registrada com sucesso!");
      } else {
        throw new Error("Falha ao obter protocolo");
      }
    } catch (error) {
      toast.error("Houve um erro ao enviar a denúncia.");
      console.error(error);
      setIsConfirmModalOpen(false);
    } finally {
      setIsPending(false);
    }
  }

  function handleCloseModal() {
    setIsConfirmModalOpen(false);
    setDataToSubmit(null);
  }

  function handleCloseProtocolModal() {
    setIsProtocolModalOpen(false);
    setGeneratedProtocol("");
    router.push("/homepage-denunciante");
  }

  return (
    <>
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-4xl mx-auto">
        <div className="mb-4 text-center">
          <h1 className="md:text-3xl font-bold text-gray-800">Nova Denúncia Urbana</h1>
          <p className="text-gray-500 text-lg md:text-lg">
            Preencha os campos abaixo para registrar um problema na cidade de Recife
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormValidation)}
            className="space-y-4 mx-auto flex flex-col items-center text-2xl"
          >
            {/* Tipo de Denúncia */}
            <FormField
              control={form.control}
              name="tipoDenuncia"
              render={({ field }) => (
                <FormItem className="w-full relative pb-6">
                  <FormLabel className="text-lg">Tipo do Problema:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg cursor-pointer">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem className="text-lg" value="BURACO_VIA">🕳️ Buraco na Via</SelectItem>
                      <SelectItem className="text-lg" value="ILUMINACAO">💡 Iluminação Pública</SelectItem>
                      <SelectItem className="text-lg" value="LIXO">🗑️ Descarte Irregular de Lixo</SelectItem>
                      <SelectItem className="text-lg" value="ASSALTO">🚨 Assalto / Violência</SelectItem>
                      <SelectItem className="text-lg" value="TRANSITO">🚦 Problema de Trânsito</SelectItem>
                      <SelectItem className="text-lg" value="ALAGAMENTO">🌊 Alagamento / Esgoto</SelectItem>
                      <SelectItem className="text-lg" value="VANDALISMO">🔨 Vandalismo</SelectItem>
                      <SelectItem className="text-lg" value="OUTRO">📋 Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="absolute bottom-0 left-0" />
                </FormItem>
              )}
            />

            {/* Denúncia Anônima */}
            <FormField
              control={form.control}
              name="isAnonima"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 w-full">
                  <div className="space-y-1">
                    <FormLabel className="text-lg">Denúncia Anônima</FormLabel>
                    <FormDescription className="text-lg">
                      {field.value
                        ? "Sua identidade não será revelada."
                        : "Sua denúncia será identificada com seu nome."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      className="cursor-pointer"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Bairro */}
            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem className="w-full relative pb-6">
                  <FormLabel className="text-lg">Bairro / Região (Recife):</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-lg cursor-pointer">
                        <SelectValue placeholder="Selecione o bairro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {BAIRROS_RECIFE.map((bairro) => (
                        <SelectItem key={bairro} className="text-lg" value={bairro}>
                          {bairro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="absolute bottom-0 left-0" />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="w-full relative pb-6">
                  <FormLabel className="text-lg">Descrição do Problema:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o problema com o máximo de detalhes: localização exata, gravidade, há quanto tempo existe..."
                      className="resize-none placeholder:text-lg"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="absolute bottom-0 left-0" />
                </FormItem>
              )}
            />

            {/* Consentimento */}
            <FormField
              control={form.control}
              name="consentimento"
              render={({ field }) => (
                <div className="w-full relative pb-6">
                  <FormItem className="flex flex-row items-center space-x-4 space-y-0">
                    <FormControl>
                      <Checkbox
                        className="cursor-pointer"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-lg">
                        Autorizo o compartilhamento desta denúncia com os órgãos competentes da Prefeitura do Recife
                      </FormLabel>
                    </div>
                  </FormItem>
                  <FormMessage className="absolute bottom-0 left-0" />
                </div>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-1/2 cursor-pointer bg-blue-600 hover:bg-blue-700 mt-4 text-lg font-semibold"
            >
              Enviar Denúncia
            </Button>
          </form>
        </Form>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubmit}
        isPending={isPending}
        title="Confirmar Envio da Denúncia"
        description="Você confirma o registro desta denúncia urbana? Ela será encaminhada ao órgão responsável da Prefeitura do Recife."
        confirmButtonText="Confirmar"
        cancelButtonText="Cancelar"
      />

      <ProtocolModal
        isOpen={isProtocolModalOpen}
        onClose={handleCloseProtocolModal}
        onConfirm={handleCloseProtocolModal}
        title="Denúncia Registrada com Sucesso!"
        description={`Sua denúncia foi encaminhada. Anote o número de protocolo para acompanhamento: ${generatedProtocol}`}
      />
    </>
  );
}
