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
  // Basic measurements
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
    bouwPeriode?: string; // Added bouwPeriode here
  };

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
  const [selectedMeasures, setSelectedMeasures] = useState<Measure[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);

  const handleAddMeasure = (measure: Measure) => {
    setSelectedMeasures((prev) => [...prev, measure]);
    setTotalBudget((prev) => prev + (measure.price || 0));
  };

  const handleRemoveMeasure = (measureToRemove: Measure) => {
    setSelectedMeasures((prev) =>
      prev.filter((measure) => measure.name !== measureToRemove.name)
    );
    setTotalBudget((prev) => prev - (measureToRemove.price || 0));
  };

  const handleSelection = (residence: Woning, type: WoningType) => {
    // Always clear selected measures when selecting a residence
    // This ensures components will refresh properly
    setSelectedMeasures([]);
    setTotalBudget(0);
    setCalculations(null); // Also reset calculations to force MeasureList to update
    
    // Set the new residence and type
    setSelectedResidence(residence);
    setSelectedType(type);
    
    // Log for debugging
    console.log("Selected new residence:", residence.name);
    console.log("Cleared measures and calculations");
  };

  const handleCalculations = (newCalculations: CalculationResults) => {
    setCalculations(newCalculations);

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
          <Budget totalAmount={totalBudget} />
          <Residence selectedResidence={handleSelection} />
          <Stats selectedMeasures={selectedMeasures} />
          {selectedResidence &&
            selectedType &&
            selectedResidence.dimensions && (
              <CalculationHandler
                dimensions={selectedResidence.dimensions}
                woningType={selectedType}
                onCalculate={handleCalculations}
              />
            )}
          <SelectedMeasures
            measures={selectedMeasures}
            onRemove={handleRemoveMeasure}
          />
        </div>
        {calculations && (
          <MeasureList
            residenceType={selectedType?.type}
            buildPeriod={
              selectedResidence?.projectInformation?.bouwPeriode || ""
            }
            residenceData={calculations}
            onSelectMeasure={handleAddMeasure}
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