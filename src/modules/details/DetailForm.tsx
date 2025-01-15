import React from "react";
import { Measure } from "@/types/measures";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { useData } from "@/contexts/DataContext";

interface DetailFormProps {
  measure: Measure;
  isEditing: boolean;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
}

const DetailForm = ({ measure, isEditing, onChange }: DetailFormProps) => {
  const { state } = useData();
  const { pendingChanges } = state.measures;

  if (!measure) return null;

  const getCurrentValue = (path: string, originalValue: any) => {
    const pendingChange = pendingChanges[path];
    return pendingChange ? pendingChange.newValue : originalValue;
  };

  const handleChange = (path: string, oldValue: any, newValue: any) => {
    if (onChange) {
      onChange(path, oldValue, newValue);
    }
  };

  const renderField = (
    label: string,
    value: any,
    path: string,
    type: string = "text"
  ) => {
    if (typeof value === "string" || typeof value === "number") {
      const currentValue = getCurrentValue(path, value);
      return (
        <TextField
          key={path}
          label={label}
          value={String(currentValue)}
          type={type}
          required={true}
          isEditing={isEditing}
          onChange={(newValue) => handleChange(path, currentValue, newValue)}
        />
      );
    }
    return null;
  };

  // Render array of period values with proper type checking
  const renderPeriodValues = (values: any[], basePath: string) => {
    // Check if values is actually an array and has items
    if (!Array.isArray(values) || values.length === 0) {
      console.log(`No values to render for ${basePath}`);
      return null;
    }

    return values.map((item, index) => {
      if (!item) {
        console.log(`Skipping null/undefined item at index ${index}`);
        return null;
      }

      const period = item.period || `Period ${index + 1}`;
      const path = `${basePath}[${index}].value`;
      const currentValue = getCurrentValue(path, item.value);
      
      return (
        <div key={`${basePath}-${index}`} className="detail-form__field">
          {renderField(period, currentValue, path, "number")}
        </div>
      );
    });
  };

  // Render measure price component with proper type checking
  const renderPriceComponent = (component: any, path: string) => {
    if (!component) {
      console.log(`No component to render for ${path}`);
      return null;
    }

    return (
      <div className="detail-form__group-content">
        {component.name && renderField("Name", component.name, `${path}.name`)}
        {component.aantal && (
          <div className="detail-form__field-group">
            {component.aantal.value !== undefined &&
              renderField(
                "Value",
                component.aantal.value,
                `${path}.aantal.value`,
                "number"
              )}
            {component.aantal.unit && (
              <SelectField
                label="Unit"
                value={getCurrentValue(`${path}.aantal.unit`, component.aantal.unit)}
                options={["m2", "pieces", "meters"]}
                required={true}
                isEditing={isEditing}
                onChange={(newValue) =>
                  handleChange(
                    `${path}.aantal.unit`,
                    component.aantal.unit,
                    newValue
                  )
                }
              />
            )}
            {component.aantal.percentage !== undefined &&
              renderField(
                "Percentage",
                component.aantal.percentage,
                `${path}.aantal.percentage`,
                "number"
              )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="detail-form">
      {/* Basic Info */}
      <div className="detail-form__section">
        <div className="detail-form__header">
          <h2>Basic Information</h2>
          {renderField("Name", measure.name, "name")}
          {renderField("Group", measure.group, "group")}
        </div>

        {/* Heat Demand */}
        {measure.heat_demand && (
          <div className="detail-form__group">
            <h3>Heat Demand</h3>
            {Object.entries(measure.heat_demand).map(([key, values]) => (
              <div key={key} className="detail-form__group-content">
                <h4 className="detail-form__subheading">{key}</h4>
                {Array.isArray(values) && renderPeriodValues(values, `heat_demand.${key}`)}
              </div>
            ))}
          </div>
        )}

        {/* Measure Prices */}
        {measure.measure_prices && (
          <div className="detail-form__group">
            <h3>Measure Prices</h3>
            {Object.entries(measure.measure_prices).map(([key, component]) => (
              <div key={key} className="detail-form__group-content">
                <h4 className="detail-form__subheading">
                  {key.replace(/_/g, " ")}
                </h4>
                {renderPriceComponent(component, `measure_prices.${key}`)}
              </div>
            ))}
          </div>
        )}

        {/* Additional Components */}
        {measure.additional_components && Array.isArray(measure.additional_components) && (
          <div className="detail-form__group">
            <h3>Additional Components</h3>
            <div className="detail-form__group-content">
              {measure.additional_components.map((component, index) => {
                const path = `additional_components[${index}]`;
                const currentValue = getCurrentValue(path, component);
                return (
                  <TextField
                    key={index}
                    label={`Component ${index + 1}`}
                    value={currentValue}
                    isEditing={isEditing}
                    onChange={(newValue) =>
                      handleChange(path, currentValue, newValue)
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailForm;