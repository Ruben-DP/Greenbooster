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
  const { pendingChanges, variables } = useData();

  if (!measure) return null;

  const getCurrentValue = (path: string, originalValue: any) => {
    const pendingChange = pendingChanges[path];
    return pendingChange ? pendingChange.newValue : originalValue;
  };

  const handleChange = (path: string, oldValue: any, newValue: any) => {
    onChange?.(path, oldValue, newValue);
  };

  return (
    <div className="detail-form">
      <div className="detail-form__section">
        <div className="detail-form__header">
          {!isEditing ? (
            <h3>{measure.name}</h3>
          ) : (
            <TextField
              label="Naam:"
              value={getCurrentValue("name", measure.name)}
              type="text"
              required={true}
              isEditing={isEditing}
              onChange={(newValue) => handleChange(
                "name",
                getCurrentValue("name", measure.name),
                newValue
              )}
            />
          )}
        </div>

        {measure.heat_demand && (
          <>
            <div className="detail-form__group-header">
              <div>Warmtebehoefte</div>
            </div>
            <div className="heat-demand">
              <div className="detail-form__group">
                {Object.entries(measure.heat_demand).map(([key, values]) => (
                  <div key={key} className="detail-form__group-content">
                    <div className="detail-form__subheading">{key}</div>
                    {Array.isArray(values) && values.map((item, index) => {
                      if (!item) return null;
                      const path = `heat_demand.${key}[${index}].value`;
                      const currentValue = getCurrentValue(path, item.value);
                      const period = item.period || `Period ${index + 1}`;

                      return (
                        <div key={`${key}-${index}`} className="detail-form__field">
                          <TextField
                            label={period}
                            value={String(currentValue)}
                            type="number"
                            required={true}
                            isEditing={isEditing}
                            onChange={(newValue) => handleChange(path, currentValue, newValue)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {measure.measure_prices && (
          <>
            <div className="detail-form__group-header">
              <div>Prijs berekening</div>
            </div>
            <div className="detail-form__group has-subgroups">
              {Array.isArray(measure.measure_prices) && measure.measure_prices.map((item, index) => {
                if (!item) return null;
                const path = `measure_prices[${index}].name`;
                const name = item.name || `Maatregel ${index + 1} (naamloos)`;

                return (
                  <div key={`price-${index}`} className="has-subgroups">
                    <div className="detail-form__subheading">
                      <TextField
                        label="Maatregel"
                        value={name}
                        type="text"
                        required={false}
                        isEditing={isEditing}
                        onChange={(newValue) => handleChange(path, name, newValue)}
                      />
                    </div>
                    <div>
                      <strong>Berekening</strong>
                    </div>
                    <div className="detail-form__calculation">
                      {Array.isArray(item.calculation) && item.calculation.map((formula, valueIndex) => {
                        if (!formula) return null;
                        const valuePath = `measure_prices[${index}].calculation[${valueIndex}].value`;
                        
                        return formula.type === "variable" ? (
                          <div key={`price-${index}-value-${valueIndex}`} className="detail-form__field">
                            <SelectField
                              label={formula.value}
                              value={String(getCurrentValue(valuePath, formula.value))}
                              options={variables.map(v => v.variableName)}
                              required={false}
                              isEditing={isEditing}
                              onChange={(newValue) => handleChange(valuePath, formula.value, newValue)}
                            />
                          </div>
                        ) : formula.type === "operator" ? (
                          <div key={`price-${index}-operator-${valueIndex}`} className="detail-form__field">
                            <SelectField
                              label=""
                              value={String(getCurrentValue(valuePath, formula.value))}
                              options={["-", "+", "*", "/"]}
                              optionText="Select an operator"
                              required={false}
                              isEditing={isEditing}
                              onChange={(newValue) => handleChange(valuePath, formula.value, newValue)}
                            />
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailForm;