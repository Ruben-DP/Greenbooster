"use client";
import { useState } from "react";
import { MeasureProvider } from "@/contexts/DataContext";
import Budget from "./calculations/Budget";
import MeasureList from "./calculations/MeasureList";
import Residence from "./calculations/Residence";
import Stats from "./calculations/Stats";
import { Woning, WoningType } from "@/types/woningen";
import { CalculationHandler } from "./calculations/CalculationHandler";
import SelectedMeasures from "./calculations/SelectMeasures";

interface KozijnDetails {
  type: string;
  breedte: number;
  hoogte: number;
  oppervlakte: number;
  rendement: number;
  omtrek: number;
}
interface CalculationResults {
  // Base surfaces
  gevelOppervlakVoor: number;
  gevelOppervlakAchter: number;
  gevelOppervlakTotaal: number;

  // Roof calculations
  dakOppervlak: number;
  dakOppervlakTotaal: number;
  dakLengte: number;
  dakLengteTotaal: number;

  // Floor calculations
  vloerOppervlak: number;
  vloerOppervlakTotaal: number;

  // Kozijn details
  kozijnenVoorgevel: KozijnDetails[];
  kozijnenAchtergevel: KozijnDetails[];

  // Kozijn measurements
  kozijnOppervlakVoorTotaal: number;
  kozijnOppervlakAchterTotaal: number;
  kozijnOppervlakTotaal: number;
  kozijnRendementTotaal: number;
  kozijnOmtrekTotaal: number;

  // Gevel netto
  gevelOppervlakNetto: number;

  // Project totals
  projectGevelOppervlak: number;
  projectKozijnenOppervlak: number;
  projectDakOppervlak: number;

  // Additional roof measurements
  dakOverstekOppervlak: number;
  dakTotaalMetOverhang: number;

  // Project circumference
  projectOmtrek: number;

  // Kozijn grouping by size
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

  // Error tracking
  missingInputs: string[];
  calculationWarnings: string[];
}

function PageContent() {
  const [selectedResidence, setSelectedResidence] = useState<Woning | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<WoningType | null>(null);
  const [calculations, setCalculations] = useState<CalculationResults | null>(
    null
  );

  const handleSelection = (residence: Woning, type: WoningType) => {
    setSelectedResidence(residence);
    setSelectedType(type);
    console.log("Selected Residence:", residence);
    console.log("Selected Type:", type);
  };

  const handleCalculations = (newCalculations: CalculationResults) => {
    setCalculations(newCalculations);
    console.log("Calculations:", newCalculations);

    if (newCalculations.missingInputs?.length > 0) {
      console.warn("Missing inputs:", newCalculations.missingInputs);
    }

    if (newCalculations.calculationWarnings?.length > 0) {
      console.warn(
        "Calculation warnings:",
        newCalculations.calculationWarnings
      );
    }
  };

  return (
    <div className="cost-form">
      <div className="container">
        <div className="inner-content">
          <Budget />
          <Residence selectedResidence={handleSelection} />
          <Stats />
          {selectedResidence && selectedType && (
            <CalculationHandler
              woning={selectedResidence}
              woningType={selectedType}
              onCalculate={handleCalculations}
            />
          )}
          <SelectedMeasures />
        </div>
        <MeasureList residence={selectedResidence} />
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
