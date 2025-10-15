"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { getSavedScenarios, getMeasuresByIds } from "./saveScenario";

interface Scenario {
  _id: string;
  naam: string;
  measureIds: string[];
  woningId?: string;
  createdAt: Date;
}

interface ScenarioSelectorProps {
  onScenarioLoad: (measures: any[]) => void;
  woningId?: string;
}

const ScenarioSelector = ({ onScenarioLoad, woningId }: ScenarioSelectorProps) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const lastAutoLoadedRef = useRef<string | null>(null);

  const fetchScenarios = async () => {
    try {
      const result = await getSavedScenarios();
      if (result.success && result.data) {
        setScenarios(result.data as Scenario[]);
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      toast.error("Kon scenarios niet laden");
    }
  };

  const loadScenario = useCallback(async (scenario: Scenario, showToast = true) => {
    setIsLoading(true);

    try {
      const result = await getMeasuresByIds(scenario.measureIds);
      if (result.success && result.data) {
        onScenarioLoad(result.data);
        if (showToast) {
          toast.success(`Scenario "${scenario.naam}" geladen`);
        }
      } else {
        toast.error("Kon maatregelen niet laden");
      }
    } catch (error) {
      console.error("Error loading scenario measures:", error);
      toast.error("Er is een fout opgetreden bij het laden");
    } finally {
      setIsLoading(false);
    }
  }, [onScenarioLoad]);

  const handleScenarioChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    setSelectedScenarioId(scenarioId);

    if (!scenarioId) {
      return;
    }

    const scenario = scenarios.find(s => s._id === scenarioId);
    if (!scenario) {
      toast.error("Scenario niet gevonden");
      return;
    }

    await loadScenario(scenario);
  };

  useEffect(() => {
    fetchScenarios();

    // Listen for custom event when a new scenario is saved
    const handleScenarioSaved = () => {
      fetchScenarios();
    };

    window.addEventListener('scenarioSaved', handleScenarioSaved);

    return () => {
      window.removeEventListener('scenarioSaved', handleScenarioSaved);
    };
  }, []);

  // Auto-select first scenario when woningId changes
  useEffect(() => {
    if (!woningId || scenarios.length === 0) {
      setSelectedScenarioId("");
      lastAutoLoadedRef.current = null;
      return;
    }

    // Only auto-load if woningId has actually changed
    if (lastAutoLoadedRef.current === woningId) {
      return;
    }

    // Filter scenarios for this woning
    const woningScenarios = scenarios.filter(s => s.woningId === woningId);

    if (woningScenarios.length > 0) {
      const firstScenario = woningScenarios[0];
      setSelectedScenarioId(firstScenario._id);

      // Auto-load the first scenario without toast notification
      loadScenario(firstScenario, false);
      lastAutoLoadedRef.current = woningId;
    } else {
      setSelectedScenarioId("");
      // Clear the measure list when no scenarios are available
      onScenarioLoad([]);
      lastAutoLoadedRef.current = woningId;
    }
  }, [woningId, scenarios, loadScenario]);

  // Filter scenarios to only show those matching the selected residence
  const filteredScenarios = woningId
    ? scenarios.filter(scenario => scenario.woningId === woningId)
    : scenarios;

  return (
    <div className="scenario-selector">
      <h4 className="tile-title">Scenario</h4>
      <div className="scenario-selector__controls">
        <select
          value={selectedScenarioId}
          onChange={handleScenarioChange}
          disabled={isLoading || filteredScenarios.length === 0}
        >
          <option value="">-- Selecteer een scenario --</option>
          {filteredScenarios.map((scenario) => (
            <option key={scenario._id} value={scenario._id}>
              {scenario.naam}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <span className="loading-text">Laden...</span>}
      {!isLoading && woningId && filteredScenarios.length === 0 && (
        <span className="loading-text">Geen scenarios voor deze woning</span>
      )}
    </div>
  );
};

export default ScenarioSelector;
