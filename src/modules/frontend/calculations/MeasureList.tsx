"use client";

import { useMeasureData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { getHeatDemandValue } from "./heat-demand";
import { calculateMeasurePrice } from "./price.calculator";
import { Flame, Volume1 } from "lucide-react";

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
}

// Constants
const MAINTENANCE_PERIOD_YEARS = 40; // Period for calculation in years

export default function MeasureList({
  residenceData,
  onSelectMeasure,
  buildPeriod,
  residenceType,
}: MeasureListProps) {
  const { searchItems, items, isLoading, error } = useMeasureData();
  const [selectedResidence, setSelectedResidence] = useState<Record<
    string,
    any
  > | null>(null);
  const [expandedMeasure, setExpandedMeasure] = useState<string | null>(null);

  // console.log(residenceType);

  // Load measures when component mounts
  useEffect(() => {
    searchItems("");
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
      const jobCost = calculation.totalPrice;

      // Calculate how many times this job occurs in 40 years
      // cycleStart and cycle are now in years, not months
      const cycleStart = job.cycleStart || 0;
      const cycle = job.cycle || 1; // Default to yearly if not specified

      if (cycleStart >= MAINTENANCE_PERIOD_YEARS) {
        // Job doesn't start within our 40-year window
        return;
      }

      // Calculate occurrences
      let occurrences = 0;
      if (cycle <= 0) {
        // Avoid division by zero
        occurrences = 0;
      } else if (cycleStart <= 0) {
        // Job starts immediately
        occurrences = Math.floor(MAINTENANCE_PERIOD_YEARS / cycle);
      } else {
        // Job starts after some years
        const remainingYears = MAINTENANCE_PERIOD_YEARS - cycleStart;
        occurrences =
          remainingYears > 0 ? Math.floor(remainingYears / cycle) + 1 : 0;
      }

      // Add to total
      total40Years += jobCost * occurrences;
    });

    // Calculate yearly average
    const perYear = total40Years / MAINTENANCE_PERIOD_YEARS;

    return { total40Years, perYear };
  };

  // Handle adding a measure to the selection
  const handleAddMeasure = (measure: Measure) => {
    // Get the heat demand value for this measure
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

    // Add price, maintenance price, and heat demand value to measure object before passing it up
    const measureWithPrice = {
      ...measure,
      price: priceData.isValid ? priceData.price : undefined,
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

    // Pass the enriched measure to the parent component
    onSelectMeasure(measureWithPrice);
  };

  // Toggle the expanded state of a measure
  const toggleAccordion = (measureName: string) => {
    setExpandedMeasure(expandedMeasure === measureName ? null : measureName);
  };

  // Render loading or error states
  if (isLoading) return <div>Maatregelen laden...</div>;
  if (error) return <div>Fout bij laden maatregelen: {error}</div>;
  if (!items || items.length === 0) return <div>Geen maatregelen gevonden</div>;

  // Group measures by their group property
  const groupedItems = items.reduce<GroupedMeasures>((groups, item) => {
    if (!item) return groups;
    const groupName = item.group || "Overig";
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(item as Measure);
    return groups;
  }, {});

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Render the measure list
  return (
    <div className="measure-list tile">
      {Object.entries(groupedItems).map(([groupName, groupItems]) => (
        <div key={groupName} className="measure-group">
          <h2 className="measure-group-title">{groupName}</h2>
          <div className="measure">
            {groupItems.map((measure, index) => {
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
                ? calculateMeasurePrice(measure.mjob_prices, selectedResidence)
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

              // Check if measure has any maintenance jobs
              const hasMaintenance =
                measure.mjob_prices &&
                Array.isArray(measure.mjob_prices) &&
                measure.mjob_prices.length > 0 &&
                measure.mjob_prices.some((job) => job.name);

              return (
                <div key={`${measure.name}-${index}`} className="measure__item">
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
                      </div>

                      {/* Price display and add button */}
                      <div className="measure__actions">
                        {selectedResidence ? (
                          priceResult.isValid ? (
                            <div className="price">
                              € {formatPrice(priceResult.price)}
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
                          className="measure__add"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMeasure(measure);
                          }}
                          title="Toevoegen aan geselecteerde maatregelen"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable details section */}
                  {isExpanded && (
                    <div className="measure__details">
                      {/* Price calculation breakdown */}
                      <div className="measure__section">
                        {(measure.nuisance || heatDemandValue > 0) && (
                          <div className="additional-info">
                            {measure.nuisance && (
                              <div className="measure__nuisance sub-measure">
                                <Volume1 className="icon" size={20}/>
                                <span>
                                  Hinder indicator:{" "}
                                  <strong>{measure.nuisance}</strong>{" "}
                                </span>
                              </div>
                            )}
                            {heatDemandValue > 0 && (
                              <div className="measure__heat-demand sub-measure">
                                <Flame className="icon" size={20}/>
                                <span>
                                  Warmtebehoefte:{" "}
                                  <strong>{heatDemandValue} kWh/m²</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <h4 className="measure__section-title">
                          Aanschafkosten
                        </h4>
                        {priceResult.isValid &&
                        priceResult.calculations.length > 0 ? (
                          <div className="measure__breakdown">
                            {priceResult.calculations.map((calc, calcIndex) => (
                              <div
                                key={`calc-${calcIndex}`}
                                className="measure__breakdown-item"
                              >
                                <div className="measure__breakdown-name">
                                  {calc.name || `Berekening ${calcIndex + 1}`}
                                  <span className="measure__breakdown-formula">
                                    ({calc.quantity.toFixed(2)} {calc.unit} × €
                                    {calc.unitPrice.toFixed(2)})
                                  </span>
                                </div>
                                <div className="measure__breakdown-price">
                                  € {formatPrice(calc.totalPrice)}
                                </div>
                              </div>
                            ))}
                            <div className="measure__breakdown-total">
                              <div>
                                <strong>Totaal aanschafkosten</strong>
                              </div>
                              <div>
                                <strong>
                                  € {formatPrice(priceResult.price)}
                                </strong>
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
                          <h4 className="measure__section-title">
                            Onderhoudskosten
                          </h4>
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

                              {/* Single occurrence total - REMOVED */}
                              {/* <div className="measure__breakdown-subtotal">
                                <div>Kosten per keer</div>
                                <div>
                                  € {formatPrice(maintenanceResult.price)}
                                </div>
                              </div> */}

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
                                  <strong>€ {formatPrice(perYear)} p.j</strong>
                                </div>
                              </div>
                              <div className="measure__breakdown-total">
                                <div>
                                  Totaal over {MAINTENANCE_PERIOD_YEARS} jaar
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
    </div>
  );
}
