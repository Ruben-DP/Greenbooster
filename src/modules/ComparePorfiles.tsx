// src/modules/CompareProfiles.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { MeasureProvider } from "@/contexts/DataContext";
import Budget from "./frontend/calculations/Budget";
import Stats from "./frontend/calculations/Stats";
import { Woning, WoningType } from "@/types/woningen";
import { CalculationHandler } from "./frontend/calculations/CalculationHandler";
import SelectedMeasures from "./frontend/calculations/SelectMeasures";
import { EnergyLabel } from "./frontend/calculations/EnergyLabel";
import { calculateMeasurePrice } from "./frontend/calculations/price.calculator";
import ImageSelect from "./ImageSelect";
import ScenarioSelector from "./scenario/ScenarioSelector";
import { searchDocuments } from "@/app/actions/crudActions";
import { getSettings } from "@/app/actions/settingsActions";

interface Measure {
  name: string;
  group?: string;
  measure_prices?: any[];
  mjob_prices?: any[];
  price?: number;
  priceCalculations?: any[];
  maintenancePrice?: number;
  maintenanceCalculations?: any[];
  maintenanceCost40Years?: number;
  maintenanceCostPerYear?: number;
  calculationError?: string;
  maintenanceError?: string;
  heatDemandValue?: number | string;
  heat_demand?: {
    portiek?: Array<{ period: string; value: number }>;
    gallerij?: Array<{ period: string; value: number }>;
    grondgebonden?: Array<{ period: string; value: number }>;
  };
  action?: string;
  [key: string]: any;
}

interface CalculationResults {
  woningSpecifiek: {
    breedte: number;
    diepte: number;
    gootHoogte: number;
    nokHoogte: number;
    aantalWoningen: number;
    heeftPlatDak: boolean;
    bouwlagen?: number;
    breedteComplex?: number;
    kopgevels?: number;
    portieken?: number;
    bouwPeriode?: string;
  };
  gevelOppervlakVoor: number;
  gevelOppervlakAchter: number;
  gevelOppervlakTotaal: number;
  dakOppervlak: number;
  dakOppervlakTotaal: number;
  dakLengte: number;
  dakLengteTotaal: number;
  vloerOppervlak: number;
  vloerOppervlakTotaal: number;
  kozijnenVoorgevel: any[];
  kozijnenAchtergevel: any[];
  kozijnOppervlakVoorTotaal: number;
  kozijnOppervlakAchterTotaal: number;
  kozijnOppervlakTotaal: number;
  kozijnRendementTotaal: number;
  kozijnOmtrekTotaal: number;
  gevelOppervlakNetto: number;
  projectGevelOppervlak: number;
  projectKozijnenOppervlak: number;
  projectDakOppervlak: number;
  dakOverstekOppervlak: number;
  dakTotaalMetOverhang: number;
  projectOmtrek: number;
  kozijnenPerGrootte: {
    tot1M2: number;
    tot1_5M2: number;
    tot2M2: number;
    tot2_5M2: number;
    tot3M2: number;
    tot3_5M2: number;
    tot4M2: number;
    boven4M2: number;
  };
  missingInputs: string[];
  calculationWarnings: string[];
  calculationExplanations?: Record<string, string>;
}

interface ComparisonColumnProps {
  columnIndex: number;
}

function ComparisonColumn({ columnIndex }: ComparisonColumnProps) {
  const [woningen, setWoningen] = useState<Woning[]>([]);
  const [selectedResidence, setSelectedResidence] = useState<Woning | null>(null);
  const [selectedType, setSelectedType] = useState<WoningType | null>(null);
  const [calculations, setCalculations] = useState<CalculationResults | null>(null);
  const [processedMeasures, setProcessedMeasures] = useState<Measure[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalHeatDemand, setTotalHeatDemand] = useState<number>(0);
  const [settings, setSettings] = useState<any>(null);
  const [types, setTypes] = useState<WoningType[]>([]);
  const [hasScenario, setHasScenario] = useState(false);
  const pendingMeasuresRef = useRef<Measure[]>([]);

  // Load woningen on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const woningenResult = await searchDocuments<Woning>("woningen", "", "");
        if (woningenResult) {
          setWoningen(woningenResult);
        }

        const typesResult = await searchDocuments<WoningType>("types", "", "");
        if (typesResult) {
          setTypes(typesResult);
        }

        const settingsResult = await getSettings();
        if (settingsResult.success && settingsResult.data) {
          setSettings(settingsResult.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Fout bij laden van gegevens");
      }
    };

    loadData();
  }, []);

  // Update total heat demand when measures change
  useEffect(() => {
    const newTotalHeatDemand = processedMeasures.reduce((total, measure) => {
      const demandValue = measure.heatDemandValue
        ? parseFloat(String(measure.heatDemandValue))
        : 0;
      return total + (isNaN(demandValue) ? 0 : demandValue);
    }, 0);

    setTotalHeatDemand(newTotalHeatDemand);
  }, [processedMeasures]);

  // Recalculate measures when calculations become available
  useEffect(() => {
    if (calculations && pendingMeasuresRef.current.length > 0) {
      const recalculated = recalculateMeasures(pendingMeasuresRef.current, calculations);
      setProcessedMeasures(recalculated);

      const newBudget = recalculated.reduce(
        (sum, measure) => sum + (measure.price || 0),
        0
      );
      setTotalBudget(newBudget);
      pendingMeasuresRef.current = [];
    }
  }, [calculations]);

  const handleResidenceSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const residenceId = event.target.value;
    const residence = woningen.find((w) => w._id === residenceId);
    if (!residence) return;

    setSelectedResidence(residence);

    // Find the type
    const type = types.find((t) => t._id === residence.typeId);
    setSelectedType(type || null);

    // Reset scenario when residence changes
    setHasScenario(false);
    setProcessedMeasures([]);
    setTotalBudget(0);
  };

  const handleScenarioLoad = (measures: any[]) => {
    if (measures.length === 0) {
      setProcessedMeasures([]);
      setTotalBudget(0);
      setHasScenario(false);
      pendingMeasuresRef.current = [];
      return;
    }

    setHasScenario(true);

    if (!calculations) {
      // Store measures to process when calculations become available
      pendingMeasuresRef.current = measures;
      return;
    }

    // Recalculate measures with current residence data
    const recalculated = recalculateMeasures(measures, calculations);
    setProcessedMeasures(recalculated);

    const newBudget = recalculated.reduce(
      (sum, measure) => sum + (measure.price || 0),
      0
    );
    setTotalBudget(newBudget);
  };

  const recalculateMeasures = (
    measures: Measure[],
    calculationData: CalculationResults
  ) => {
    if (!calculationData || measures.length === 0) return [];

    return measures.map((measure) => {
      const priceResult = calculationData
        ? calculateMeasurePrice(measure.measure_prices, calculationData, selectedType?.type || "", false)
        : { isValid: false, price: 0, calculations: [] };

      const maintenanceResult = calculationData
        ? calculateMeasurePrice(measure.mjob_prices, calculationData, selectedType?.type || "", false)
        : { isValid: false, price: 0, calculations: [] };

      const { total40Years, perYear } = calculateMaintenanceCosts(
        maintenanceResult,
        measure.mjob_prices
      );

      const heatDemandValue =
        selectedType && selectedResidence
          ? getHeatDemandValue(
              measure,
              selectedType.type || "",
              selectedResidence.projectInformation?.bouwPeriode || ""
            )
          : 0;

      return {
        ...measure,
        price: priceResult.isValid ? priceResult.price : undefined,
        priceCalculations: priceResult.calculations,
        calculationError: !priceResult.isValid
          ? priceResult.errorMessage
          : undefined,
        maintenancePrice: maintenanceResult.isValid
          ? maintenanceResult.price
          : undefined,
        maintenanceCalculations: maintenanceResult.calculations,
        maintenanceError: !maintenanceResult.isValid
          ? maintenanceResult.errorMessage
          : undefined,
        maintenanceCost40Years: total40Years,
        maintenanceCostPerYear: perYear,
        heatDemandValue: heatDemandValue,
      };
    });
  };

  const calculateMaintenanceCosts = (
    maintenanceResult: { isValid: boolean; price: number; calculations: any[] },
    mjob_prices?: any[]
  ) => {
    if (
      !maintenanceResult.isValid ||
      !mjob_prices ||
      !Array.isArray(mjob_prices)
    ) {
      return { total40Years: 0, perYear: 0 };
    }

    const inflationPercentage = settings?.inflationPercentage || 1;
    const maintenancePeriodYears = 40;

    let total40Years = 0;

    mjob_prices.forEach((job, index) => {
      const calculation = maintenanceResult.calculations[index];
      if (!calculation || !job.cycle || job.cycle <= 0) return;

      if (calculation.name !== job.name) return;

      const baseJobCost = calculation.totalPrice;

      const cycleStart = job.cycleStart || 0;
      const cycle = job.cycle || 1;

      if (cycleStart >= maintenancePeriodYears) {
        return;
      }

      if (cycle <= 0) {
        return;
      }

      for (
        let year = cycleStart;
        year < maintenancePeriodYears;
        year += cycle
      ) {
        const inflatedCost =
          baseJobCost * Math.pow(1 + inflationPercentage / 100, year);

        total40Years += inflatedCost;
      }
    });

    const perYear = total40Years / maintenancePeriodYears;

    return { total40Years, perYear };
  };

  const getHeatDemandValue = (
    measure: any,
    buildingType: string,
    buildPeriod: string
  ): number => {
    const defaultValue = 0;

    if (!measure?.heat_demand) {
      return defaultValue;
    }

    let typeKey = "grondgebonden";

    if (buildingType?.toLowerCase().includes("portiek")) {
      typeKey = "portiek";
    } else if (
      buildingType?.toLowerCase().includes("galerij") ||
      buildingType?.toLowerCase().includes("gallerij")
    ) {
      typeKey = "gallerij";
    }

    const typeValues = measure.heat_demand[typeKey];

    if (!Array.isArray(typeValues) || typeValues.length === 0) {
      return defaultValue;
    }

    const periodData = typeValues.find((p) => p.period === buildPeriod);

    return periodData?.value ?? defaultValue;
  };

  const handleCalculations = (newCalculations: CalculationResults) => {
    setCalculations(newCalculations);

    // If we have measures loaded, recalculate them with new calculations
    if (processedMeasures.length > 0) {
      const recalculated = recalculateMeasures(
        processedMeasures,
        newCalculations
      );
      setProcessedMeasures(recalculated);

      const newBudget = recalculated.reduce(
        (sum, measure) => sum + (measure.price || 0),
        0
      );
      setTotalBudget(newBudget);
    }
  };

  const residenceOptions = woningen.map((woning) => ({
    value: woning._id,
    label: woning.projectInformation?.adres || "Onbekend",
    imageSrc: woning.imagePath,
  }));

  return (
    <div className="comparison-column">
      <div className="column-header">
        <h3 className="column-title">Vergelijking {columnIndex + 1}</h3>
      </div>

      <div className="column-selectors">
        <div className="selector-group">
          <ImageSelect
            id={`residence-select-${columnIndex}`}
            name={`residence-${columnIndex}`}
            options={residenceOptions}
            value={selectedResidence?._id || ""}
            onChange={handleResidenceSelect}
            label="Woning"
          />
        </div>

        {selectedResidence && (
          <ScenarioSelector
            onScenarioLoad={handleScenarioLoad}
            woningId={selectedResidence._id}
          />
        )}
      </div>

      {selectedResidence &&
        selectedType &&
        selectedResidence.dimensions && (
          <CalculationHandler
            dimensions={selectedResidence.dimensions}
            woningType={selectedType}
            onCalculate={handleCalculations}
          />
        )}

      {selectedResidence && hasScenario && calculations && (
        <div className="column-data">
          <EnergyLabel
            currentEnergyUsage={selectedResidence?.energyDetails?.huidigVerbruik || 0}
            totalWarmth={totalHeatDemand}
          />

          <Budget
            totalAmount={totalBudget}
            numberOfUnits={calculations?.woningSpecifiek?.aantalWoningen}
            residenceCustomFields={selectedResidence?.customFields}
          />

          <Stats
            selectedMeasures={processedMeasures}
            totalHeatDemand={totalHeatDemand}
          />

          <SelectedMeasures
            measures={processedMeasures}
            onRemove={() => {}}
          />
        </div>
      )}

      {!selectedResidence && (
        <div className="empty-state">
          <p>Selecteer een woning om te beginnen</p>
        </div>
      )}
    </div>
  );
}

function PageContent() {
  const [numberOfColumns, setNumberOfColumns] = useState(2);

  return (
    <div className="compare-profiles-container">
      <div className="controls">
        <label>
          Aantal kolommen:
          <select
            value={numberOfColumns}
            onChange={(e) => setNumberOfColumns(Number(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
      </div>

      <div className={`comparison-grid columns-${numberOfColumns}`}>
        {Array.from({ length: numberOfColumns }).map((_, index) => (
          <ComparisonColumn key={index} columnIndex={index} />
        ))}
      </div>

      <style jsx>{`
        .compare-profiles-container {
          padding: 20px;
          max-width: 1300px;
          margin-left: auto;
          margin-right: auto;
          min-height:660px;
        }

        .controls {
          margin-bottom: 20px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .controls label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .controls select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 16px;
        }

        .comparison-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 40px;
        }

        .comparison-grid.columns-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .comparison-grid.columns-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .comparison-column {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          min-height: 400px;
        }

        .column-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .column-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: var(--accent-color, #4361ee);
        }

        .column-selectors {
          margin-bottom: 20px;
        }

        .selector-group {
          margin-bottom: 15px;
        }

        .selector-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }

        .scenario-select {
          width: 100%;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 16px;
        }

        .column-data {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }

        .column-data > * {
          margin-bottom: 16px;
        }

        .column-data > *:last-child {
          margin-bottom: 0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-style: italic;
        }

        .empty-state p {
          margin: 0;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}

export default function CompareProfiles() {
  return (
    <MeasureProvider>
      <PageContent />
    </MeasureProvider>
  );
}
