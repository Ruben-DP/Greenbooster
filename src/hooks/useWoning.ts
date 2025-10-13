import { useState, useCallback } from "react";
import {
  searchWoningen,
  createWoning,
  updateWoning,
  updateWoningMeasures,
} from "@/app/actions/woningActions";
import { Woning } from "@/types/woningen";

export interface UseWoningResult {
  woningen: Woning[];
  selectedWoning: Woning | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  search: (searchTerm?: string) => Promise<void>;
  selectWoning: (woning: Woning | null) => void;
  create: (formData: FormData) => Promise<boolean>;
  update: (id: string, formData: FormData) => Promise<boolean>;
  updateMeasures: (id: string, measures: any[]) => Promise<boolean>;
}

export function useWoning(): UseWoningResult {
  const [woningen, setWoningen] = useState<Woning[]>([]);
  const [selectedWoning, setSelectedWoning] = useState<Woning | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchWoningen(searchTerm);

      if (result.success && result.data) {
        setWoningen(result.data as Woning[]);
      } else {
        setError(result.error || "Search failed");
        setWoningen([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setWoningen([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectWoning = useCallback((woning: Woning | null) => {
    setSelectedWoning(woning);
    setError(null);
  }, []);

  const create = useCallback(async (formData: FormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createWoning(formData);

      if (result.success) {
        // Refresh the list
        await search();
        return true;
      } else {
        setError(result.error || "Creation failed");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const update = useCallback(async (id: string, formData: FormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateWoning(id, formData);

      if (result.success) {
        // Refresh the list
        await search();
        return true;
      } else {
        setError(result.error || "Update failed");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  const updateMeasures = useCallback(async (id: string, measures: any[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateWoningMeasures(id, measures);

      if (result.success) {
        return true;
      } else {
        setError(result.error || "Update measures failed");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update measures failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    woningen,
    selectedWoning,
    isLoading,
    error,
    search,
    selectWoning,
    create,
    update,
    updateMeasures,
  };
}
