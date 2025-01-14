import React from "react";
import TextField from "../fields/TextField";
import SelectField from "../fields/SelectField";

interface BaseField {
  label: string;
  value: string | number;
  required: boolean;
  type: string;
  path?: string;
  dropdownFields?: string[];
}

interface FormFields {
  id: {
    type: "hidden";
    value: string;
  };
  name: BaseField;
  measure_prices: {
    [key: string]: {
      [key: string]: any;
    };
  };
  heat_demand: {
    [key: string]: Array<{ value: BaseField }>;
  };
}

interface DetailFormProps {
  fields: FormFields;
  isEditing: boolean;
  onChange: (path: string, oldValue: string | number, newValue: string) => void;
}

export default function DetailForm({
  fields,
  isEditing,
  onChange,
}: DetailFormProps) {
  const getFieldComponent = (field: BaseField) => {
    if (!field || !field.type) return null;

    const commonProps = {
      label: field.label,
      value: field.value,
      required: field.required,
      isEditing,
      onChange: (newValue: string | string[]) => {
        const stringValue = Array.isArray(newValue)
          ? newValue.join(",")
          : newValue;
        onChange(field.path || "", field.value, stringValue);
      },
    };

    if (field.type === "hidden") return null;

    if (field.type === "dropdown" && field.dropdownFields) {
      return <SelectField {...commonProps} options={field.dropdownFields} />;
    }

    return (
      <TextField
        {...commonProps}
        type={field.type as "text" | "email" | "number" | "tel"}
      />
    );
  };

  const renderField = (field: any, path: string) => {
    if (!field || typeof field !== "object") return null;

    // Handle base field with type and label
    if (field.type && field.label) {
      return (
        <div key={path} className="detail-form__field">
          {getFieldComponent(field)}
        </div>
      );
    }

    // Handle arrays (like heat_demand sections)
    if (Array.isArray(field)) {
      return field.map((item, index) => {
        const arrayPath = `${path}[${index}]`;
        if (item.value) {
          return (
            <div key={arrayPath} className="detail-form__field">
              {getFieldComponent(item.value)}
            </div>
          );
        }
        return renderField(item, arrayPath);
      });
    }

    // Handle nested objects
    const entries = Object.entries(field);
    if (entries.length === 0) return null;

    return entries.map(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      const title =
        key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

      // Skip rendering for empty objects
      if (
        !value ||
        (typeof value === "object" && Object.keys(value).length === 0)
      ) {
        return null;
      }

      // Handle nested arrays
      if (Array.isArray(value)) {
        return (
          <div
            key={newPath}
            className="detail-form__group detail-form__group--bordered"
          >
            <div className="detail-form__group-title">
              <strong>{title}</strong>
            </div>
            <div className="detail-form__fields">
              {renderField(value, newPath)}
            </div>
          </div>
        );
      }

      // Handle nested objects
      if (typeof value === "object" && value !== null) {
        // Directly render if it's a field
        if (value.type && value.label) {
          return (
            <div key={newPath} className="detail-form__field">
              {getFieldComponent(value)}
            </div>
          );
        }

        // Render nested structure
        return (
          <div
            key={newPath}
            className="detail-form__group detail-form__group--bordered"
          >
            <div className="detail-form__group-title">
              <strong>{title}</strong>
            </div>
            <div className="detail-form__fields">
              {renderField(value, newPath)}
            </div>
          </div>
        );
      }

      return null;
    });
  };

  const renderSection = (title: string, content: any, path: string) => {
    if (
      !content ||
      (typeof content === "object" && Object.keys(content).length === 0)
    ) {
      return null;
    }

    return (
      <div key={path} className="detail-form__section">
        <div className="detail-form__section-title">{title}</div>
        <div className="detail-form__groups">{renderField(content, path)}</div>
      </div>
    );
  };

  return (
    <div className="detail-form-container">
      <div className="detail-form__header">
        {isEditing ? (
          getFieldComponent(fields.name)
        ) : (
          <h3 className="detail-form__title">{fields.name.value}</h3>
        )}
      </div>

      <div className="detail-form">
        {Object.entries(fields).map(([key, value]) => {
          if (key === "id" || key === "name") return null;
          const title =
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
          return renderSection(title, value, key);
        })}
      </div>
    </div>
  );
}
