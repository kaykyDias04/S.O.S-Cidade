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
  "Afogados": [-8.0700, -34.9050],
  "Água Fria": [-8.0125, -34.8975],
  "Arruda": [-8.0294, -34.8933],
  "Beberibe": [-8.0111, -34.9053],
  "Boa Viagem": [-8.1186, -34.8977],
  "Boa Vista": [-8.0578, -34.8786],
  "Brasília Teimosa": [-8.0819, -34.8706],
  "Campo Grande": [-8.0358, -34.8869],
  "Casa Amarela": [-8.0320, -34.9160],
  "Caxangá": [-8.0303, -34.9606],
  "Coelhos": [-8.0644, -34.8864],
  "Cordeiro": [-8.0460, -34.9350],
  "Derby": [-8.0533, -34.8978],
  "Dois Irmãos": [-8.0111, -34.9483],
  "Encruzilhada": [-8.0363, -34.8895],
  "Espinheiro": [-8.0383, -34.9003],
  "Graças": [-8.0436, -34.9008],
  "Ibura": [-8.1206, -34.9425],
  "Imbiribeira": [-8.1078, -34.9164],
  "IPSEP": [-8.0986, -34.9208],
  "Iputinga": [-8.0311, -34.9400],
  "Jaqueira": [-8.0378, -34.9075],
  "Jardim São Paulo": [-8.0944, -34.9144],
  "Madalena": [-8.0555, -34.9103],
  "Mustardinha": [-8.0675, -34.9108],
  "Parnamirim": [-8.0331, -34.9119],
  "Pina": [-8.0917, -34.8800],
  "Prado": [-8.0661, -34.9042],
  "Recife (Centro)": [-8.0631, -34.8711],
  "Rosarinho": [-8.0333, -34.8958],
  "San Martin": [-8.0478, -34.9297],
  "Santo Amaro": [-8.0536, -34.8811],
  "São José": [-8.0650, -34.8781],
  "Tamarineira": [-8.0244, -34.9131],
  "Tejipió": [-8.0533, -34.9486],
  "Torre": [-8.0472, -34.9072],
  "Torreão": [-8.0358, -34.8936],
  "Várzea": [-8.0400, -34.9547],
};

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

  const bairroGroups = useMemo(() => {
    const groups: Record<string, Denuncia[]> = {};
    denuncias.forEach((d) => {
      const bairro = d.bairroOcorrencia?.trim();
      if (!bairro) return;

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
  }, [denuncias, resolvedCoords]);

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
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
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
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
              <span className="text-muted-foreground">1-2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-muted-foreground">3-5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
              <span className="text-muted-foreground">6+</span>
            </div>
          </div>
        </div>
        <div
          ref={mapRef}
          className="relative z-0 w-full h-[500px] rounded-xl border shadow-sm overflow-hidden"
        />
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
