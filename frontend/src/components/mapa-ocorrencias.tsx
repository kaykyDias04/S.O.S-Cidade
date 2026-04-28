"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { type Denuncia } from "@/src/lib/api";

const BAIRRO_COORDS: Record<string, [number, number]> = {
  "Afogados": [-8.0768, -34.9076],
  "Aflitos": [-8.0381, -34.8972],
  "Água Fria": [-8.0150, -34.8950],
  "Alto do Mandu": [-8.0185, -34.9317],
  "Alto José Bonifácio": [-8.0163, -34.9142],
  "Alto José do Pinho": [-8.0244, -34.9102],
  "Alto Santa Terezinha": [-8.0051, -34.8911],
  "Apipucos": [-8.0191, -34.9372],
  "Areias": [-8.0862, -34.9287],
  "Arruda": [-8.0260, -34.8880],
  "Barro": [-8.0872, -34.9452],
  "Beberibe": [-8.0080, -34.9020],
  "Boa Viagem": [-8.1250, -34.9000],
  "Boa Vista": [-8.0580, -34.8820],
  "Bomba do Hemetério": [-8.0139, -34.8994],
  "Bongi": [-8.0651, -34.9147],
  "Brasília Teimosa": [-8.0850, -34.8750],
  "Brejo da Guabiraba": [-7.9942, -34.9331],
  "Brejo de Beberibe": [-8.0050, -34.9242],
  "Cabanga": [-8.0781, -34.8892],
  "Cajueiro": [-8.0198, -34.8914],
  "Campina do Barreto": [-8.0211, -34.8841],
  "Campo Grande": [-8.0360, -34.8870],
  "Casa Amarela": [-8.0250, -34.9150],
  "Casa Forte": [-8.0336, -34.9192],
  "Caxangá": [-8.0320, -34.9550],
  "Cidade Universitária": [-8.0519, -34.9497],
  "Coelhos": [-8.0660, -34.8880],
  "Cohab": [-8.1147, -34.9547],
  "Coqueiral": [-8.0838, -34.9529],
  "Córrego do Jenipapo": [-8.0053, -34.9344],
  "Cordeiros": [-8.0440, -34.9280],
  "Curado": [-8.0700, -34.9642],
  "Derby": [-8.0540, -34.8990],
  "Dois Irmãos": [-8.0140, -34.9440],
  "Dois Unidos": [-7.9998, -34.9094],
  "Encruzilhada": [-8.0350, -34.8900],
  "Engenho do Meio": [-8.0475, -34.9389],
  "Espinheiro": [-8.0400, -34.8980],
  "Estância": [-8.0792, -34.9208],
  "Fundão": [-8.0172, -34.8786],
  "Graças": [-8.0410, -34.9020],
  "Guabiraba": [-7.9719, -34.9422],
  "Hipódromo": [-8.0303, -34.8856],
  "Ibura": [-8.1250, -34.9400],
  "Ilha do Leite": [-8.0672, -34.8951],
  "Ilha Joana Bezerra": [-8.0772, -34.8956],
  "Imbiribeira": [-8.1050, -34.9150],
  "Ipsep": [-8.1000, -34.9220],
  "Iputinga": [-8.0350, -34.9380],
  "Jaqueira": [-8.0380, -34.9050],
  "Jardim São Paulo": [-8.0850, -34.9250],
  "Jiquiá": [-8.0786, -34.9167],
  "Jordão": [-8.1353, -34.9308],
  "Linha do Tiro": [-8.0069, -34.8986],
  "Macaxeira": [-8.0131, -34.9275],
  "Madalena": [-8.0530, -34.9080],
  "Mangueira": [-8.0761, -34.9122],
  "Monteiro": [-8.0289, -34.9250],
  "Morro da Conceição": [-8.0217, -34.9075],
  "Munheca": [-8.0480, -34.9580],
  "Nova Descoberta": [-8.0061, -34.9172],
  "Paissandu": [-8.0625, -34.8978],
  "Parnamirim": [-8.0350, -34.9100],
  "Passarinho": [-7.9864, -34.9175],
  "Pina": [-8.0900, -34.8820],
  "Poço da Panela": [-8.0314, -34.9214],
  "Ponto de Parada": [-8.0328, -34.8894],
  "Prado": [-8.0620, -34.9050],
  "Rosarinho": [-8.0320, -34.8960],
  "San Martin": [-8.0550, -34.9250],
  "Sancho": [-8.0844, -34.9458],
  "Santana": [-8.0322, -34.9158],
  "Santo Amaro": [-8.0450, -34.8800],
  "Santo Antônio": [-8.0633, -34.8775],
  "São José": [-8.0680, -34.8780],
  "Sítio dos Pintos": [-8.0211, -34.9553],
  "Soledade": [-8.0556, -34.8906],
  "Tamandaré": [-8.0353, -34.8942],
  "Tamarineira": [-8.0260, -34.9080],
  "Tejipió": [-8.0750, -34.9550],
  "Torre": [-8.0430, -34.9070],
  "Torreão": [-8.0320, -34.8920],
  "Totó": [-8.0825, -34.9608],
  "Várzea": [-8.0450, -34.9600],
  "Zumbi": [-8.0519, -34.9158]
}

const NORMALIZED_BAIRRO_COORDS = Object.fromEntries(
  Object.entries(BAIRRO_COORDS).map(([k, v]) => [k.toLowerCase(), v])
);

const RECIFE_CENTER: [number, number] = [-8.0476, -34.8770];

const tipoDenunciaConfig: Record<string, string> = {
  "alagamento / esgoto": "text-cyan-700 bg-cyan-50 border-cyan-300",
  "assalto / violencia": "text-red-700 bg-red-50 border-red-300",
  "buraco na via": "text-orange-700 bg-orange-50 border-orange-300",
  "descarte irregular de lixo": "text-green-700 bg-green-50 border-green-300",
  "iluminacao publica": "text-yellow-700 bg-yellow-50 border-yellow-300",
  "iluminação pública": "text-yellow-700 bg-yellow-50 border-yellow-300",
  "outro": "text-gray-600 bg-gray-50 border-gray-300",
  "problema de transito": "text-blue-700 bg-blue-50 border-blue-300",
  "problema de trânsito": "text-blue-700 bg-blue-50 border-blue-300",
  "vandalismo": "text-purple-700 bg-purple-50 border-purple-300",
};

const situacaoConfig: Record<string, string> = {
  "em andamento": "text-orange-700 bg-orange-50 border-orange-300",
  "finalizada": "text-green-700 bg-green-50 border-green-300",
};

function getBadgeStyle(tipo: string) {
  const norm = tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return (
    tipoDenunciaConfig[tipo.toLowerCase()] ||
    tipoDenunciaConfig[norm] ||
    tipoDenunciaConfig["outro"]
  );
}

interface BairroGroup {
  bairro: string;
  coords: [number, number];
  denuncias: Denuncia[];
}

async function geocodeBairro(bairro: string): Promise<[number, number] | null> {
  try {
    const query = encodeURIComponent(`${bairro}, Recife, Pernambuco, Brazil`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      { headers: { "User-Agent": "SOSCidade/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.warn(`Geocoding failed for bairro: ${bairro}`, e);
  }
  return null;
}

function createClusterIcon(count: number) {
  const size = count > 5 ? 48 : count > 2 ? 40 : 34;
  const bg = count > 5 ? "#dc2626" : count > 2 ? "#f59e0b" : "#0284c7";

  return L.divIcon({
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: ${size > 40 ? 16 : 14}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid white;
        cursor: pointer;
      ">
        ${count}
      </div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MapaOcorrencias({ denuncias }: { readonly denuncias: Denuncia[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedBairro, setSelectedBairro] = useState<BairroGroup | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resolvedCoords, setResolvedCoords] = useState<Record<string, [number, number]>>({});
  const [deselectedTipos, setDeselectedTipos] = useState<Set<string>>(new Set());

  const availableTipos = useMemo(() => {
    const tipos = new Set<string>();
    denuncias.forEach((d) => {
      if (d.tipoDenuncia) tipos.add(d.tipoDenuncia);
    });
    return Array.from(tipos).sort();
  }, [denuncias]);

  const toggleFilter = (tipo: string) => {
    setDeselectedTipos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  };

  const bairroGroups = useMemo(() => {
    const groups: Record<string, Denuncia[]> = {};
    denuncias.forEach((d) => {
      const bairro = d.bairroOcorrencia?.trim();
      if (!bairro) return;
      if (deselectedTipos.has(d.tipoDenuncia)) return;

      if (!groups[bairro]) groups[bairro] = [];
      groups[bairro].push(d);
    });

    const allCoords = { ...NORMALIZED_BAIRRO_COORDS, ...resolvedCoords };

    return Object.entries(groups)
      .filter(([bairro]) => allCoords[bairro.toLowerCase()])
      .map(([bairro, denuncias]) => ({
        bairro,
        coords: allCoords[bairro.toLowerCase()],
        denuncias,
      }));
  }, [denuncias, resolvedCoords, deselectedTipos]);

  useEffect(() => {
    const unknownBairros = new Set<string>();
    denuncias.forEach((d) => {
      const bairro = d.bairroOcorrencia?.trim();
      if (bairro && !NORMALIZED_BAIRRO_COORDS[bairro.toLowerCase()] && !resolvedCoords[bairro.toLowerCase()]) {
        unknownBairros.add(bairro);
      }
    });

    if (unknownBairros.size === 0) return;

    const resolveAll = async () => {
      const newCoords: Record<string, [number, number]> = {};

      for (const bairro of unknownBairros) {
        const coords = await geocodeBairro(bairro);
        if (coords) {
          newCoords[bairro.toLowerCase()] = coords;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (Object.keys(newCoords).length > 0) {
        setResolvedCoords((prev) => ({ ...prev, ...newCoords }));
      }
    };

    resolveAll();
  }, [denuncias, resolvedCoords]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: RECIFE_CENTER,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 17,
      minZoom: 9,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (bairroGroups.length === 0) return;

    const bounds = L.latLngBounds([]);

    bairroGroups.forEach((group) => {
      const marker = L.marker(group.coords, {
        icon: createClusterIcon(group.denuncias.length),
      });

      marker.bindTooltip(
        `<strong>${group.bairro}</strong><br/>${group.denuncias.length} ocorrência${group.denuncias.length > 1 ? "s" : ""}`,
        { direction: "top", offset: [0, -20] }
      );

      marker.on("click", () => {
        setSelectedBairro(group);
        setModalOpen(true);
      });

      marker.addTo(map);
      bounds.extend(group.coords);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bairroGroups]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium">Mapa de Ocorrências</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em um alfinete para ver as denúncias do bairro
            </p>
          </div>
        </div>

        <div className="relative w-full min-h-[600px] h-full rounded-xl border shadow-sm overflow-hidden bg-stone-50">
          <div ref={mapRef} className="absolute inset-0 z-0" />

          <div
            className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur shadow-xl border border-stone-200 rounded-xl w-64 max-h-[80%] flex flex-col transition-all overflow-hidden"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-stone-100 bg-white">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </h3>
              {availableTipos.length > 0 && (
                <button
                  onClick={() => {
                    if (deselectedTipos.size === availableTipos.length) {
                      setDeselectedTipos(new Set());
                    } else {
                      setDeselectedTipos(new Set(availableTipos));
                    }
                  }}
                  className="text-[10px] uppercase font-bold text-sky-600 hover:text-sky-800 transition-colors"
                >
                  {deselectedTipos.size === availableTipos.length ? "Marcar Todos" : "Limpar"}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {availableTipos.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-4">Nenhuma denúncia encontrada.</p>
              ) : (
                availableTipos.map((tipo) => (
                  <label key={tipo} className="flex items-start gap-2.5 p-2 hover:bg-sky-50 rounded-lg cursor-pointer transition-colors group">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-stone-300 text-sky-600 focus:ring-sky-500 cursor-pointer shadow-sm"
                      checked={!deselectedTipos.has(tipo)}
                      onChange={() => toggleFilter(tipo)}
                    />
                    <span className="text-sm text-stone-700 leading-tight group-hover:text-stone-900 select-none">
                      {tipo}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              Ocorrências — {selectedBairro?.bairro}
            </DialogTitle>
            <DialogDescription>
              {selectedBairro?.denuncias.length} denúncia{(selectedBairro?.denuncias.length ?? 0) > 1 ? "s" : ""} registrada{(selectedBairro?.denuncias.length ?? 0) > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {selectedBairro?.denuncias.map((d) => {
              const sitStyle =
                situacaoConfig[d.situacao.toLowerCase()] ||
                "text-gray-600 bg-gray-50 border-gray-300";
              return (
                <div
                  key={d.id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      className={`px-2.5 py-0.5 text-xs font-medium border rounded-full ${getBadgeStyle(d.tipoDenuncia)}`}
                    >
                      {d.tipoDenuncia}
                    </Badge>
                    <Badge
                      className={`px-2.5 py-0.5 text-xs font-medium border rounded-full ${sitStyle}`}
                    >
                      {d.situacao}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground break-all">
                    {d.descricaoOcorrencia}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Protocolo: <strong>{d.protocolo}</strong></span>
                    <span>{d.dataOcorrencia}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Denunciante: {d.nomeDenunciante}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
