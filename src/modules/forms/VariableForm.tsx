import React, { useEffect, useState } from "react";
import { SelectField } from "../fields/SelectField";
import { useVariableData } from "@/contexts/DataContext";
import { TextField } from "../fields/TextField";


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

// exact name of the variable as stored by the frontend form
const STATIC_VARIABLES = ["aantalWoningen", "dakOppvervlak"];

const VariableForm = ({ item, isEditing, pendingChanges, onChange }: Props) => {
  const { items } = useVariableData();
  const [allVariables, setAllVariables] = useState<string[]>([]);

  useEffect(() => {
    const existingVariables = items.map((item: any) => item.variableName);
    // Filter out current variable to prevent self-reference
    const filteredVariables = existingVariables.filter(v => v !== item.variableName);
    setAllVariables([...STATIC_VARIABLES, ...filteredVariables]);
  }, [items]);

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
                  options={allVariables}
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