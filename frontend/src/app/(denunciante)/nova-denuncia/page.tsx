import { FormDenuncias } from "@/src/components/form-denuncias";

export default function NovaDenuncia() {
  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nova Denúncia</h1>
        <p className="text-slate-500">Preencha os campos abaixo para registrar uma nova ocorrência</p>
      </div>
      <FormDenuncias />
    </div>
  );
}
