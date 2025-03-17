import React from "react";

interface Option {
  label: string;
  value: string;
  id?: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string, id?: string) => void;
  options?: Option[] | string[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  optionText?: string;
  dynamicOptions?: {
    collection: string;
    displayField: string;
    currentValue?: string;
  };
}

// Comprehensive list of calculation variables matching the calculation output
const CALCULATION_VARIABLES = [
  // Basic measurements (from woningSpecifiek)
  "breedte",
  "diepte",
  "gootHoogte",
  "nokHoogte",
  "aantalWoningen",
  "heeftPlatDak",
  "bouwlagen",
  "breedteComplex",
  "kopgevels",
  "portieken",
  
  // Gevel calculations
  "gevelOppervlakVoor",
  "gevelOppervlakAchter",
  "gevelOppervlakTotaal",
  "gevelOppervlakNetto",
  
  // Dak calculations
  "dakOppervlak",
  "dakOppervlakTotaal",
  "dakLengte",
  "dakLengteTotaal",
  "dakOverstekOppervlak",
  "dakTotaalMetOverhang",
  
  // Vloer calculations
  "vloerOppervlak",
  "vloerOppervlakTotaal",
  
  // Kozijn measurements
  "kozijnOppervlakVoorTotaal",
  "kozijnOppervlakAchterTotaal",
  "kozijnOppervlakTotaal",
  "kozijnRendementTotaal",
  "kozijnOmtrekTotaal",
  
  // Project totals
  "projectGevelOppervlak",
  "projectKozijnenOppervlak",
  "projectDakOppervlak",
  "projectOmtrek",
  
  // Backward compatibility with old variable names
  "AantalWoningen",
  "Dakoppervlak",
  "LengteDakvlak",
  "BreedteWoning",
  "NettoGevelOppervlak",
  "Hoogte",
  "VensterbankLengte",
  "VloerOppervlakteBeganeGrond",
  "OmtrekKozijnen",
  
  // Common constants
  "0.3",
  "2",
  "3",
  "0.05",
];

export function SelectField({
  label,
  value,
  onChange,
  options: providedOptions,
  required,
  disabled,
  isEditing,
  optionText,
  dynamicOptions,
}: SelectFieldProps) {
  
  // Convert the static variables into option objects
  const staticOptions = CALCULATION_VARIABLES.map(variable => ({
    label: variable,
    value: variable,
    id: variable, // Using the variable name as the ID for simplicity
  }));
  
  // Use provided options if available, otherwise use static variables
  const finalOptions = providedOptions
    ? Array.isArray(providedOptions)
      ? providedOptions.map((opt) =>
          typeof opt === "string" ? { label: opt, value: opt } : opt
        )
      : []
    : staticOptions;

  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => {
            const selectedOption = finalOptions.find(
              (opt) => opt.value === e.target.value
            );
            onChange(e.target.value, selectedOption?.id);
          }}
          className="input-base"
          required={required}
          disabled={disabled}
        >
          <option value="">{optionText || "Select an option"}</option>
          {finalOptions.map((option) => (
            <option key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="input-read-only">
          {value || <span className="empty-reference">-</span>}
        </div>
      )}
    </div>
  );
}