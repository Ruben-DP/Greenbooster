import React from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";

type FormSection = {
  [key: string]: { value: number; period: string }[];
};

type FormData = {
  name: string;
  heat_demand: FormSection;
  nuisance: number;
  measure_prices: {
    name: string;
    calculation: Array<{
      type: "variable" | "operator";
      value: string;
      id?: string;
    }>;
    price: number;
    unit?: string;
  }[];
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

const DEFAULT_DATA = {
  heat_demand: createDefaultHeatDemand(),
  group: "",
  nuisance: 0,
  measure_prices: [
    {
      name: "",
      calculation: [
        { type: "variable" as const, value: "", id: "" },
        { type: "operator" as const, value: "+" },
        { type: "variable" as const, value: "", id: "" },
      ],
      price: 0,
      unit: "m2",
    },
  ],
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

  // Ensure we have a deep defensive approach to measure_prices
  const data: FormData = {
    name: item.name || "",
    group: item.group || DEFAULT_DATA.group,
    nuisance: item.nuisance || DEFAULT_DATA.nuisance,
    heat_demand: processHeatDemand(item.heat_demand),
    measure_prices:
      Array.isArray(item.measure_prices) && item.measure_prices.length > 0
        ? item.measure_prices.map((measure) => ({
            name: measure.name || "",
            calculation: Array.isArray(measure.calculation)
              ? measure.calculation.map((calc) => ({ ...calc }))
              : [{ type: "variable" as const, value: "", id: "" }],
            price: measure.price || 0,
            unit: measure.unit || "m2",
          }))
        : DEFAULT_DATA.measure_prices,
  };

  const handleAddMeasure = () => {
    // Ensure we create a complete new measure with properly initialized calculation array
    const newMeasure = {
      name: "",
      calculation: [{ type: "variable" as const, value: "", id: "" }],
      price: 0,
      unit: "m2",
    };

    // Create a safe copy of the current array before adding to it
    const updatedMeasures = Array.isArray(data.measure_prices)
      ? [...data.measure_prices, newMeasure]
      : [newMeasure];

    handleChange("measure_prices", data.measure_prices, updatedMeasures);
  };

  const handleAddFormula = (measureIndex: number) => {
    // Ensure the measure and its calculation property exist
    if (!data.measure_prices || !data.measure_prices[measureIndex]) {
      console.error("Cannot add formula to non-existent measure");
      return;
    }

    const measure = data.measure_prices[measureIndex];

    // Create a safe calculation array
    const currentCalculation = Array.isArray(measure.calculation)
      ? measure.calculation
      : [];

    const updatedCalculation = [
      ...currentCalculation,
      { type: "operator" as const, value: "+" },
      { type: "variable" as const, value: "", id: "" },
    ];

    // Create a safe copy of all measures before updating one of them
    const updatedMeasures = data.measure_prices.map((m, idx) =>
      idx === measureIndex ? { ...m, calculation: updatedCalculation } : m
    );

    handleChange("measure_prices", data.measure_prices, updatedMeasures);
  };

  console.log(data.measure_prices);

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
        <div className="form__grid">
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
        <h4 className="form__heading">Begroting</h4>
        <div className="form__measures">
          {Array.isArray(data.measure_prices) &&
            data.measure_prices.map((measure, idx) => (
              <div key={`price-${idx}`} className="form__card">
                <div className="card-title">
                  <TextField
                    label=""
                    value={getValue(
                      `measure_prices[${idx}].name`,
                      measure.name || ""
                    )}
                    type="text"
                    required={false}
                    isEditing={isEditing}
                    onChange={(next) =>
                      handleChange(
                        `measure_prices[${idx}].name`,
                        measure.name || "",
                        next
                      )
                    }
                  />
                </div>

                <div className="grouped-between">
                  <div className="form__calculation">
                    {Array.isArray(measure.calculation) ? (
                      measure.calculation.map((formula, valIdx) => (
                        <div
                          key={`calc-${idx}-${valIdx}`}
                          className="form__field"
                        >
                          {formula.type === "operator" ? (
                            <SelectField
                              label=""
                              value={String(
                                getValue(
                                  `measure_prices[${idx}].calculation[${valIdx}].value`,
                                  formula.value || ""
                                )
                              )}
                              options={["-", "+", "*", "/"]}
                              optionText="Kies rekenteken"
                              required={false}
                              isEditing={isEditing}
                              onChange={(next) =>
                                handleChange(
                                  `measure_prices[${idx}].calculation[${valIdx}].value`,
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
                                  `measure_prices[${idx}].calculation[${valIdx}].value`,
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
                                  `measure_prices[${idx}].calculation[${valIdx}]`,
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
                        onClick={() => handleAddFormula(idx)}
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
                          `measure_prices[${idx}].unit`,
                          measure.unit || "m2"
                        )
                      )}
                      options={UNIT_OPTIONS}
                      optionText="Kies eenheid"
                      required={false}
                      isEditing={isEditing}
                      onChange={(next) =>
                        handleChange(
                          `measure_prices[${idx}].unit`,
                          measure.unit || "m2",
                          next
                        )
                      }
                    />
                    <TextField
                      label="Eenheid prijs € "
                      value={String(
                        getValue(
                          `measure_prices[${idx}].price`,
                          measure.price || 0
                        )
                      )}
                      type="number"
                      required={false}
                      isEditing={isEditing}
                      onChange={(next) =>
                        handleChange(
                          `measure_prices[${idx}].price`,
                          measure.price || 0,
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
                onClick={handleAddMeasure}
              >
                Maatregel +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasureForm;