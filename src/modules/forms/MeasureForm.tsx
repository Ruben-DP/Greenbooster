import React from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { SearchSelect } from "../fields/SearchSelect";

type FormSection = {
  [key: string]: { value: number }[];
};

type FormData = {
  name: string;
  heat_demand: FormSection;
  measure_prices: {
    name: string;
    calculation: Array<{
      type: "variable" | "operator";
      value: string;
      id?: string;
    }>;
  }[];
};

type Props = {
  item: Partial<FormData>;
  isEditing: boolean;
  pendingChanges: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

const DEFAULT_DATA = {
  heat_demand: {
    portiek: Array(5).fill({ value: 0 }),
    gallerij: Array(5).fill({ value: 0 }),
    grondgebonden: Array(5).fill({ value: 0 }),
  },
  measure_prices: [
    {
      name: "",
      calculation: [
        { type: "variable" as const, value: "", id: "" },
        { type: "operator" as const, value: "+" },
        { type: "variable" as const, value: "", id: "" },
      ],
    },
  ],
} satisfies Partial<FormData>;


const MeasureForm = ({ item, isEditing, pendingChanges, onChange }: Props) => {
  if (!item) return null;

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  const data: FormData = {
    name: item.name || "",
    heat_demand: item.heat_demand || DEFAULT_DATA.heat_demand,
    measure_prices: item.measure_prices || DEFAULT_DATA.measure_prices,
  };

  const handleAddMeasure = () => {
    const newMeasure = {
      name: "",
      calculation: [{ type: "variable", value: "", id: "" }],
    };

    handleChange("measure_prices", data.measure_prices, [
      ...data.measure_prices,
      newMeasure,
    ]);
  };

  const handleAddFormula = (measureIndex: number) => {
    const updatedCalculation = [
      ...data.measure_prices[measureIndex].calculation,
      { type: "operator", value: "+" },
      { type: "variable", value: "", id: "" },
    ];

    const updatedMeasures = data.measure_prices.map((measure, idx) =>
      idx === measureIndex
        ? { ...measure, calculation: updatedCalculation }
        : measure
    );

    handleChange("measure_prices", data.measure_prices, updatedMeasures);
  };

  return (
    <div className="form">
      <div className="form__section">
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

        <h4 className="form__heading">Warmtebehoefte</h4>
        <div className="form__grid">
          {Object.entries(data.heat_demand).map(([key, values]) => (
            <div key={key} className="form__card">
              <h5 className="form__subheading">{key}</h5>
              <div className="form__fields">
                {values.map((entry, idx) => (
                  <TextField
                    key={`${key}-${idx}`}
                    label={`Period ${idx + 1}`}
                    value={String(
                      getValue(`heat_demand.${key}[${idx}].value`, entry.value)
                    )}
                    type="number"
                    required={true}
                    isEditing={isEditing}
                    onChange={(next) =>
                      handleChange(
                        `heat_demand.${key}[${idx}].value`,
                        entry.value,
                        next
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <h4 className="form__heading">Prijs berekening</h4>
        <div className="form__measures">
          {data.measure_prices.map((measure, idx) => (
            <div key={`price-${idx}`} className="form__card">
              <TextField
                label="Maatregel"
                value={getValue(`measure_prices[${idx}].name`, measure.name)}
                type="text"
                required={false}
                isEditing={isEditing}
                onChange={(next) =>
                  handleChange(
                    `measure_prices[${idx}].name`,
                    measure.name,
                    next
                  )
                }
              />

              <h5 className="form__subheading">Berekening</h5>
              <div className="form__calculation">
                {measure.calculation.map((formula, valIdx) => (
                  <div key={`calc-${idx}-${valIdx}`} className="form__field">
                    {formula.type === "operator" ? (
                      <SelectField
                        label=""
                        value={String(
                          getValue(
                            `measure_prices[${idx}].calculation[${valIdx}].value`,
                            formula.value
                          )
                        )}
                        options={["-", "+", "*", "/"]}
                        optionText="Kies rekenteken"
                        required={false}
                        isEditing={isEditing}
                        onChange={(next) =>
                          handleChange(
                            `measure_prices[${idx}].calculation[${valIdx}].value`,
                            formula.value,
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
                            formula.value
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
                            { ...formula, value, id }
                          )
                        }
                      />
                      // work in progress
                      // <SearchSelect
                      //   label="Variabele"
                      //   value={String(
                      //     getValue(
                      //       `measure_prices[${idx}].calculation[${valIdx}].value`,
                      //       formula.value
                      //     )
                      //   )}
                      //   dynamicOptions={{
                      //     collection: "variables",
                      //     displayField: "variableName",
                      //     referenceFields: ["calculation", "type"],
                      //   }}
                      //   placeholder="Zoek een variabele..."
                      //   required={false}
                      //   isEditing={isEditing}
                      //   onChange={(value, id, referenceData) =>
                      //     handleChange(
                      //       `measure_prices[${idx}].calculation[${valIdx}]`,
                      //       formula,
                      //       {
                      //         ...formula,
                      //         value,
                      //         id,
                      //         relatedCalculation: referenceData?.calculation,
                      //         variableType: referenceData?.type,
                      //       }
                      //     )
                      //   }
                      // />
                    )}
                  </div>
                ))}
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
