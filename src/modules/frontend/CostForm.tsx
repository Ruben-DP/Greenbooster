"use client";
import { useState, useEffect } from "react";
import { MeasureProvider } from "@/contexts/DataContext";
import Budget from "./calculations/Budget";
import MeasureList from "./calculations/MeasureList";
import Residence from "./calculations/Residence";
import Stats from "./calculations/Stats";
import { Woning, WoningType } from "@/types/woningen";
import { CalculationHandler } from "./calculations/CalculationHandler";
import SelectedMeasures from "./calculations/SelectMeasures";
import PdfDownloadButton from "../PdfDownloadButton";
import { EnergyLabel } from "./calculations/EnergyLabel";
import SaveProfileButton from "../residenceProfile/SaveProfileButton";
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

  // Calculation explanations
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

  // Calculate total heat demand whenever selectedMeasures changes
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

  // New function to recalculate measure prices based on new residence data
  const recalculateMeasures = (
    measures: Measure[],
    calculationData: CalculationResults
  ) => {
    if (!calculationData || measures.length === 0) return [];

    return measures.map((measure) => {
      // Calculate price
      const priceResult = calculationData
        ? calculateMeasurePrice(measure.measure_prices, calculationData)
        : { isValid: false, price: 0, calculations: [] };

      // Calculate maintenance
      const maintenanceResult = calculationData
        ? calculateMeasurePrice(measure.mjob_prices, calculationData)
        : { isValid: false, price: 0, calculations: [] };

      // Calculate maintenance costs
      const { total40Years, perYear } = calculateMaintenanceCosts
        ? calculateMaintenanceCosts(maintenanceResult, measure.mjob_prices)
        : { total40Years: 0, perYear: 0 };

      // Get heat demand value
      const heatDemandValue =
        selectedType && selectedResidence
          ? getHeatDemandValue(
              measure,
              selectedType.type || "",
              selectedResidence.projectInformation?.bouwPeriode || ""
            )
          : 0;

      // Return updated measure
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
    console.groupCollapsed(
      `===== MAATREGEL: ${measure.name} (${
        measure.group || "Geen Groep"
      }) =====`
    );

    if (measure.action === "remove") {
      console.log("Actie: Maatregel verwijderen");
      console.log(`Prijs die wordt verwijderd: €${measure.price || 0}`);

      // Remove the measure
      setSelectedMeasures((prev) =>
        prev.filter((m) => m.name !== measure.name)
      );
      setTotalBudget((prev) => prev - (measure.price || 0));
      console.groupEnd();
      return;
    }

    console.log("Actie: Maatregel toevoegen");

    // Check if measure already exists
    const measureExists = selectedMeasures.some((m) => m.name === measure.name);
    if (measureExists) {
      console.log("Maatregel bestaat al in selectie - wordt overgeslagen");
      console.groupEnd();
      return; // Don't add if it already exists
    }

    // Log calculation inputs
    console.groupCollapsed("BEREKENINGSINVOER");
    console.log(`Gebouwtype: ${selectedType?.type || "Onbekend"}`);
    console.log(
      `Bouwperiode: ${
        selectedResidence?.projectInformation?.bouwPeriode || "Onbekend"
      }`
    );
    console.groupEnd();

    if (calculations) {
      console.groupCollapsed("BESCHIKBARE BEREKENINGSWAARDEN");
      console.log(
        "Basis Afmetingen (woningSpecifiek):",
        calculations.woningSpecifiek
      );

      // Group values by category for better readability
      console.groupCollapsed("Oppervlaktes");
      console.log("Gevel:", {
        gevelOppervlakVoor: calculations.gevelOppervlakVoor,
        gevelOppervlakAchter: calculations.gevelOppervlakAchter,
        gevelOppervlakTotaal: calculations.gevelOppervlakTotaal,
        gevelOppervlakNetto: calculations.gevelOppervlakNetto,
      });

      console.log("Dak:", {
        dakOppervlak: calculations.dakOppervlak,
        dakOppervlakTotaal: calculations.dakOppervlakTotaal,
        dakLengte: calculations.dakLengte,
        dakLengteTotaal: calculations.dakLengteTotaal,
        dakOverstekOppervlak: calculations.dakOverstekOppervlak,
        dakTotaalMetOverhang: calculations.dakTotaalMetOverhang,
      });

      console.log("Vloer:", {
        vloerOppervlak: calculations.vloerOppervlak,
        vloerOppervlakTotaal: calculations.vloerOppervlakTotaal,
      });

      console.log("Kozijnen:", {
        kozijnOppervlakVoorTotaal: calculations.kozijnOppervlakVoorTotaal,
        kozijnOppervlakAchterTotaal: calculations.kozijnOppervlakAchterTotaal,
        kozijnOppervlakTotaal: calculations.kozijnOppervlakTotaal,
        kozijnRendementTotaal: calculations.kozijnRendementTotaal,
        kozijnOmtrekTotaal: calculations.kozijnOmtrekTotaal,
      });

      console.log("Project Totalen:", {
        projectGevelOppervlak: calculations.projectGevelOppervlak,
        projectKozijnenOppervlak: calculations.projectKozijnenOppervlak,
        projectDakOppervlak: calculations.projectDakOppervlak,
        projectOmtrek: calculations.projectOmtrek,
      });
      console.groupEnd(); // End Surface Areas

      // Log any warnings or missing inputs
      if (calculations.missingInputs && calculations.missingInputs.length > 0) {
        console.groupCollapsed("ONTBREKENDE INVOER");
        console.log(calculations.missingInputs);
        console.groupEnd();
      }

      if (
        calculations.calculationWarnings &&
        calculations.calculationWarnings.length > 0
      ) {
        console.groupCollapsed("BEREKENINGSWAARSCHUWINGEN");
        console.log(calculations.calculationWarnings);
        console.groupEnd();
      }

      // Log calculation explanations (how values were calculated)
      if (calculations.calculationExplanations) {
        console.groupCollapsed("BEREKENINGSTOELICHTINGEN");

        // Group by calculation type
        console.groupCollapsed("Gevel Berekeningen");
        Object.entries(calculations.calculationExplanations)
          .filter(([key]) => key.includes("gevelOppervlak"))
          .forEach(([key, explanation]) => {
            console.log(`${key}: ${explanation}`);
          });
        console.groupEnd();

        console.groupCollapsed("Dak Berekeningen");
        Object.entries(calculations.calculationExplanations)
          .filter(([key]) => key.includes("dak"))
          .forEach(([key, explanation]) => {
            console.log(`${key}: ${explanation}`);
          });
        console.groupEnd();

        console.groupCollapsed("Kozijn Berekeningen");
        Object.entries(calculations.calculationExplanations)
          .filter(([key]) => key.includes("kozijn"))
          .forEach(([key, explanation]) => {
            console.log(`${key}: ${explanation}`);
          });
        console.groupEnd();

        console.groupCollapsed("Vloer Berekeningen");
        Object.entries(calculations.calculationExplanations)
          .filter(([key]) => key.includes("vloer"))
          .forEach(([key, explanation]) => {
            console.log(`${key}: ${explanation}`);
          });
        console.groupEnd();

        console.groupCollapsed("Project Totalen");
        Object.entries(calculations.calculationExplanations)
          .filter(([key]) => key.includes("project"))
          .forEach(([key, explanation]) => {
            console.log(`${key}: ${explanation}`);
          });
        console.groupEnd();

        console.groupEnd(); // End CALCULATION EXPLANATIONS
      }

      console.groupEnd(); // End AVAILABLE CALCULATION VALUES
    } else {
      console.log("Geen berekeningen beschikbaar");
    }

    // Log measure pricing details
    console.groupCollapsed("PRIJSFORMULES MAATREGEL");
    if (measure.measure_prices && measure.measure_prices.length > 0) {
      measure.measure_prices.forEach((price, index) => {
        console.groupCollapsed(
          `Prijsformule ${index + 1}: ${price.name || "Naamloos"}`
        );
        console.log(
          `Eenheid: ${
            price.unit || "niet gespecificeerd"
          }, Prijs per eenheid: €${price.price || 0}`
        );

        if (price.calculation && price.calculation.length > 0) {
          console.groupCollapsed("Berekeningsstappen");
          let calculationExpression = "";
          let currentValue = 0;
          let operation = "+";

          price.calculation.forEach((calc, calcIndex) => {
            if (calc.type === "variable") {
              console.groupCollapsed(
                `Stap ${calcIndex + 1}: Variabele '${calc.value}'`
              );
              if (calculations) {
                // Try to find the variable value in calculations
                const variableValue = findVariableValue(
                  calc.value,
                  calculations
                );

                // Update calculation expression
                if (calcIndex === 0) {
                  calculationExpression = `${
                    variableValue !== undefined ? variableValue : "Onbekend"
                  }`;
                  currentValue =
                    variableValue !== undefined ? Number(variableValue) : 0;
                } else {
                  calculationExpression += ` ${operation} ${
                    variableValue !== undefined ? variableValue : "Onbekend"
                  }`;
                  // Apply operation
                  if (operation === "+")
                    currentValue +=
                      variableValue !== undefined ? Number(variableValue) : 0;
                  else if (operation === "-")
                    currentValue -=
                      variableValue !== undefined ? Number(variableValue) : 0;
                  else if (operation === "*")
                    currentValue *=
                      variableValue !== undefined ? Number(variableValue) : 0;
                  else if (operation === "/")
                    currentValue /=
                      variableValue !== undefined ? Number(variableValue) : 1;
                }

                console.log(
                  `Waarde: ${
                    variableValue !== undefined
                      ? variableValue
                      : "Niet gevonden"
                  }`
                );

                // Add explanation for this variable
                if (
                  calculations.calculationExplanations &&
                  calc.value in calculations.calculationExplanations
                ) {
                  console.log(
                    `Berekening: ${
                      calculations.calculationExplanations[calc.value]
                    }`
                  );
                }
              }
              console.groupEnd();
            } else if (calc.type === "operator") {
              console.log(`Stap ${calcIndex + 1}: Operator '${calc.value}'`);
              operation = calc.value;
            }
          });

          // Show final calculation expression and result
          const finalPrice = currentValue * (price.price || 0);
          console.log(
            `Berekeningsformule: (${calculationExpression}) × €${
              price.price || 0
            } = €${finalPrice.toFixed(2)}`
          );
          console.groupEnd(); // End Calculation steps
        } else {
          console.log("Geen berekeningsstappen gedefinieerd");
        }
        console.groupEnd(); // End Price formula
      });
    } else {
      console.log("Geen prijsformules gedefinieerd");
    }
    console.groupEnd(); // End MEASURE PRICE FORMULAS

    // Log heat demand calculation
    console.groupCollapsed("WARMTEVRAAG BEREKENING");
    const heatDemandValue = measure.heat_demand
      ? getHeatDemandValue(
          measure,
          selectedType?.type || "",
          selectedResidence?.projectInformation?.bouwPeriode || ""
        )
      : 0;

    console.log(`Gebouwtype: ${selectedType?.type || "Onbekend"}`);
    console.log(
      `Bouwperiode: ${
        selectedResidence?.projectInformation?.bouwPeriode || "Onbekend"
      }`
    );
    console.log(`Warmtevraag waarde: ${heatDemandValue} kWh/m²`);

    if (measure.heat_demand) {
      console.groupCollapsed("Beschikbare Warmtevraag Data");
      Object.entries(measure.heat_demand).forEach(([type, periods]) => {
        if (Array.isArray(periods)) {
          console.groupCollapsed(`${type}:`);
          periods.forEach((period) => {
            console.log(`Periode: ${period.period}, Waarde: ${period.value}`);
          });
          console.groupEnd();
        }
      });
      console.groupEnd();
    }
    console.groupEnd(); // End HEAT DEMAND CALCULATION

    // Add heat demand value to the measure
    measure.heatDemandValue = heatDemandValue;

    // Set the new measures and budget
    setSelectedMeasures((prev) => [...prev, measure]);
    setTotalBudget((prev) => prev + (measure.price || 0));

    // Log final results
    console.groupCollapsed("EINDRESULTATEN");
    console.log(`Prijs: €${measure.price || 0}`);
    console.log(`Onderhoudskosten: €${measure.maintenancePrice || 0}`);
    console.log(
      `Onderhoudskosten (40 Jaar): €${measure.maintenanceCost40Years || 0}`
    );
    console.log(
      `Onderhoudskosten (Per Jaar): €${measure.maintenanceCostPerYear || 0}`
    );
    console.groupEnd(); // End FINAL RESULTS

    console.groupEnd(); // End of main group for this measure
  };

  const findVariableValue = (
    variableName: string,
    calculationData: Record<string, any>
  ): any => {
    // Try direct lookup in woningSpecifiek
    if (
      calculationData.woningSpecifiek &&
      calculationData.woningSpecifiek[variableName] !== undefined
    ) {
      return calculationData.woningSpecifiek[variableName];
    }

    // Try direct lookup in top level
    if (calculationData[variableName] !== undefined) {
      return calculationData[variableName];
    }

    // Try legacy variable names
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

    // If it's a fixed numeric value like "5%"
    if (typeof legacyMapping[variableName] === "number") {
      return legacyMapping[variableName];
    }

    // Try legacy mapping in woningSpecifiek
    const mappedName = legacyMapping[variableName] as string;
    if (
      mappedName &&
      calculationData.woningSpecifiek &&
      calculationData.woningSpecifiek[mappedName] !== undefined
    ) {
      return calculationData.woningSpecifiek[mappedName];
    }

    // Try legacy mapping in top level
    if (mappedName && calculationData[mappedName] !== undefined) {
      return calculationData[mappedName];
    }

    // Try as a numeric literal
    if (!isNaN(Number(variableName))) {
      return Number(variableName);
    }

    // No value found
    return undefined;
  };

  const getHeatDemandValue = (
    measure: any,
    buildingType: string,
    buildPeriod: string
  ): number => {
    // Default value if nothing is found
    const defaultValue = 0;

    // Check if measure has heat_demand data
    if (!measure?.heat_demand) {
      return defaultValue;
    }

    // Map building type to heat_demand property key
    let typeKey = "grondgebonden"; // Default

    if (buildingType?.toLowerCase().includes("portiek")) {
      typeKey = "portiek";
    } else if (
      buildingType?.toLowerCase().includes("galerij") ||
      buildingType?.toLowerCase().includes("gallerij")
    ) {
      typeKey = "gallerij";
    }

    // Get the values for this type
    const typeValues = measure.heat_demand[typeKey];

    // Return default if no values exist for this type
    if (!Array.isArray(typeValues) || typeValues.length === 0) {
      return defaultValue;
    }

    // Find the matching period
    const periodData = typeValues.find((p) => p.period === buildPeriod);

    // Return the value if found, otherwise default
    return periodData?.value ?? defaultValue;
  };

  // Modified to keep selected measures
  const handleSelection = (
    residence: Woning,
    type: WoningType,
    typeStr: string
  ) => {
    // Set the new residence and type
    setSelectedResidence(residence);
    setSelectedType(type);

    // Don't reset the calculation yet
    // We'll recalculate after getting the new calculation data
  };

  // New useEffect to update measures when calculations change
  useEffect(() => {
    if (!calculations || !selectedResidence || !selectedType) return;

    // If we have selected measures, recalculate them with the new residence data
    if (selectedMeasures.length > 0) {
      const updatedMeasures = recalculateMeasures(
        selectedMeasures,
        calculations
      );
      setSelectedMeasures(updatedMeasures);

      // Calculate new total budget
      const newBudget = updatedMeasures.reduce(
        (sum, measure) => sum + (measure.price || 0),
        0
      );
      setTotalBudget(newBudget);
    }
  }, [calculations, selectedResidence, selectedType]);

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

  // Function to help calculate maintenance costs
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

    // Get settings (in a real implementation, you would fetch this from context or props)
    const inflationPercentage = 1; // Default 1%
    const maintenancePeriodYears = 40; // 40 year period

    // Calculate how many times each maintenance job occurs in 40 years
    let total40Years = 0;

    mjob_prices.forEach((job, index) => {
      const calculation = maintenanceResult.calculations[index];
      if (!calculation || !job.cycle || job.cycle <= 0) return;

      // Skip if this calculation has no matching job
      if (calculation.name !== job.name) return;

      // Get single occurrence cost
      const baseJobCost = calculation.totalPrice;

      // Calculate how many times this job occurs in 40 years
      const cycleStart = job.cycleStart || 0;
      const cycle = job.cycle || 1; // Default to yearly if not specified

      if (cycleStart >= maintenancePeriodYears) {
        // Job doesn't start within our 40-year window
        return;
      }

      // Calculate occurrences with inflation
      if (cycle <= 0) {
        // Avoid division by zero
        return;
      }

      // Apply inflation for each occurrence of the maintenance job
      for (
        let year = cycleStart;
        year < maintenancePeriodYears;
        year += cycle
      ) {
        // Calculate inflated cost for this occurrence
        const inflatedCost =
          baseJobCost * Math.pow(1 + inflationPercentage / 100, year);

        total40Years += inflatedCost;
      }
    });

    // Calculate yearly average
    const perYear = total40Years / maintenancePeriodYears;

    return { total40Years, perYear };
  };

  // console.log("selected residence", selectedResidence);

  return (
    <div className="cost-form">
      <div className="container">
        <div className="inner-content">
          <EnergyLabel
            currentEnergyUsage={selectedResidence?.energyDetails.huidigVerbruik}
            totalWarmth={totalHeatDemand}
          />
          <Budget totalAmount={totalBudget} />
          <Stats
            selectedMeasures={selectedMeasures}
            totalHeatDemand={totalHeatDemand}
          />
          <div className="tile-grouper">
            <Residence
              selectedResidence={handleSelection}
              residenceType={selectedType?.type}
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
              {selectedResidence && (
                <SaveProfileButton
                  woningId={selectedResidence._id}
                  typeId={selectedType?._id || ""}
                  measures={selectedMeasures}
                  totalBudget={totalBudget}
                  totalHeatDemand={totalHeatDemand}
                  isDisabled={
                    !selectedResidence || selectedMeasures.length === 0
                  }
                />
              )}
              <div className="downloadPDF">
                <PdfDownloadButton
                  selectedResidence={selectedResidence}
                  selectedMeasures={selectedMeasures}
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
