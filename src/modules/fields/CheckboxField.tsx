// CheckboxField.tsx
import React from "react";

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
}

export function CheckboxField({
  label,
  value = false,
  onChange,
  required = false,
  disabled,
  isEditing,
}: CheckboxFieldProps) {
  return (
    <div className="form-field">
      {isEditing ? (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="checkbox-input"
          />
          <span className="checkbox-text">{label}</span>
          {required && <span className="required-mark"> *</span>}
        </label>
      ) : (
        <div className="checkbox-read-only">
          <span className="checkbox-label">{label}</span>
          <span className="checkbox-value">
            {value ? "Ja" : "Nee"}
          </span>
        </div>
      )}
    </div>
  );
}