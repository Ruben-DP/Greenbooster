"use client";

import { useMeasureData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { getHeatDemandValue } from "./heat-demand";
import { calculateMeasurePrice } from "./price.calculator";

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

interface Measure {
  name: string;
  group?: string;
  measure_prices?: MeasurePrice[];
  price?: number;
  priceCalculations?: any[];
  calculationError?: string;
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

    // Add price and heat demand value to measure object before passing it up
    const measureWithPrice = {
      ...measure,
      price: priceData.isValid ? priceData.price : undefined,
      priceCalculations: priceData.calculations,
      calculationError: !priceData.isValid ? priceData.errorMessage : undefined,
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

              const heatDemandValue = getHeatDemandValue(
                measure,
                residenceType,
                buildPeriod
              );

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
                              €{" "}
                              {priceResult.price.toLocaleString("nl-NL", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
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
                                €{" "}
                                {calc.totalPrice.toLocaleString("nl-NL", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          ))}
                          <div className="measure__breakdown-total">
                            <div>Totaal</div>
                            <div>
                              €{" "}
                              {priceResult.price.toLocaleString("nl-NL", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="measure__breakdown-error">
                          {priceResult.errorMessage ||
                            "Prijs kan niet worden berekend"}
                        </div>
                      )}
                      <span>Hinder indicator: {measure.nuisance} </span>
                      {/* Heat demand value display */}
                      {heatDemandValue > 0 && (
                        <div className="measure__heat-demand">
                          <strong>Warmtebehoefte:</strong> {heatDemandValue}{" "}
                          kWh/m²
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
