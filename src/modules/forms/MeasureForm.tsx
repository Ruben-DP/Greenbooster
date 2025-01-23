import React from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";

type FormSection = {
  heating: { value: number }[];
  cooling: { value: number }[];
};

type FormData = {
  name: string;
  heat_demand: FormSection;
  measure_prices: {
    name: string;
    calculation: { type: "variable" | "operator"; value: string }[];
  }[];
};

type Props = {
  item: Partial<FormData>;
  isEditing: boolean;
  pendingChanges: Record<string, any>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

const DEFAULT_DATA = {
  heat_demand: {
    portiek: Array(4).fill({ value: 0 }),
    gallerij: Array(4).fill({ value: 0 }),
    grondgebonden: Array(4).fill({ value: 0 }),
  },
  measure_prices: [
    {
      name: "",
      calculation: [
        { type: "variable", value: "" },
        { type: "operator", value: "+" },
        { type: "variable", value: "" },
      ],
    },
  ],
};

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

  return (
    <div className="detail-form">
      <div className="detail-form__section">

        {/* Maatregel naam */}
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

        <div className="detail-form__group-header">Warmtebehoefte</div>
        <div className="heat-demand">
          {Object.entries(data.heat_demand).map(([key, values]) => (
            <div key={key} className="detail-form__group">
              <div className="detail-form__subheading">{key}</div>
              <div className="detail-form__group-content">
                {values.map((entry, idx) => (
                  <div key={`${key}-${idx}`} className="detail-form__field">
                    <TextField
                      label={`Period ${idx + 1}`}
                      value={String(
                        getValue(
                          `heat_demand.${key}[${idx}].value`,
                          entry.value
                        )
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="detail-form__group-header">Prijs berekening</div>
        <div className="detail-form__group has-subgroups">
          {data.measure_prices.map((measure, idx) => (
            <div key={`price-${idx}`} className="has-subgroups">
              <div className="detail-form__subheading">
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
              </div>
              <div>
                <strong>Berekening</strong>
              </div>
              <div className="detail-form__calculation">
                {measure.calculation.map((formula, valIdx) => (
                  <div
                    key={`calc-${idx}-${valIdx}`}
                    className="detail-form__field"
                  >
                    {formula.type}
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
                        optionText="Select an operator"
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
                      <TextField
                        label="Variable"
                        value={String(
                          getValue(
                            `measure_prices[${idx}].calculation[${valIdx}].value`,
                            formula.value
                          )
                        )}
                        type="text"
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeasureForm;
