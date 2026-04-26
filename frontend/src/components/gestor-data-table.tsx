import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { DropdownHeaderTable } from "./dropdown-header-table";
import { ArrowUpDown, ArrowDown, ArrowUp, Search } from "lucide-react";
import { DescriptionCell } from "./description-cell";
import { EditStatusCell } from "./edit-status-cell";

const tipoDenunciaConfig: Record<string, string> = {
  "alagamento / esgoto": "text-cyan-700 bg-white border-cyan-600 hover:bg-cyan-600/20",
  "assalto / violencia": "text-red-700 bg-white border-red-600 hover:bg-red-600/20",
  "assalto / violência": "text-red-700 bg-white border-red-600 hover:bg-red-600/20",
  "buraco na via": "text-orange-700 bg-white border-orange-600 hover:bg-orange-600/20",
  "descarte irregular de lixo": "text-green-700 bg-white border-green-600 hover:bg-green-600/20",
  "iluminacao publica": "text-yellow-700 bg-white border-yellow-500 hover:bg-yellow-500/20",
  "iluminação pública": "text-yellow-700 bg-white border-yellow-500 hover:bg-yellow-500/20",
  "outro": "text-gray-600 bg-white border-gray-500 hover:bg-gray-500/20",
  "problema de transito": "text-blue-700 bg-white border-blue-600 hover:bg-blue-600/20",
  "problema de trânsito": "text-blue-700 bg-white border-blue-600 hover:bg-blue-600/20",
  "vandalismo": "text-purple-700 bg-white border-purple-600 hover:bg-purple-600/20",
};

export type DenunciaRow = {
  id?: number;
  tipoDenuncia: string;
  identificacao: boolean;
  nomeDenunciante: string;
  bairroOcorrencia: string;
  descricaoOcorrencia: string;
  dataOcorrencia: string;
  protocolo: string;
  situacao: string;
};

const situacaoConfig: Record<string, string> = {
  "em andamento": "text-orange-700 bg-orange-50 border-orange-300",
  "finalizada": "text-green-700 bg-green-50 border-green-300",
};

const columns: ColumnDef<DenunciaRow>[] = [
  {
    accessorKey: "tipoDenuncia",
    header: ({ column }) => (
      <DropdownHeaderTable column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipoNorm = row.original.tipoDenuncia
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const styleClasses =
        tipoDenunciaConfig[row.original.tipoDenuncia.toLowerCase()] ||
        tipoDenunciaConfig[tipoNorm] ||
        tipoDenunciaConfig["outro"];
      return (
        <Badge className={`px-3 py-1 text-sm font-medium border rounded-full transition-colors ${styleClasses}`}>
          {row.original.tipoDenuncia}
        </Badge>
      );
    },
    size: 60,
  },
  {
    accessorKey: "nomeDenunciante",
    header: "Denunciante",
    cell: ({ row }) => {
      const d = row.original;
      return d.identificacao ? (
        <span>{d.nomeDenunciante}</span>
      ) : (
        <span className="text-gray-500 italic">Anônimo</span>
      );
    },
    size: 50,
  },
  {
    accessorKey: "dataOcorrencia",
    header: "Data",
    size: 50,
  },
  {
    accessorKey: "bairroOcorrencia",
    header: ({ column }) => (
      <DropdownHeaderTable column={column} title="Bairro / Região" />
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    size: 60,
  },
  {
    accessorKey: "descricaoOcorrencia",
    header: "Descrição",
    cell: ({ row }) => <DescriptionCell row={row} />,
    size: 100,
  },
  {
    accessorKey: "protocolo",
    header: ({ column }) => {
      const sortDirection = column.getIsSorted();
      const SortIcon =
        sortDirection === "desc" ? ArrowDown : sortDirection === "asc" ? ArrowUp : ArrowUpDown;
      return (
        <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
          Protocolo
          <SortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    size: 50,
  },
  {
    accessorKey: "situacao",
    header: "Situação",
    cell: ({ row }) => {
      const s = row.original.situacao.toLowerCase();
      const style = situacaoConfig[s] || "text-gray-600 bg-gray-50 border-gray-300";
      return (
        <Badge className={`px-3 py-1 text-sm font-medium border rounded-full ${style}`}>
          {row.original.situacao}
        </Badge>
      );
    },
    size: 50,
  },
  {
    id: "editar",
    header: "Ações",
    cell: ({ row, table }) => <EditStatusCell row={row} table={table} />,
    size: 100,
  },
];

function SimpleRow({ row }: { readonly row: Row<DenunciaRow> }) {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DenunciasDataTable({ data }: { readonly data: DenunciaRow[] }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 8 });
  const [localData, setLocalData] = React.useState<DenunciaRow[]>(data);

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const table = useReactTable({
    data: localData,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination, globalFilter },
    meta: {
      updateRow: (protocolo: string, novaSituacao: string) => {
        setLocalData((old) =>
          old.map((row) =>
            row.protocolo === protocolo ? { ...row, situacao: novaSituacao } : row
          )
        );
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-3 dark:bg-transparent">
      <div className="flex items-end justify-between lg:px-6">
        <div className="py-1.5 ml-[-1.5rem]">
          <span className="text-2xl font-medium">Pesquisa</span>
          <div className="relative w-full max-w-md mt-[10px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full md:w-74 pl-10"
              placeholder="Pesquise por bairro, tipo, protocolo..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => <SimpleRow key={row.id} row={row} />)
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhuma denúncia encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center px-4 lg:px-6">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
              onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Primeira página</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Página anterior</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Próxima página</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Última página</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
