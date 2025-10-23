// src/modules/frontend/CostForm.tsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MeasureProvider } from "@/contexts/DataContext";
import Budget from "./calculations/Budget";
import MeasureList from "./calculations/MeasureList";
import Residence from "./calculations/Residence";
import Stats from "./calculations/Stats";
import { Woning, WoningType } from "@/types/woningen";
import { CalculationHandler } from "./calculations/CalculationHandler";
import SelectedMeasures from "./calculations/SelectMeasures";
import PdfDownloadButton from "../PdfDownloadButton";
import ModernPdfDownloadButton from "../ModernPdfDownloadButton";
import SaveScenarioButton from "../scenario/SaveScenarioButton";
import { EnergyLabel } from "./calculations/EnergyLabel";
import { calculateMeasurePrice } from "./calculations/price.calculator";

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

interface KozijnDetails {
  type: string;
  breedte: number;
  hoogte: number;
  oppervlakte: number;
  rendement: number;
  omtrek: number;
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
  kozijnenVoorgevel: KozijnDetails[];
  kozijnenAchtergevel: KozijnDetails[];
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

function PageContent() {
  const [selectedResidence, setSelectedResidence] = useState<Woning | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<WoningType | null>(null);
  const [calculations, setCalculations] = useState<CalculationResults | null>(
    null
  );
  const [selectedMeasures, setSelectedMeasures] = useState<Measure[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalHeatDemand, setTotalHeatDemand] = useState<number>(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const initialHeatDemand = 0;
    const newTotalHeatDemand = selectedMeasures.reduce((total, measure) => {
      const demandValue = measure.heatDemandValue
        ? parseFloat(String(measure.heatDemandValue))
        : 0;
      return total + (isNaN(demandValue) ? 0 : demandValue);
    }, initialHeatDemand);

    setTotalHeatDemand(newTotalHeatDemand);
  }, [selectedMeasures]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { getSettings } = await import("@/app/actions/settingsActions");
        const result = await getSettings();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Disabled: measures are now managed via scenarios instead
  // useEffect(() => {
  //   if (selectedResidence?._id) {
  //     updateWoningMeasures(selectedResidence._id, selectedMeasures);
  //   }
  // }, [selectedMeasures, selectedResidence]);

  const recalculateMeasures = (
    measures: Measure[],
    calculationData: CalculationResults
  ) => {
    if (!calculationData || measures.length === 0) return [];

    return measures.map((measure) => {
      const priceResult = calculationData
        ? calculateMeasurePrice(measure.measure_prices, calculationData)
        : { isValid: false, price: 0, calculations: [] };

      const maintenanceResult = calculationData
        ? calculateMeasurePrice(measure.mjob_prices, calculationData)
        : { isValid: false, price: 0, calculations: [] };

      const { total40Years, perYear } = calculateMaintenanceCosts
        ? calculateMaintenanceCosts(maintenanceResult, measure.mjob_prices)
        : { total40Years: 0, perYear: 0 };

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

  const handleAddMeasure = (measure: Measure) => {
    if (measure.action === "remove") {
      setSelectedMeasures((prev) =>
        prev.filter((m) => m.name !== measure.name)
      );
      setTotalBudget((prev) => prev - (measure.price || 0));
      return;
    }

    // if (
    //   measure.group &&
    //   selectedMeasures.some((m) => m.group === measure.group)
    // ) {
    //   toast.error(
    //     `Er is al een maatregel uit '${measure.group}' geselecteerd, verwijder deze om een nieuwe maatregel te selecteren.`
    //   );
    //   return;
    // }

    const measureExists = selectedMeasures.some((m) => m.name === measure.name);
    if (measureExists) {
      return;
    }

    if (calculations) {
      const heatDemandValue = getHeatDemandValue(
        measure,
        selectedType?.type || "",
        selectedResidence?.projectInformation?.bouwPeriode || ""
      );

      measure.heatDemandValue = heatDemandValue;

      setSelectedMeasures((prev) => [...prev, measure]);
      setTotalBudget((prev) => prev + (measure.price || 0));
    }
  };

  const handleScenarioLoad = (measures: any[]) => {
    if (!calculations) {
      toast.error("Selecteer eerst een woning om berekeningen te maken");
      return;
    }

    // Recalculate prices for all measures with current residence data
    const processedMeasures = recalculateMeasures(
      measures as Measure[],
      calculations
    );

    setSelectedMeasures(processedMeasures);

    const newBudget = processedMeasures.reduce(
      (sum, measure) => sum + (measure.price || 0),
      0
    );
    setTotalBudget(newBudget);
  };

  const findVariableValue = (
    variableName: string,
    calculationData: Record<string, any>
  ): any => {
    if (
      calculationData.woningSpecifiek &&
      calculationData.woningSpecifiek[variableName] !== undefined
    ) {
      return calculationData.woningSpecifiek[variableName];
    }

    if (calculationData[variableName] !== undefined) {
      return calculationData[variableName];
    }

    const legacyMapping: Record<string, string | number> = {
      AantalWoningen: "aantalWoningen",
      Dakoppervlak: "dakOppervlak",
      LengteDakvlak: "dakLengte",
      BreedteWoning: "breedte",
      NettoGevelOppervlak: "gevelOppervlakNetto",
      VloerOppervlakteBeganeGrond: "vloerOppervlak",
      OmtrekKozijnen: "kozijnOmtrekTotaal",
      GevelOppervlak: "gevelOppervlakTotaal",
      "5%": 0.05,
    };

    if (typeof legacyMapping[variableName] === "number") {
      return legacyMapping[variableName];
    }

    const mappedName = legacyMapping[variableName] as string;
    if (
      mappedName &&
      calculationData.woningSpecifiek &&
      calculationData.woningSpecifiek[mappedName] !== undefined
    ) {
      return calculationData.woningSpecifiek[mappedName];
    }

    if (mappedName && calculationData[mappedName] !== undefined) {
      return calculationData[mappedName];
    }

    if (!isNaN(Number(variableName))) {
      return Number(variableName);
    }

    return undefined;
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

  const handleSelection = (
    residence: Woning,
    type: WoningType,
    typeStr: string
  ) => {
    setSelectedResidence(residence);
    setSelectedType(type);

    // Disabled: measures are now managed via scenarios instead
    // if (residence.measures) {
    //   setSelectedMeasures(residence.measures);
    // } else {
    //   setSelectedMeasures([]);
    // }
  };

  useEffect(() => {
    if (!calculations) return;

    if (selectedMeasures.length > 0) {
      const updatedMeasures = recalculateMeasures(
        selectedMeasures,
        calculations
      );
      setSelectedMeasures(updatedMeasures);

      const newBudget = updatedMeasures.reduce(
        (sum, measure) => sum + (measure.price || 0),
        0
      );
      setTotalBudget(newBudget);
    }
  }, [calculations]);

  const handleCalculations = (newCalculations: CalculationResults) => {
    setCalculations(newCalculations);

    if (newCalculations.missingInputs?.length > 0) {
      console.warn("Ontbrekende invoer:", newCalculations.missingInputs);
    }

    if (newCalculations.calculationWarnings?.length > 0) {
      console.warn(
        "Berekeningswaarschuwingen:",
        newCalculations.calculationWarnings
      );
    }
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

    const inflationPercentage = 1;
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

  return (
    <div className="cost-form">
      <div className="container">
        <div className="inner-content">
          <EnergyLabel
            currentEnergyUsage={selectedResidence?.energyDetails.huidigVerbruik}
            totalWarmth={totalHeatDemand}
          />
          <Budget
            totalAmount={totalBudget}
            numberOfUnits={calculations?.woningSpecifiek?.aantalWoningen}
            residenceCustomFields={selectedResidence?.customFields}
          />
          <Stats
            selectedMeasures={selectedMeasures}
            totalHeatDemand={totalHeatDemand}
          />
          <div className="tile-grouper">
            <Residence
              selectedResidence={handleSelection}
              residenceType={selectedType?.type}
              onScenarioLoad={handleScenarioLoad}
            />
            {selectedResidence &&
              selectedType &&
              selectedResidence.dimensions && (
                <CalculationHandler
                  dimensions={selectedResidence.dimensions}
                  woningType={selectedType}
                  onCalculate={handleCalculations}
                />
              )}
            <div className="tile actions-tile">
              <h4 className="tile-title">Acties</h4>
              <div className="saveProfile">
                <SaveScenarioButton
                  measures={selectedMeasures}
                  woningId={selectedResidence?._id}
                  isDisabled={selectedMeasures.length === 0}
                />
              </div>
              {/* <div className="downloadPDF">
                <PdfDownloadButton
                  selectedResidence={selectedResidence}
                  selectedMeasures={selectedMeasures}
                  totalBudget={totalBudget}
                  totalHeatDemand={totalHeatDemand}
                  settings={settings}
                />
              </div> */}
              <div className="downloadPDF">
                <ModernPdfDownloadButton
                  selectedResidence={selectedResidence}
                  selectedMeasures={selectedMeasures}what
                  totalBudget={totalBudget}
                  totalHeatDemand={totalHeatDemand}
                  settings={settings}
                />
              </div>
            </div>
          </div>
          <SelectedMeasures
            measures={selectedMeasures}
            onRemove={handleAddMeasure}
          />
        </div>
        {calculations && (
          <MeasureList
            residenceData={calculations}
            onSelectMeasure={handleAddMeasure}
            buildPeriod={
              selectedResidence?.projectInformation?.bouwPeriode || ""
            }
            residenceType={selectedType?.type || ""}
            selectedMeasures={selectedMeasures}
          />
        )}
      </div>
    </div>
  );
}

export default function CostForm() {
  return (
    <MeasureProvider>
      <PageContent />
    </MeasureProvider>
  );
}
