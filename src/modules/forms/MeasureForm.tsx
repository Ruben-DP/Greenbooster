import React from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { Trash2 } from "lucide-react"; // Import the Trash2 icon from lucide-react

type FormSection = {
  [key: string]: { value: number; period: string }[];
};

type MeasurePriceItem = {
  name: string;
  calculation: Array<{
    type: "variable" | "operator";
    value: string;
    id?: string;
  }>;
  price: number;
  unit?: string;
};

type MaintenancePriceItem = MeasurePriceItem & {
  cycleStart: number;
  cycle: number;
};

type FormData = {
  name: string;
  heat_demand: FormSection;
  nuisance: number;
  measure_prices: MeasurePriceItem[];
  mjob_prices: MaintenancePriceItem[];
  group: string;
};

type Props = {
  item: Partial<FormData>;
  isEditing: boolean;
  pendingChanges: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

const PERIOD_LABELS = {
  0: "tot 1965",
  1: "1965-1974",
  2: "1975-1982",
  3: "1983-1987",
  4: "1988-1991",
} as const;

// Create DEFAULT_DATA with periods included
const createDefaultHeatDemand = () => {
  const sections = ["portiek", "gallerij", "grondgebonden"];
  const periodsData: FormSection = {};

  sections.forEach((section) => {
    periodsData[section] = Array(5)
      .fill(0)
      .map((_, idx) => ({
        value: 0,
        period: PERIOD_LABELS[idx as keyof typeof PERIOD_LABELS],
      }));
  });

  return periodsData;
};

// Default empty price item
const createDefaultPriceItem = (): MeasurePriceItem => ({
  name: "",
  calculation: [
    { type: "variable" as const, value: "", id: "" },
    { type: "operator" as const, value: "+" },
    { type: "variable" as const, value: "", id: "" },
  ],
  price: 0,
  unit: "m2",
});

  // Default empty maintenance job price item
const createDefaultMaintenanceItem = (): MaintenancePriceItem => ({
  ...createDefaultPriceItem(),
  cycleStart: 0,
  cycle: 1, // Default to yearly cycle (1 year)
});

const DEFAULT_DATA = {
  heat_demand: createDefaultHeatDemand(),
  group: "",
  nuisance: 0,
  measure_prices: [],
  mjob_prices: [],
} satisfies Partial<FormData>;

const UNIT_OPTIONS = ["m2", "m1", "stuk", "per stuk", "woning"];

const MeasureForm = ({ item, isEditing, pendingChanges, onChange }: Props) => {
  if (!item) return null;

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  // Process incoming data to ensure it has the correct structure
  const processHeatDemand = (inputHeatDemand: any): FormSection => {
    if (!inputHeatDemand) return DEFAULT_DATA.heat_demand;

    const processed: FormSection = {};
    const sections = ["portiek", "gallerij", "grondgebonden"];

    sections.forEach((section) => {
      // Start with default data for this section
      processed[section] = DEFAULT_DATA.heat_demand[section];

      // Override with actual data if it exists
      if (inputHeatDemand && inputHeatDemand[section]) {
        processed[section] = Array.isArray(inputHeatDemand[section])
          ? inputHeatDemand[section].map((entry: any, idx: number) => ({
              value: entry.value || 0,
              period:
                entry.period ||
                PERIOD_LABELS[idx as keyof typeof PERIOD_LABELS],
            }))
          : processed[section];
      }
    });

    return processed;
  };

  // Helper function to process measure price items
  const processMeasurePriceItems = (items: any[] | undefined): MeasurePriceItem[] => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      name: item.name || "",
      calculation: Array.isArray(item.calculation)
        ? item.calculation.map((calc: any) => ({ ...calc }))
        : [{ type: "variable" as const, value: "", id: "" }],
      price: item.price || 0,
      unit: item.unit || "m2",
    }));
  };

  // Helper function to process maintenance job price items
  const processMaintenanceItems = (items: any[] | undefined): MaintenancePriceItem[] => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      name: item.name || "",
      calculation: Array.isArray(item.calculation)
        ? item.calculation.map((calc: any) => ({ ...calc }))
        : [{ type: "variable" as const, value: "", id: "" }],
      price: item.price || 0,
      unit: item.unit || "m2",
      cycleStart: item.cycleStart || 0,
      cycle: item.cycle || 1,
    }));
  };

  // Ensure we have a deep defensive approach to measure_prices and mjob_prices
  const data: FormData = {
    name: item.name || "",
    group: item.group || DEFAULT_DATA.group,
    nuisance: item.nuisance || DEFAULT_DATA.nuisance,
    heat_demand: processHeatDemand(item.heat_demand),
    measure_prices: processMeasurePriceItems(item.measure_prices),
    mjob_prices: processMaintenanceItems(item.mjob_prices),
  };

  // Generic function to handle adding a new price item to either measure_prices or mjob_prices
  const handleAddPriceItem = (priceType: "measure_prices" | "mjob_prices") => {
    const newItem = priceType === "measure_prices" 
      ? createDefaultPriceItem()
      : createDefaultMaintenanceItem();
    const currentItems = data[priceType];
    const updatedItems = [...currentItems, newItem];
    handleChange(priceType, currentItems, updatedItems);
  };

  // Function to handle removing a price item
  const handleRemovePriceItem = (priceType: "measure_prices" | "mjob_prices", itemIndex: number) => {
    // Get current items
    const currentItems = data[priceType];
    
    // Create updated array without the item to remove
    const updatedItems = currentItems.filter((_, idx) => idx !== itemIndex);
    
    // Update the state
    handleChange(priceType, currentItems, updatedItems);
  };

  // Generic function to handle adding a formula to a price item
  const handleAddFormula = (
    priceType: "measure_prices" | "mjob_prices",
    itemIndex: number
  ) => {
    // Ensure the measure and its calculation property exist
    if (!data[priceType] || !data[priceType][itemIndex]) {
      console.error(`Cannot add formula to non-existent ${priceType} item`);
      return;
    }

    const item = data[priceType][itemIndex];

    // Create a safe calculation array
    const currentCalculation = Array.isArray(item.calculation)
      ? item.calculation
      : [];

    const updatedCalculation = [
      ...currentCalculation,
      { type: "operator" as const, value: "+" },
      { type: "variable" as const, value: "", id: "" },
    ];

    // Create a safe copy of all items before updating one of them
    const updatedItems = data[priceType].map((m, idx) =>
      idx === itemIndex ? { ...m, calculation: updatedCalculation } : m
    );

    handleChange(priceType, data[priceType], updatedItems);
  };

  // Render a price section (used for both Begroting and Onderhoudskosten)
  const renderPriceSection = (
    title: string,
    priceType: "measure_prices" | "mjob_prices"
  ) => (
    <>
      <h4 className="form__heading">{title}</h4>
      <div className="form__measures">
        {Array.isArray(data[priceType]) &&
          data[priceType].map((item, idx) => (
            <div key={`${priceType}-${idx}`} className="form__card">
              <div className="card-title">
                <TextField
                  label=""
                  value={getValue(
                    `${priceType}[${idx}].name`,
                    item.name || ""
                  )}
                  type="text"
                  required={false}
                  isEditing={isEditing}
                  onChange={(next) =>
                    handleChange(
                      `${priceType}[${idx}].name`,
                      item.name || "",
                      next
                    )
                  }
                />
                {isEditing && (
                  <button
                    type="button"
                    className="button button--icon button--remove"
                    onClick={() => handleRemovePriceItem(priceType, idx)}
                    title="Verwijderen"
                  >
                    <Trash2 size={18} color="red"/>
                  </button>
                )}
              </div>

              <div className="grouped">
                <div className="form__calculation">
                  {Array.isArray(item.calculation) ? (
                    item.calculation.map((formula, valIdx) => (
                      <div
                        key={`calc-${priceType}-${idx}-${valIdx}`}
                        className="form__field"
                      >
                        {formula.type === "operator" ? (
                          <SelectField
                            label=""
                            value={String(
                              getValue(
                                `${priceType}[${idx}].calculation[${valIdx}].value`,
                                formula.value || ""
                              )
                            )}
                            options={["-", "+", "*", "/"]}
                            optionText="Kies rekenteken"
                            required={false}
                            isEditing={isEditing}
                            onChange={(next) =>
                              handleChange(
                                `${priceType}[${idx}].calculation[${valIdx}].value`,
                                formula.value || "",
                                next
                              )
                            }
                          />
                        ) : (
                          <SelectField
                            label="Variabele"
                            value={String(
                              getValue(
                                `${priceType}[${idx}].calculation[${valIdx}].value`,
                                formula.value || ""
                              )
                            )}
                            dynamicOptions={{
                              collection: "variables",
                              displayField: "variableName",
                            }}
                            optionText="Kies variabele"
                            required={false}
                            isEditing={isEditing}
                            onChange={(value, id) =>
                              handleChange(
                                `${priceType}[${idx}].calculation[${valIdx}]`,
                                formula,
                                {
                                  ...formula,
                                  value: value || "",
                                  id: id || "",
                                }
                              )
                            }
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div>No calculation data available</div>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      className="button button--icon"
                      onClick={() => handleAddFormula(priceType, idx)}
                    >
                      +
                    </button>
                  )}
                </div>

                <div className="form__price">
                  <SelectField
                    label="Eenheid"
                    value={String(
                      getValue(
                        `${priceType}[${idx}].unit`,
                        item.unit || "m2"
                      )
                    )}
                    options={UNIT_OPTIONS}
                    optionText="Kies eenheid"
                    required={false}
                    isEditing={isEditing}
                    onChange={(next) =>
                      handleChange(
                        `${priceType}[${idx}].unit`,
                        item.unit || "m2",
                        next
                      )
                    }
                  />
                  {priceType === "mjob_prices" && (
                    <>
                      <TextField
                        label="Start cyclus (jaar)"
                        value={String(
                          getValue(
                            `${priceType}[${idx}].cycleStart`,
                            (item as MaintenancePriceItem).cycleStart || 0
                          )
                        )}
                        type="number"
                        required={false}
                        isEditing={isEditing}
                        onChange={(next) =>
                          handleChange(
                            `${priceType}[${idx}].cycleStart`,
                            (item as MaintenancePriceItem).cycleStart || 0,
                            Number(next)
                          )
                        }
                      />
                      <TextField
                        label="Cyclus (elk .. jaar)"
                        value={String(
                          getValue(
                            `${priceType}[${idx}].cycle`,
                            (item as MaintenancePriceItem).cycle || 1
                          )
                        )}
                        type="number"
                        required={false}
                        isEditing={isEditing}
                        onChange={(next) =>
                          handleChange(
                            `${priceType}[${idx}].cycle`,
                            (item as MaintenancePriceItem).cycle || 1,
                            Number(next)
                          )
                        }
                      />
                    </>
                  )}
                  <TextField
                    label="Prijs € "
                    value={String(
                      getValue(
                        `${priceType}[${idx}].price`,
                        item.price || 0
                      )
                    )}
                    type="number"
                    required={false}
                    isEditing={isEditing}
                    onChange={(next) =>
                      handleChange(
                        `${priceType}[${idx}].price`,
                        item.price || 0,
                        Number(next)
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        {isEditing && (
          <div className="button-container">
            <button
              type="button"
              className="button"
              onClick={() => handleAddPriceItem(priceType)}
            >
              {priceType === "measure_prices" ? "Maatregel +" : "Onderhoud +"}
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="form">
      <div className="form__section ">
        <div className="title">
          <TextField
            label="Naam"
            value={getValue("name", data.name)}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("name", getValue("name", data.name), next)
            }
          />
          <TextField
            label="Groep"
            value={getValue("group", data.group)}
            type="text"
            required={false}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("group", getValue("group", data.group), next)
            }
          />
        </div>

        <h4 className="form__heading">Warmtebehoefte</h4>
        <div className="form__grid">
          {Object.entries(data.heat_demand).map(([key, values]) => (
            <div key={key} className="form__card">
              <h5 className="form__subheading">{key}</h5>
              <div className="form__fields">
                {Array.isArray(values) &&
                  values.map((entry, idx) => (
                    <TextField
                      key={`${key}-${idx}`}
                      label={entry.period}
                      value={String(
                        getValue(
                          `heat_demand.${key}[${idx}].value`,
                          entry.value
                        )
                      )}
                      type="number"
                      required={true}
                      isEditing={isEditing}
                      onChange={(next) => {
                        // When changing the value, preserve the period and structure
                        const updatedEntry = {
                          ...entry,
                          value: next,
                        };

                        // Create a new updatedHeatDemand object that preserves all sections
                        const updatedHeatDemand = { ...data.heat_demand };

                        // Only update the specific value that changed
                        updatedHeatDemand[key] = [...updatedHeatDemand[key]];
                        updatedHeatDemand[key][idx] = updatedEntry;

                        // Update the entire heat_demand object
                        handleChange(
                          "heat_demand",
                          data.heat_demand,
                          updatedHeatDemand
                        );
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
        <h4 className="form__heading">Hinderindicator</h4>
        <div className="form__grid nuisance-indicator">
          <TextField
            label="Hinder indicator"
            value={String(getValue("nuisance", data.nuisance || 0))}
            type="number"
            required={false}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("nuisance", getValue("nuisance", data.nuisance || 0), Number(next))
            }
          />
        </div>
        
        {/* Render the Begroting section */}
        {renderPriceSection("Begroting", "measure_prices")}
        
        {/* Render the Onderhoudskosten section */}
        {renderPriceSection("Onderhoudskosten", "mjob_prices")}
      </div>
    </div>
  );
};

export default MeasureForm;