"use client";

import { Measure } from "@/types/measures";
import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { ChangeRecord } from "@/types/types";
import {
  searchMeasures,
  createMeasure,
  updateMeasure,
} from "@/app/actions/measureActions";
import { fetchVariables } from "@/app/actions/variableActions";

interface DataState {
  measures: {
    list: Measure[];
    selected: Measure | null;
    isLoading: boolean;
    error: string | null;
    isEditing: boolean;
    pendingChanges: Record<string, ChangeRecord>;
  };
  variables: {
    list: Array<{ variableName: string }>;
    isLoading: boolean;
    error: string | null;
  };
  startEditing?: boolean;
}

type DataAction =
  | { type: "SET_MEASURES"; payload: Measure[] }
  | { type: "SET_SELECTED_MEASURE"; payload: Measure | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "SET_PENDING_CHANGES"; payload: Record<string, ChangeRecord> }
  | { type: "SET_VARIABLES"; payload: Array<{ name: string; value: string }> };

interface DataContextType {
  state: DataState;
  searchMeasures: (searchTerm?: string) => Promise<void>;
  selectMeasure: (measure: Measure | null, startEditing?: boolean) => void;
  createMeasure: (measure: Measure) => Promise<boolean>;
  updateMeasure: (measure: Measure) => Promise<boolean>;
  setEditing: (isEditing: boolean) => void;
  setPendingChanges: (changes: Record<string, ChangeRecord>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const initialState: DataState = {
  measures: {
    list: [],
    selected: null,
    isLoading: false,
    error: null,
    isEditing: false,
    pendingChanges: {},
  },
  variables: {
    list: [],
    isLoading: false,
    error: null
  }
};

function dataReducer(state: DataState, action: DataAction): DataState {
  console.log("Reducer Action:", action.type);

  switch (action.type) {
    case "SET_MEASURES":
      return {
        ...state,
        measures: {
          ...state.measures,
          list: action.payload,
        },
      };
    case "SET_SELECTED_MEASURE":
      return {
        ...state,
        measures: {
          ...state.measures,
          selected: action.payload,
          isEditing: action.payload === null ? false : state.measures.isEditing,
          pendingChanges:
            action.payload === null ? {} : state.measures.pendingChanges,
        },
      };
    case "SET_LOADING":
      return {
        ...state,
        measures: {
          ...state.measures,
          isLoading: action.payload,
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        measures: {
          ...state.measures,
          error: action.payload,
        },
      };
    case "SET_EDITING":
      return {
        ...state,
        measures: {
          ...state.measures,
          isEditing: action.payload,
          pendingChanges: action.payload ? state.measures.pendingChanges : {},
        },
      };

    case "SET_PENDING_CHANGES":
      return {
        ...state,
        measures: {
          ...state.measures,
          pendingChanges: action.payload,
        },
      };
    case "SET_VARIABLES":
      return {
        ...state,
        variables: {
          ...state.variables,
          list: action.payload,
        },
      };
    default:
      return state;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const handleSearchMeasures = async (searchTerm?: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const results = await searchMeasures(searchTerm);
      dispatch({ type: "SET_MEASURES", payload: results });
    } catch (error) {
      console.error("Search error:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Search failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const selectMeasure = (
    measure: Measure | null,
    startEditing: boolean = false
  ) => {
    dispatch({ type: "SET_SELECTED_MEASURE", payload: measure });
    dispatch({ type: "SET_EDITING", payload: startEditing });
  };

  const handleCreateMeasure = async (measure: Measure): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await createMeasure(measure);
      if (result.success) {
        await handleSearchMeasures();
        return true;
      }
      dispatch({
        type: "SET_ERROR",
        payload: result.error || "Creation failed",
      });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleUpdateMeasure = async (measure: Measure): Promise<boolean> => {
    if (!measure._id) {
      console.error("Update attempted without measure ID");
      dispatch({ type: "SET_ERROR", payload: "Missing measure ID" });
      return false;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const result = await updateMeasure(measure._id, measure);

      if (!result.success) {
        console.error("Update failed:", result.error);
        dispatch({
          type: "SET_ERROR",
          payload: result.error || "Failed to update measure",
        });
        return false;
      }

      try {
        await handleSearchMeasures();
      } catch (searchError) {
        console.error("Failed to refresh measures after update:", searchError);
      }

      return true;
    } catch (error) {
      console.error("Critical update error:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "Unexpected error during update",
      });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const setEditing = (isEditing: boolean) => {
    dispatch({ type: "SET_EDITING", payload: isEditing });
  };

  const setPendingChanges = (changes: Record<string, ChangeRecord>) => {
    dispatch({ type: "SET_PENDING_CHANGES", payload: changes });
  };

  const loadVariables = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const variables = await fetchVariables();
      dispatch({ type: "SET_VARIABLES", payload: variables });
    } catch (error) {
      console.error("Failed to load variables:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Load variables when provider mounts
  useEffect(() => {
    loadVariables();
  }, []);

  return (
    <DataContext.Provider
      value={{
        state,
        searchMeasures: handleSearchMeasures,
        selectMeasure,
        createMeasure: handleCreateMeasure,
        updateMeasure: handleUpdateMeasure,
        setEditing,
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
