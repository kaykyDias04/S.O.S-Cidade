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
  getFilteredRowModel,
  getPaginationRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table";
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
import { Search, Trash2 } from "lucide-react";
import { User, usersAPI } from "@/src/lib/api";
import { CriarGestorModal } from "./criar-gestor-modal";
import { ConfirmationModal } from "./confimation-form-dialog";
import { toast } from "sonner";
import { Badge } from "@/src/components/ui/badge";

const ActionCell = ({ row, onDeleteSuccess }: { row: Row<User>; onDeleteSuccess: () => void }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await usersAPI.delete(row.original.id);
      if (response.success) {
        toast.success("Gestor removido com sucesso.");
        onDeleteSuccess();
      } else {
        toast.error(response.error || "Não foi possível remover o gestor selecionado.");
      }
    } catch (error) {
      toast.error("Ocorreu uma falha ao tentar excluir o gestor. Tente novamente.");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Gestor"
        description={`Tem certeza que deseja excluir o gestor "${row.original.name}"? Esta ação não pode ser desfeita.`}
        isPending={isDeleting}
        confirmButtonText="Excluir"
      />
    </>
  );
};

export function GestoresDataTable({
  data,
  onRefresh,
}: {
  readonly data: User[];
  onRefresh: () => void;
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 6 });
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nome Completo",
      size: 150,
    },
    {
      accessorKey: "email",
      header: "E-mail",
      size: 150,
    },
    {
      accessorKey: "role",
      header: "Permissão",
      cell: ({ row }) => (
        <Badge className="px-3 py-1 text-sm font-medium border rounded-full text-sky-700 bg-sky-50 border-sky-300">
          {row.original.role}
        </Badge>
      ),
      size: 80,
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => <ActionCell row={row} onDeleteSuccess={onRefresh} />,
      size: 50,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, pagination, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-2 dark:bg-transparent">
      <div className="flex items-end justify-between lg:px-6">
        <div className="py-0.5 ml-[-1.5rem]">
          <span className="text-xl font-medium text-slate-800">Gestores</span>
          <div className="relative w-full max-w-md mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full md:w-74 pl-10"
              placeholder="Pesquise por nome ou email..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-[10px]">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer bg-sky-700 hover:bg-sky-800 text-white"
          >
            Criar Usuário Gestor
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                  >
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum gestor encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center px-4 lg:px-6">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Primeira página</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Página anterior</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 cursor-pointer"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Próxima página</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Última página</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CriarGestorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
