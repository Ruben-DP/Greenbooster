"use client";
import { Measure } from "@/types/measures";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { ChangeRecord } from "@/types/types";
import {
  searchMeasures as searchMeasuresAPI,
  createMeasure as createMeasureAPI,
  updateMeasure as updateMeasureAPI,
} from "@/app/actions/measureActions";
import { fetchVariables } from "@/app/actions/variableActions";

interface DataContextType {
  measures: Measure[];
  selectedMeasure: Measure | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  pendingChanges: Record<string, ChangeRecord>;
  variables: Array<{ variableName: string }>;
  searchMeasures: (searchTerm?: string) => Promise<void>;
  selectMeasure: (measure: Measure | null, startEditing?: boolean) => void;
  createMeasure: (measure: Measure) => Promise<boolean>;
  updateMeasure: (measure: Measure) => Promise<boolean>;
  setIsEditing: (isEditing: boolean) => void;
  setPendingChanges: (changes: Record<string, ChangeRecord>) => void;
}
const DataContext = createContext<DataContextType | null>(null);

//catches actions and manages states, then fires the actions serverside trough /actions
export function DataProvider({ children }: { children: ReactNode }) {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [selectedMeasure, setSelectedMeasure] = useState<Measure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, ChangeRecord>
  >({});
  const [variables, setVariables] = useState<Array<{ variableName: string }>>(
    []
  );

  const searchMeasures = async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const results = await searchMeasuresAPI(searchTerm);
      setMeasures(results);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const selectMeasure = (measure: Measure | null, startEditing = false) => {
    setSelectedMeasure(measure);
    setIsEditing(startEditing);
    if (!measure) setPendingChanges({});
  };

  const createMeasure = async (measure: Measure): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await createMeasureAPI(measure);
      if (result.success) {
        await searchMeasures();
        setError(null);
        return true;
      }
      setError(result.error || "Creation failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMeasure = async (measure: Measure): Promise<boolean> => {
    if (!measure._id) {
      setError("Missing measure ID");
      return false;
    }

    setIsLoading(true);
    try {
      const result = await updateMeasureAPI(measure._id, measure);
      if (result.success) {
        await searchMeasures();
        setError(null);
        return true;
      }
      setError(result.error || "Update failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadVariables = async () => {
      try {
        const vars = await fetchVariables();
        setVariables(vars);
      } catch (error) {
        console.error("Failed to load variables:", error);
      }
    };
    loadVariables();
  }, []);

  return (
    <DataContext.Provider
      value={{
        measures,
        selectedMeasure,
        isLoading,
        error,
        isEditing,
        pendingChanges,
        variables,
        searchMeasures,
        selectMeasure,
        createMeasure,
        updateMeasure,
        setIsEditing,
        setPendingChanges,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
