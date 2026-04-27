"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useDenunciasStore } from "@/src/store/useDenunciasStore";

import { Button } from "@/src/components/ui/button";
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
  "Afogados",
  "Água Fria",
  "Arruda",
  "Beberibe",
  "Boa Viagem",
  "Boa Vista",
  "Brasília Teimosa",
  "Campo Grande",
  "Casa Amarela",
  "Caxangá",
  "Coelhos",
  "Cordeiro",
  "Derby",
  "Dois Irmãos",
  "Encruzilhada",
  "Espinheiro",
  "Graças",
  "Ibura",
  "Imbiribeira",
  "IPSEP",
  "Iputinga",
  "Jaqueira",
  "Jardim São Paulo",
  "Madalena",
  "Mustardinha",
  "Parnamirim",
  "Pina",
  "Prado",
  "Recife (Centro)",
  "Rosarinho",
  "San Martin",
  "Santo Amaro",
  "São José",
  "Tamarineira",
  "Tejipió",
  "Torre",
  "Torreão",
  "Várzea",
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
  const { user } = useAuthStore();
  const { createDenuncia, fetchDenuncias } = useDenunciasStore();

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
      const anoAtual = new Date().getFullYear();
      const hashAleatorio = Math.random().toString(36).substring(2, 10).toUpperCase().padStart(8, '0');

      const generatedProtocolStr = `SOS-${anoAtual}-${hashAleatorio}`;
      const denunciaData = {
        tipoDenuncia: tipoLabels[dataToSubmit.tipoDenuncia] || dataToSubmit.tipoDenuncia,
        identificacao: !dataToSubmit.isAnonima,
        nomeDenunciante: dataToSubmit.isAnonima ? "Anônimo" : (user?.name || "Anônimo"),
        userId: user?.id,
        bairroOcorrencia: dataToSubmit.bairro,
        descricaoOcorrencia: dataToSubmit.descricao,
        dataOcorrencia: new Date().toLocaleDateString("pt-BR"),
        protocolo: generatedProtocolStr,
        situacao: "Em andamento",
      };

      const result = await createDenuncia(denunciaData);

      if (result) {
        setGeneratedProtocol(result.protocolo || generatedProtocolStr);
        setIsConfirmModalOpen(false);
        setDataToSubmit(null);

        // Refresh the global store so gestor table sees new data
        await fetchDenuncias();

        form.reset({
          tipoDenuncia: "" as any,
          isAnonima: true,
          bairro: "",
          descricao: "",
          consentimento: false,
        });

        setTimeout(() => {
          setIsProtocolModalOpen(true);
        }, 300);

        toast.success("Denúncia registrada com sucesso!");
      } else {
        toast.error("Falha ao registrar denúncia. Tente novamente.");
        setIsConfirmModalOpen(false);
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
        <div className="mb-8 text-center">
          <h1 className="md:text-3xl font-bold text-gray-800">Nova Denúncia Urbana</h1>
          <p className="text-gray-500 text-lg md:text-md mt-2">
            Preencha os campos abaixo para registrar um problema na cidade de Recife
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormValidation)}
            className="space-y-2 mx-auto flex flex-col items-center"
          >
            <FormField
              control={form.control}
              name="tipoDenuncia"
              render={({ field }) => (
                <FormItem className="w-full relative pb-7">
                  <FormLabel className="text-sm">Tipo do Problema:</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm cursor-pointer">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem className="text-md" value="ALAGAMENTO">Alagamento / Esgoto</SelectItem>
                      <SelectItem className="text-md" value="ASSALTO">Assalto / Violência</SelectItem>
                      <SelectItem className="text-md" value="BURACO_VIA">Buraco na Via</SelectItem>
                      <SelectItem className="text-md" value="LIXO">Descarte Irregular de Lixo</SelectItem>
                      <SelectItem className="text-md" value="ILUMINACAO">Iluminação Pública</SelectItem>
                      <SelectItem className="text-md" value="TRANSITO">Problema de Trânsito</SelectItem>
                      <SelectItem className="text-md" value="VANDALISMO">Vandalismo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="absolute bottom-1 left-0 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAnonima"
              render={({ field }) => (
                <FormItem className="w-full relative pb-7">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 bg-gray-50/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Denúncia Anônima</FormLabel>
                      <FormDescription className="text-xs">
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
                  </div>
                  <FormMessage className="absolute bottom-1 left-0 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem className="w-full relative pb-7">
                  <FormLabel className="text-sm">Bairro / Região (Recife):</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm cursor-pointer">
                        <SelectValue placeholder="Selecione o bairro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {BAIRROS_RECIFE.map((bairro) => (
                        <SelectItem key={bairro} className="text-sm" value={bairro}>
                          {bairro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="absolute bottom-1 left-0 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="w-full relative pb-7">
                  <FormLabel className="text-sm">Descrição do Problema:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o problema com o máximo de detalhes: localização exata, gravidade, há quanto tempo existe..."
                      className="resize-none placeholder:text-sm h-auto min-h-[100px]"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="absolute bottom-1 left-0 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consentimento"
              render={({ field }) => (
                <FormItem className="w-full relative pb-10">
                  <div className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        className="cursor-pointer"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer leading-tight">
                      Autorizo o compartilhamento desta denúncia com os órgãos competentes da Prefeitura do Recife
                    </FormLabel>
                  </div>
                  <FormMessage className="absolute bottom-4 left-0 text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full md:w-1/2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
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
