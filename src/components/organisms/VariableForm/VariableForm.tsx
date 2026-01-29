import React from "react";
import { SelectField, TextField } from "@/components/atoms";

type FormData = {
  variableName: string;
  calculation: Array<{
    type: "variable" | "operator";
    value: string;
  }>;
};

type Props = {
  item: Partial<FormData>;
  isEditing: boolean;
  pendingChanges: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

const DEFAULT_DATA = {
  variableName: "",
  calculation: [
    { type: "variable" as const, value: "" },
    { type: "operator" as const, value: "+" },
    { type: "variable" as const, value: "" },
  ],
};

// All available variables
const AVAILABLE_VARIABLES = [
  "aantalWoningen",
  "dakOppvervlak",
  // Add more variables here as needed
];

const VariableForm = ({ item, isEditing, pendingChanges, onChange }: Props) => {
  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  const data: FormData = {
    variableName: item.variableName || "",
    calculation: item.calculation || DEFAULT_DATA.calculation,
  };

  const handleAddFormula = () => {
    const updatedCalculation = [
      ...data.calculation,
      { type: "operator", value: "+" },
      { type: "variable", value: "" },
    ];

    handleChange("calculation", data.calculation, updatedCalculation);
  };

  // Filter out the current variable to prevent self-reference
  const availableVariables = AVAILABLE_VARIABLES.filter(v => v !== data.variableName);

  return (
    <div className="form">
      <div className="form__section">
        <TextField
          label="Variabele"
          value={getValue("variableName", data.variableName)}
          type="text"
          required={true}
          isEditing={isEditing}
          onChange={(next) =>
            handleChange("variableName", data.variableName, next)
          }
        />

        <div className="form__calculation">
          {data.calculation.map((formula, idx) => (
            <div key={`calc-${idx}`} className="form__field">
              {formula.type === "operator" ? (
                <SelectField
                  label=""
                  value={String(getValue(`calculation[${idx}].value`, formula.value))}
                  options={["-", "+", "*", "/"]}
                  optionText="Kies rekenteken"
                  required={false}
                  isEditing={isEditing}
                  onChange={(next) => handleChange(`calculation[${idx}].value`, formula.value, next)}
                />
              ) : (
                <SelectField
                  label="Variabele"
                  value={String(getValue(`calculation[${idx}].value`, formula.value))}
                  options={availableVariables}
                  optionText="Kies variabele"
                  required={false}
                  isEditing={isEditing}
                  onChange={(next) => handleChange(`calculation[${idx}].value`, formula.value, next)}
                />
              )}
            </div>
          ))}
          {isEditing && (
            <button type="button" className="button button--icon" onClick={handleAddFormula}>
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariableForm;
