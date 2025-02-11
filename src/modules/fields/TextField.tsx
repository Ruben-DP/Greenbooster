// TextField.tsx
import React from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number" | "tel";
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
}

export function TextField({
  label,
  value = "",
  onChange,
  type = "text",
  required = false,
  disabled,
  isEditing,
}: TextFieldProps) {
  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark"> *</span>}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          className="input-base"
          required={required}
          disabled={disabled}
          autoFocus={isEditing}
        />
      ) : (
        <div className="input-read-only">
          {value || <span className="empty-reference">-</span>}
        </div>
      )}
    </div>
  );
}