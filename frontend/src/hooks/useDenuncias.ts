import { useState, useEffect } from 'react';
import { denunciasAPI, Denuncia, PaginatedResponse } from '@/src/lib/api';

export interface UseDenunciasReturn {
  denuncias: Denuncia[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  total?: number;
}

export function useDenuncias(
  initialPage = 1,
  initialLimit = 50
): UseDenunciasReturn {
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [total, setTotal] = useState<number | undefined>();

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await denunciasAPI.list(page, limit);

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<Denuncia>;
        // Handle both paginated and direct array responses
        const items = Array.isArray(paginatedData) 
          ? paginatedData 
          : (paginatedData.data || []);
        setDenuncias(items);

        if (!Array.isArray(paginatedData) && paginatedData.meta) {
          setTotal(paginatedData.meta.total);
        }
      } else {
        setError(response.error || 'Falha ao buscar denúncias');
        setDenuncias([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      setDenuncias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  return {
    denuncias,
    loading,
    error,
    refetch,
    page,
    setPage,
    limit,
    total,
  };
}

export interface UseDenunciaReturn {
  denuncia: Denuncia | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  create: (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Denuncia | null>;
  update: (id: number, data: Partial<Denuncia>) => Promise<Denuncia | null>;
  delete: (id: number) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useDenuncia(id?: number): UseDenunciaReturn {
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const refetch = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await denunciasAPI.getById(id);
      if (response.success && response.data) {
        setDenuncia(response.data as Denuncia);
      } else {
        setError(response.error || 'Falha ao buscar denúncia');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const create = async (
    data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Denuncia | null> => {
    setCreating(true);
    setError(null);
    try {
      const response = await denunciasAPI.create(data);
      if (response.success && response.data) {
        setDenuncia(response.data as Denuncia);
        return response.data as Denuncia;
      } else {
        setError(response.error || 'Falha ao criar denúncia');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const update = async (
    updateId: number,
    data: Partial<Denuncia>
  ): Promise<Denuncia | null> => {
    setUpdating(true);
    setError(null);
    try {
      const response = await denunciasAPI.update(updateId, data);
      if (response.success && response.data) {
        setDenuncia(response.data as Denuncia);
        return response.data as Denuncia;
      } else {
        setError(response.error || 'Falha ao atualizar denúncia');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const deleteItem = async (deleteId: number): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    try {
      const response = await denunciasAPI.delete(deleteId);
      if (response.success) {
        if (deleteId === id) setDenuncia(null);
        return true;
      } else {
        setError(response.error || 'Falha ao excluir denúncia');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (id) refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    denuncia,
    loading,
    error,
    creating,
    updating,
    deleting,
    create,
    update,
    delete: deleteItem,
    refetch,
  };
}
