"use client";

import { useMeasureData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { getHeatDemandValue } from "./heat-demand";
import { calculateMeasurePrice } from "./price.calculator";
import { Flame, Volume1, Plus, Trash2, AlertTriangle } from "lucide-react";
import { getSettings } from "@/app/actions/settingsActions"; // Import de instellingen functie
import { Settings } from "@/types/settings"; // Import het Settings type

interface Calculation {
  type: string;
  value: string;
  position?: number;
}

interface MeasurePrice {
  name?: string;
  unit?: string;
  calculation: Calculation[];
  price?: number;
}

interface MaintenancePrice extends MeasurePrice {
  cycleStart?: number;
  cycle?: number;
}

interface Measure {
  name: string;
  group?: string;
  measure_prices?: MeasurePrice[];
  mjob_prices?: MaintenancePrice[];
  price?: number;
  priceCalculations?: any[];
  maintenancePrice?: number;
  maintenanceCalculations?: any[];
  maintenanceCost40Years?: number;
  maintenanceCostPerYear?: number;
  calculationError?: string;
  maintenanceError?: string;
  heat_demand?: {
    portiek?: Array<{ period: string; value: number }>;
    gallerij?: Array<{ period: string; value: number }>;
    grondgebonden?: Array<{ period: string; value: number }>;
  };
  includeLabor?: boolean;
  laborNorm?: number;
  [key: string]: any;
}

interface GroupedMeasures {
  [key: string]: Measure[];
}

interface MeasureListProps {
  residenceData: Record<string, any> | null;
  onSelectMeasure: (measure: Measure) => void;
  buildPeriod: string;
  residenceType: string;
  selectedMeasures?: Measure[];
}

// Constants
const MAINTENANCE_PERIOD_YEARS = 40; // Period for calculation in years
const ANNUAL_INFLATION_RATE = 0.01; // 1% annual inflation

// Define custom group order - modify this array to change the order
// Any groups not in this array will be displayed after these groups
const GROUP_ORDER = [
  "dak",
  "gevel buiten",
  "vloeren",
  "gevel binnen",
  "kozijnen",
  "bergingen",
  "opwek",
  "ventilatie",
  "ruimteverwarming",
  "elektra",
  "diversen",
];

export default function MeasureList({
  residenceData,
  onSelectMeasure,
  buildPeriod,
  residenceType,
  selectedMeasures = [],
}: MeasureListProps) {
  const { searchItems, items, isLoading, error } = useMeasureData();
  const [selectedResidence, setSelectedResidence] = useState<Record<
    string,
    any
  > | null>(null);
  const [expandedMeasure, setExpandedMeasure] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>({
    hourlyLaborCost: 51, // Standaardwaarde tot geladen
    profitPercentage: 25, // Standaardwaarde tot geladen
    vatPercentage: 21, // Standaardwaarde tot geladen
    inflationPercentage: 1, // Standaardwaarde tot geladen
    cornerHouseCorrection: -10, // Standaardwaarde tot geladen
  });

  // Load measures and settings when component mounts
  useEffect(() => {
    // Haal zowel de maatregelen als de instellingen op
    const initializeData = async () => {
      // Haal maatregelen op
      searchItems("");
      // Haal instellingen op
      try {
        const settingsResult = await getSettings();
        if (settingsResult.success && settingsResult.data) {
          setSettings(settingsResult.data);
          console.log("Instellingen geladen:", settingsResult.data);
        }
      } catch (error) {
        console.error("Fout bij laden instellingen:", error);
      }
    };

    initializeData();
  }, []);

  // Update selected residence when residenceData changes
  useEffect(() => {
    if (residenceData) {
      setSelectedResidence(residenceData);
    }
  }, [residenceData]);

  // Calculate maintenance costs over 40 years
  const calculateMaintenanceCosts = (
    maintenanceResult: { isValid: boolean; price: number; calculations: any[] },
    mjob_prices?: MaintenancePrice[]
  ) => {
    if (
      !maintenanceResult.isValid ||
      !mjob_prices ||
      !Array.isArray(mjob_prices)
    ) {
      return { total40Years: 0, perYear: 0 };
    }

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

      if (cycleStart >= MAINTENANCE_PERIOD_YEARS) {
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
        year < MAINTENANCE_PERIOD_YEARS;
        year += cycle
      ) {
        // Calculate inflated cost for this occurrence
        const inflatedCost =
          baseJobCost * Math.pow(1 + settings.inflationPercentage / 100, year);

        total40Years += inflatedCost;
      }
    });

    // Calculate yearly average
    const perYear = total40Years / MAINTENANCE_PERIOD_YEARS;

    return { total40Years, perYear };
  };

  // Add helper function to check if measure is selected
  const isMeasureSelected = (measure: Measure) => {
    return selectedMeasures.some((m) => m.name === measure.name);
  };

  // Function to check if there are any calculation issues that should trigger a warning
  const hasCalculationWarning = (
    measure: Measure,
    priceResult: any,
    maintenanceResult: any,
    heatDemandValue: number,
    totalPrice: number
  ) => {
    // Check if price calculation has errors
    if (!priceResult.isValid) {
      return true;
    }

    // Check if total price is zero
    if (totalPrice === 0) {
      return true;
    }

    // Check if any calculation involves multiplication by zero
    // const hasZeroMultiplication =
    //   priceResult.calculations.some(
    //     (calc: any) => calc.quantity === 0 || calc.unitPrice === 0
    //   ) ||
    //   (maintenanceResult.isValid &&
    //     maintenanceResult.calculations.some(
    //       (calc: any) => calc.quantity === 0 || calc.unitPrice === 0
    //     ));

    // Check if maintenance calculation has errors (if mjob_prices exists)
    const hasMaintenanceIssue =
      measure.mjob_prices &&
      measure.mjob_prices.length > 0 &&
      !maintenanceResult.isValid;

    // Check if heat demand is expected but missing or zero
    const missingHeatDemand =
      measure.heat_demand &&
      // Check if the measure has heat_demand data for any residence type
      Object.keys(measure.heat_demand).length > 0 &&
      // Check if there's heat_demand data for the current residence type
      (() => {
        // Determine the residence type key
        let typeKey = "grondgebonden"; // Default
        if (residenceType?.toLowerCase().includes("portiek")) {
          typeKey = "portiek";
        } else if (
          residenceType?.toLowerCase().includes("galerij") ||
          residenceType?.toLowerCase().includes("gallerij")
        ) {
          typeKey = "gallerij";
        }

        // Check if there's data for this type AND the heat demand value is missing or zero
        return (
          measure.heat_demand[typeKey] &&
          Array.isArray(measure.heat_demand[typeKey]) &&
          measure.heat_demand[typeKey].length > 0 &&
          (heatDemandValue === 0 || heatDemandValue === undefined)
        );
      })();

    // Check if nuisance indicator is expected but missing
    const missingNuisanceIndicator =
      measure.hasOwnProperty("nuisance") && !measure.nuisance;

    return (
      // hasZeroMultiplication ||
      hasMaintenanceIssue || missingHeatDemand || missingNuisanceIndicator
    );
  };

  // Function to generate warning messages based on calculation issues
  const getWarningMessages = (
    measure: Measure,
    priceResult: any,
    maintenanceResult: any,
    heatDemandValue: number,
    totalPrice: number
  ) => {
    const warnings = [];

    // Check if price calculation has errors
    if (!priceResult.isValid) {
      warnings.push(
        priceResult.errorMessage || "Prijs kan niet worden berekend"
      );
    }

    // Check if total price is zero
    if (totalPrice === 0) {
      warnings.push("Totaalprijs is €0,00");
    }

    // Check if any calculation involves multiplication by zero
    // const hasZeroMultiplication = priceResult.calculations.some(
    //   (calc: any) => calc.quantity === 0 || calc.unitPrice === 0
    // );

    // if (hasZeroMultiplication) {
    //   warnings.push("Berekening bevat vermenigvuldiging met nul");
    // }

    // Check if maintenance calculation has errors
    if (
      measure.mjob_prices &&
      measure.mjob_prices.length > 0 &&
      !maintenanceResult.isValid
    ) {
      warnings.push(
        maintenanceResult.errorMessage ||
          "Onderhoudskosten kunnen niet worden berekend"
      );
    }

    // Check if maintenance calculations have zero multiplications
    if (
      maintenanceResult.isValid &&
      maintenanceResult.calculations.some(
        (calc: any) => calc.quantity === 0 || calc.unitPrice === 0
      )
    ) {
      warnings.push("Onderhoudsberekening bevat vermenigvuldiging met nul");
    }

    // Check if heat demand is expected but missing or zero
    if (
      measure.heat_demand &&
      Object.keys(measure.heat_demand).length > 0 &&
      (heatDemandValue === 0 ||
        heatDemandValue === undefined ||
        heatDemandValue === null)
    ) {
      warnings.push(
        "Warmtebehoefte ontbreekt of is 0 voor deze woningsoort/bouwperiode"
      );
    }

    // Check if nuisance indicator is expected but missing
    if (measure.hasOwnProperty("nuisance") && !measure.nuisance) {
      warnings.push("Hinder indicator ontbreekt");
    }
    if (measure.hasOwnProperty("nuisance") && !measure.nuisance) {
      warnings.push("Hinder indicator ontbreekt");
    }

    return warnings;
  };

  // Modify handleAddMeasure to handle both add and remove
  // Modify handleAddMeasure to handle both add and remove
  const handleAddMeasure = (measure: Measure) => {
    if (isMeasureSelected(measure)) {
      // If measure is already selected, remove it
      onSelectMeasure({ ...measure, action: "remove" });
      return;
    }

    // Original add logic
    const heatDemandValue = getHeatDemandValue(
      measure,
      residenceType,
      buildPeriod
    );

    // Calculate the price based on the measure_prices and calculation data
    const priceData = calculateMeasurePrice(
      measure.measure_prices,
      selectedResidence
    );

    // Calculate maintenance price based on mjob_prices
    const maintenanceData = calculateMeasurePrice(
      measure.mjob_prices,
      selectedResidence
    );

    // Calculate 40-year and per-year maintenance costs
    const { total40Years, perYear } = calculateMaintenanceCosts(
      maintenanceData,
      measure.mjob_prices
    );

    // Calculate labor cost if applicable
    let laborCost = 0;
    let laborDetails: Array<{
      name: string;
      norm: number;
      quantity: number;
      cost: number;
    }> = [];

    // Check if labor costs should be calculated
    const shouldCalculateLabor =
      measure.measure_prices &&
      Array.isArray(measure.measure_prices) &&
      measure.measure_prices.some(
        (item) => item.includeLabor && item.laborNorm && item.laborNorm > 0
      );

    // Find items with labor costs
    const itemsWithLabor =
      measure.measure_prices?.filter(
        (item) => item.includeLabor && item.laborNorm && item.laborNorm > 0
      ) || [];

    if (
      shouldCalculateLabor &&
      itemsWithLabor.length > 0 &&
      priceData.isValid
    ) {
      // Calculate labor costs for each item with labor
      itemsWithLabor.forEach((laborItem) => {
        // If there are calculations, use the result quantity to determine labor hours
        const matchingCalc = priceData.calculations.find(
          (calc) => calc.name === laborItem.name
        );

        if (matchingCalc && laborItem.laborNorm) {
          // Get hourly rate from settings
          const laborHourCost = settings.hourlyLaborCost;

          // Calculate labor cost for this item
          const itemLaborCost =
            laborItem.laborNorm * matchingCalc.quantity * laborHourCost;

          // Add to total labor cost
          laborCost += itemLaborCost;

          // Store details for display
          laborDetails.push({
            name: laborItem.name || "Arbeidskosten",
            norm: laborItem.laborNorm,
            quantity: matchingCalc.quantity,
            cost: itemLaborCost,
          });
        }
      });
    }

    // Calculate the base material cost
    const materialCost = priceData.isValid ? priceData.price : 0;

    // Calculate final base cost including labor
    const baseCost = materialCost + laborCost;

    // Add price (including labor), maintenance price, and heat demand value to measure object before passing it up
    const measureWithPrice = {
      ...measure,
      price: baseCost, // Use baseCost instead of just priceData.price
      laborCost: laborCost, // Also pass the labor cost separately for reference
      laborDetails: laborDetails, // Pass labor details for breakdown
      materialCost: materialCost, // Pass the material cost separately
      priceCalculations: priceData.calculations,
      calculationError: !priceData.isValid ? priceData.errorMessage : undefined,
      maintenancePrice: maintenanceData.isValid
        ? maintenanceData.price
        : undefined,
      maintenanceCalculations: maintenanceData.calculations,
      maintenanceError: !maintenanceData.isValid
        ? maintenanceData.errorMessage
        : undefined,
      maintenanceCost40Years: total40Years,
      maintenanceCostPerYear: perYear,
      heatDemandValue: heatDemandValue,
    };

    // Add action property to indicate this is an add operation
    onSelectMeasure({ ...measureWithPrice, action: "add" });
  };

  // Toggle the expanded state of a measure
  const toggleAccordion = (measureName: string) => {
    setExpandedMeasure(expandedMeasure === measureName ? null : measureName);
  };

  if (isLoading) return <div>Maatregelen laden...</div>;
  if (error) return <div>Fout bij laden maatregelen: {error}</div>;
  if (!items || items.length === 0) return <div>Geen maatregelen gevonden</div>;

  // Group items by their group property
  const groupedItems = items.reduce<GroupedMeasures>((groups, item) => {
    if (!item) return groups;
    const groupName = item.group || "Overig";
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(item as Measure);
    return groups;
  }, {});

  // Get all group names from the data
  const allGroups = Object.keys(groupedItems);

  // Create ordered group array:
  // 1. First include all groups from GROUP_ORDER that exist in the data
  // 2. Then add any groups that aren't in GROUP_ORDER but exist in the data
  const orderedGroups = [
    ...GROUP_ORDER.filter((group) => allGroups.includes(group)),
    ...allGroups.filter((group) => !GROUP_ORDER.includes(group)),
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="measure-list tile">
      {orderedGroups.map((groupName) => (
        <div key={groupName} className="measure-group">
          <h2 className="measure-group-title">{groupName}</h2>
          <div className="measure">
            {[...groupedItems[groupName]]
              .sort((a, b) => {
                // Extract numbers from the names
                const aMatches = a.name.match(/(\d+)/g);
                const bMatches = b.name.match(/(\d+)/g);

                // If both have numbers, compare the first number
                if (aMatches && bMatches) {
                  const aNum = parseInt(aMatches[0], 10);
                  const bNum = parseInt(bMatches[0], 10);
                  // If the numbers are different, sort by number
                  if (aNum !== bNum) {
                    return aNum - bNum;
                  }
                }

                // Fall back to regular string comparison if no numbers or same numbers
                return a.name.localeCompare(b.name);
              })
              .map((measure, index) => {
                const isExpanded = expandedMeasure === measure.name;

                // Calculate price and get heat demand for this measure
                const priceResult = selectedResidence
                  ? calculateMeasurePrice(
                      measure.measure_prices,
                      selectedResidence
                    )
                  : { isValid: false, price: 0, calculations: [] };

                // Calculate maintenance price
                const maintenanceResult = selectedResidence
                  ? calculateMeasurePrice(
                      measure.mjob_prices,
                      selectedResidence
                    )
                  : { isValid: false, price: 0, calculations: [] };

                // Calculate 40-year maintenance costs
                const { total40Years, perYear } = calculateMaintenanceCosts(
                  maintenanceResult,
                  measure.mjob_prices
                );

                const heatDemandValue = getHeatDemandValue(
                  measure,
                  residenceType,
                  buildPeriod
                );

                // Calculate final price including labor, profit, and VAT
                const materialCost = priceResult.isValid
                  ? priceResult.price
                  : 0;

                // Calculate labor cost if applicable
                let laborCost = 0;
                let laborDetails: Array<{
                  name: string;
                  norm: number;
                  quantity: number;
                  cost: number;
                }> = [];

                // Check if labor costs should be calculated
                const shouldCalculateLabor =
                  measure.measure_prices &&
                  Array.isArray(measure.measure_prices) &&
                  measure.measure_prices.some(
                    (item) =>
                      item.includeLabor && item.laborNorm && item.laborNorm > 0
                  );

                // Find items with labor costs
                const itemsWithLabor =
                  measure.measure_prices?.filter(
                    (item) =>
                      item.includeLabor && item.laborNorm && item.laborNorm > 0
                  ) || [];

                if (shouldCalculateLabor && itemsWithLabor.length > 0) {
                  // Calculate labor costs for each item with labor
                  itemsWithLabor.forEach((laborItem) => {
                    // If there are calculations, use the result quantity to determine labor hours
                    const matchingCalc = priceResult.calculations.find(
                      (calc) => calc.name === laborItem.name
                    );

                    if (matchingCalc && laborItem.laborNorm) {
                      // Gebruik het uurtarief uit de database instellingen
                      const laborHourCost = settings.hourlyLaborCost;

                      // Calculate labor cost for this item
                      const itemLaborCost =
                        laborItem.laborNorm *
                        matchingCalc.quantity *
                        laborHourCost;

                      // Add to total labor cost
                      laborCost += itemLaborCost;

                      // Store details for display
                      laborDetails.push({
                        name: laborItem.name || "Arbeidskosten",
                        norm: laborItem.laborNorm,
                        quantity: matchingCalc.quantity,
                        cost: itemLaborCost,
                      });
                    }
                  });
                }

                // Calculate final base cost including labor
                const baseCost = materialCost + laborCost;

                // Bereken het winstpercentage uit de database instellingen
                const profitMarginRate = settings.profitPercentage / 100;

                // Calculate profit and VAT
                const withProfit = baseCost * (1 + profitMarginRate);
                const withVAT = withProfit * (1 + settings.vatPercentage / 100);

                // Check if measure has any calculation issues that should trigger a warning
                const showWarning = hasCalculationWarning(
                  measure,
                  priceResult,
                  maintenanceResult,
                  heatDemandValue,
                  withVAT
                );

                // Get specific warning messages
                const warningMessages = getWarningMessages(
                  measure,
                  priceResult,
                  maintenanceResult,
                  heatDemandValue,
                  withVAT
                );

                // Check if measure has any maintenance jobs
                const hasMaintenance =
                  measure.mjob_prices &&
                  Array.isArray(measure.mjob_prices) &&
                  measure.mjob_prices.length > 0 &&
                  measure.mjob_prices.some((job) => job.name);

                return (
                  <div
                    key={`${measure.name}-${index}`}
                    className="measure__item"
                  >
                    <div className="measure__header">
                      <div
                        className={`measure__name ${
                          isExpanded ? "expanded" : ""
                        }`}
                      >
                        {/* Measure title and toggle button */}
                        <div
                          className="measure__title-area"
                          onClick={() => toggleAccordion(measure.name)}
                          aria-expanded={isExpanded}
                        >
                          <button className="measure__toggle">
                            <span className="measure__toggle-icon"></span>
                          </button>
                          <span>{measure.name}</span>
                          {/* Warning icon */}
                          {showWarning && (
                            <AlertTriangle
                              size={18}
                              className="warning-icon"
                              color="#FF5F15"
                              style={{ marginLeft: "6px" }}
                              title="Er zijn problemen met de berekeningen voor deze maatregel"
                            />
                          )}
                        </div>

                        {/* Price display and add button */}
                        <div className="measure__actions">
                          {selectedResidence ? (
                            priceResult.isValid ? (
                              <div
                                className={`price ${
                                  withVAT === 0 ? "price--warning" : ""
                                }`}
                              >
                                € {formatPrice(baseCost)}
                              </div>
                            ) : (
                              <div className="price price--warning">
                                Geen prijs beschikbaar
                              </div>
                            )
                          ) : (
                            <div className="price price--loading">
                              Berekenen...
                            </div>
                          )}

                          <button
                            className={`measure__add ${
                              isMeasureSelected(measure)
                                ? "measure__add--selected"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMeasure(measure);
                            }}
                            title={
                              isMeasureSelected(measure)
                                ? "Verwijderen uit geselecteerde maatregelen"
                                : "Toevoegen aan geselecteerde maatregelen"
                            }
                          >
                            {isMeasureSelected(measure) ? (
                              <Trash2 size={16} />
                            ) : (
                              <Plus size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable details section */}
                    {isExpanded && (
                      <div className="measure__details">
                        {/* Warning messages section - NEW */}
                        {showWarning && warningMessages.length > 0 && (
                          <div className="measure__warnings">
                            <div className="warning-header">
                              <AlertTriangle size={16} color="#FF5F15" />
                              <span>Waarschuwingen:</span>
                            </div>
                            <ul className="warning-list">
                              {warningMessages.map((message, idx) => (
                                <li key={idx} className="warning-item">
                                  {message}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Price calculation breakdown */}
                        <div className="measure__section">
                          {(measure.nuisance || heatDemandValue > 0) && (
                            <div className="additional-info">
                              {measure.nuisance && (
                                <div className="measure__nuisance sub-measure">
                                  <Volume1 className="icon" size={20} />
                                  <span>
                                    <strong>
                                      Hinder indicator: {measure.nuisance}
                                    </strong>{" "}
                                  </span>
                                </div>
                              )}
                              {heatDemandValue > 0 && (
                                <div className="measure__heat-demand sub-measure">
                                  <Flame className="icon" size={20} />
                                  <span>
                                    <strong>
                                      Warmtebehoefte: {heatDemandValue}
                                    </strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* <h4 className="measure__section-title">
                          Aanschafkosten
                        </h4> */}
                          {priceResult.isValid &&
                          priceResult.calculations.length > 0 ? (
                            <div className="measure__breakdown">
                              {/* Material calculations */}
                              {priceResult.calculations.map(
                                (calc, calcIndex) => (
                                  <div
                                    key={`calc-${calcIndex}`}
                                    className="measure__breakdown-item"
                                  >
                                    <div className="measure__breakdown-name">
                                      {calc.name ||
                                        `Berekening ${calcIndex + 1}`}
                                      <span className="measure__breakdown-formula">
                                        ({calc.quantity.toFixed(2)} {calc.unit}{" "}
                                        × €{calc.unitPrice.toFixed(2)})
                                      </span>
                                    </div>
                                    <div className="measure__breakdown-price">
                                      € {formatPrice(calc.totalPrice)}
                                    </div>
                                  </div>
                                )
                              )}

                              {/* Labor costs - only shown if there are items with labor costs */}
                              {shouldCalculateLabor &&
                                laborDetails.length > 0 && (
                                  <>
                                    {laborDetails.map((labor, idx) => (
                                      <div
                                        key={`labor-${idx}`}
                                        className="measure__breakdown-item"
                                      >
                                        <div className="measure__breakdown-name">
                                          Arbeidskosten: {labor.name}
                                          <span className="measure__breakdown-formula">
                                            ({labor.quantity.toFixed(2)} ×
                                            {labor.norm} × €
                                            {settings.hourlyLaborCost})
                                          </span>
                                        </div>
                                        <div className="measure__breakdown-price">
                                          € {formatPrice(labor.cost)}
                                        </div>
                                      </div>
                                    ))}
                                    {laborDetails.length > 1 && (
                                      <div className="measure__breakdown-subtotal">
                                        <div>Totaal arbeidskosten</div>
                                        <div>€ {formatPrice(laborCost)}</div>
                                      </div>
                                    )}
                                  </>
                                )}

                              {/* Step 1: Add profit margin */}
                              {/* <div className="measure__breakdown-item subtotal">
                                <div className="measure__breakdown-name">
                                  AK + Winst + CAR + Garantie
                                  <span className="measure__breakdown-formula">
                                    (toeslag van {settings.profitPercentage}%)
                                  </span>
                                </div>
                                <div className="measure__breakdown-price">
                                  € {formatPrice(baseCost * profitMarginRate)}
                                </div>
                              </div> */}

                              {/* Step 2: Add VAT */}
                              {/* <div className="measure__breakdown-item">
                                <div className="measure__breakdown-name">
                                  BTW
                                  <span className="measure__breakdown-formula">
                                    ({settings.vatPercentage}%)
                                  </span>
                                </div>
                                <div className="measure__breakdown-price">
                                  € {formatPrice(withProfit * VAT_RATE)}
                                </div>
                              </div> */}

                              {/* Final total including VAT */}
                              <div className="measure__breakdown-total">
                                <div>
                                  <strong>
                                    Totaal eenmalige kosten (excl. BTW)
                                  </strong>
                                </div>
                                <div>
                                  <strong>€ {formatPrice(baseCost)}</strong>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="measure__breakdown-error">
                              {priceResult.errorMessage ||
                                "Prijs kan niet worden berekend"}
                            </div>
                          )}
                        </div>

                        {/* Maintenance calculation breakdown */}
                        {hasMaintenance && (
                          <div className="measure__section maintenance">
                            {/* <h4 className="measure__section-title">
                            Onderhoudskosten
                          </h4> */}
                            {maintenanceResult.isValid &&
                            maintenanceResult.calculations.length > 0 ? (
                              <div className="measure__breakdown">
                                {maintenanceResult.calculations.map(
                                  (calc, calcIndex) => {
                                    // Get the original maintenance job to display cycle info
                                    const mjob = measure.mjob_prices?.find(
                                      (j) => j.name === calc.name
                                    );

                                    // Calculate yearly cost for this specific job
                                    let yearlyJobCost = 0;
                                    if (mjob && mjob.cycle && mjob.cycle > 0) {
                                      // Calculate yearly cost by dividing single occurrence cost by cycle length
                                      yearlyJobCost =
                                        calc.totalPrice / mjob.cycle;
                                    }

                                    return (
                                      <div
                                        key={`maint-${calcIndex}`}
                                        className="measure__breakdown-item"
                                      >
                                        <div className="measure__breakdown-name">
                                          {calc.name ||
                                            `Onderhoud ${calcIndex + 1}`}
                                          <span className="measure__breakdown-formula">
                                            ({calc.quantity.toFixed(2)}{" "}
                                            {calc.unit} × €
                                            {calc.unitPrice.toFixed(2)})
                                          </span>
                                          {mjob && (
                                            <div className="measure__breakdown-details">
                                              <div className="measure__breakdown-price">
                                                € {formatPrice(calc.totalPrice)}{" "}
                                                elke {mjob.cycle} jaar
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        <span className="measure__breakdown-yearly-cost">
                                          € {formatPrice(yearlyJobCost)} p.j.
                                        </span>
                                      </div>
                                    );
                                  }
                                )}

                                {/* 40-year maintenance cost */}
                                <div className="measure__breakdown-yearly">
                                  <div>
                                    {" "}
                                    <strong>
                                      Gemmidelde onderhoudskosten per jaar{" "}
                                    </strong>
                                  </div>
                                  <div>
                                    {" "}
                                    <strong>
                                      € {formatPrice(perYear)} p.j
                                    </strong>
                                  </div>
                                </div>
                                <div className="measure__breakdown-total">
                                  <div>
                                    Totaal over {MAINTENANCE_PERIOD_YEARS} jaar
                                    ({settings.inflationPercentage}% inflatie
                                    p.j)
                                  </div>
                                  <div>€ {formatPrice(total40Years)}</div>
                                </div>

                                {/* Average yearly maintenance cost */}
                              </div>
                            ) : (
                              <div className="measure__breakdown-error">
                                {maintenanceResult.errorMessage ||
                                  "Onderhoudskosten kunnen niet worden berekend"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Add some CSS for the new warning elements */}
      <style jsx>{`
        .measure__warnings {
          background-color: #fff3e0;
          border-left: 3px solid #ff5f15;
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 4px;
        }

        .warning-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          color: #ff5f15;
          font-weight: bold;
        }

        .warning-header span {
          margin-left: 8px;
          font-weight: 600;
        }

        .warning-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .warning-item {
          margin-bottom: 6px;
          padding-left: 26px;
          position: relative;
          font-size: 15px;
          line-height: 1.4;
        }

        .warning-item:before {
          content: "•";
          position: absolute;
          left: 10px;
          color: #ff5f15;
        }

        .warning-item:last-child {
          margin-bottom: 0;
        }

        .price--warning {
          color: #ff5f15;
        }
      `}</style>
    </div>
  );
}
