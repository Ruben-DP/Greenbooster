"use client";

import { Measure } from "@/types/measures";
import { createContext, useContext, useReducer, ReactNode } from "react";
import { ChangeRecord } from "@/types/types";
import {
  searchMeasures,
  createMeasure,
  updateMeasure,
} from "@/app/actions/measureActions";

interface DataState {
  measures: {
    list: Measure[];
    selected: Measure | null;
    isLoading: boolean;
    error: string | null;
    isEditing: boolean;
    pendingChanges: Record<string, ChangeRecord>;
  };
  startEditing?: boolean;
}

type DataAction =
  | { type: "SET_MEASURES"; payload: Measure[] }
  | { type: "SET_SELECTED_MEASURE"; payload: Measure | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_EDITING"; payload: boolean }
  | { type: "SET_PENDING_CHANGES"; payload: Record<string, ChangeRecord> };

interface DataContextType {
  state: DataState;
  searchMeasures: (searchTerm?: string) => Promise<void>;
  selectMeasure: (measure: Measure | null, startEditing?: boolean) => void; // Updated this line
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
};

function dataReducer(state: DataState, action: DataAction): DataState {
  console.log("Reducer Action:", action.type, action.payload);

  switch (action.type) {
    case "SET_MEASURES":
      console.log("Setting measures list:", action.payload);
      return {
        ...state,
        measures: {
          ...state.measures,
          list: action.payload,
        },
      };
    case "SET_SELECTED_MEASURE":
      console.log("Setting selected measure:", action.payload);
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
    default:
      return state;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  console.log("Current state:", state);

  const handleSearchMeasures = async (searchTerm?: string) => {
    console.log("Searching measures with term:", searchTerm);
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const results = await searchMeasures(searchTerm);
      console.log("Search results:", results);
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
    console.log("Creating measure:", measure);
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await createMeasure(measure);
      console.log("Create result:", result);
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
    console.log("Updating measure:", measure);
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const result = await updateMeasure(measure._id, measure);
      if (result.success) {
        await handleSearchMeasures();
        return true;
      }
      dispatch({ type: "SET_ERROR", payload: result.error || "Update failed" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };
  

  const setEditing = (isEditing: boolean) => {
    console.log("Setting editing mode:", isEditing);
    dispatch({ type: "SET_EDITING", payload: isEditing });
  };

  const setPendingChanges = (changes: Record<string, ChangeRecord>) => {
    console.log("Setting pending changes:", changes);
    dispatch({ type: "SET_PENDING_CHANGES", payload: changes });
  };

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
