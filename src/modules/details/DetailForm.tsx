"use client";

import React from "react";
import { Measure } from "@/types/measures";
import TextField from "../fields/TextField";
import SelectField from "../fields/SelectField";

interface DetailFormProps {
  measure: Measure;
  isEditing: boolean;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
}

export default function DetailForm({
  measure,
  isEditing,
  onChange
}: DetailFormProps) {
  if (!measure) return null;

  const handleChange = (path: string, oldValue: any, newValue: any) => {
    if (onChange) {
      onChange(path, oldValue, newValue);
    }
  };

  const renderPeriodValues = (
    values: { period: string; value: number }[],
    type: string
  ) => {
    return values.map((periodValue, index) => (
      <div key={`${type}-${index}`} className="detail-form__field">
        <TextField
          label={`${type} - ${periodValue.period}`}
          value={String(periodValue.value)}
          type="number"
          required={true}
          isEditing={isEditing}
          onChange={(newValue) =>
            handleChange(
              `heat_demand.${type}[${index}].value`,
              periodValue.value,
              parseFloat(newValue)
            )
          }
        />
      </div>
    ));
  };

  return (
    <div className="detail-form">
      <div className="detail-form__section">
        <div className="detail-form__header">
          <TextField
            label="Name"
            value={measure.name}
            required={true}
            isEditing={isEditing}
            onChange={(newValue) =>
              handleChange("name", measure.name, newValue)
            }
          />
        </div>

        <div className="detail-form__group">
          <h3>Heat Demand</h3>
          
          <div className="detail-form__group-content">
            <h4>Grongebonden</h4>
            {renderPeriodValues(measure.heat_demand.grongebonden, "grongebonden")}
          </div>

          <div className="detail-form__group-content">
            <h4>Portiek</h4>
            {renderPeriodValues(measure.heat_demand.portiek, "portiek")}
          </div>

          <div className="detail-form__group-content">
            <h4>Gallerij</h4>
            {renderPeriodValues(measure.heat_demand.gallerij, "gallerij")}
          </div>
        </div>

        <div className="detail-form__group">
          <h3>Measure Prices</h3>
          
          <div className="detail-form__group-content">
            <h4>Geisoleerde Dakplaat</h4>
            <TextField
              label="Name"
              value={measure.measure_prices.geisoleerde_dakplaat.name}
              required={true}
              isEditing={isEditing}
              onChange={(newValue) =>
                handleChange(
                  "measure_prices.geisoleerde_dakplaat.name",
                  measure.measure_prices.geisoleerde_dakplaat.name,
                  newValue
                )
              }
            />
            <TextField
              label="Value"
              value={String(measure.measure_prices.geisoleerde_dakplaat.aantal.value)}
              type="number"
              required={true}
              isEditing={isEditing}
              onChange={(newValue) =>
                handleChange(
                  "measure_prices.geisoleerde_dakplaat.aantal.value",
                  measure.measure_prices.geisoleerde_dakplaat.aantal.value,
                  parseFloat(newValue)
                )
              }
            />
            <SelectField
              label="Unit"
              value={measure.measure_prices.geisoleerde_dakplaat.aantal.unit}
              options={["m2", "pieces", "meters"]}
              required={true}
              isEditing={isEditing}
              onChange={(newValue) =>
                handleChange(
                  "measure_prices.geisoleerde_dakplaat.aantal.unit",
                  measure.measure_prices.geisoleerde_dakplaat.aantal.unit,
                  newValue
                )
              }
            />
          </div>

          <div className="detail-form__group-content">
            <h4>Extra Oppervlakte</h4>
            <TextField
              label="Value"
              value={String(measure.measure_prices.extra_oppervlakte.aantal.value)}
              type="number"
              required={true}
              isEditing={isEditing}
              onChange={(newValue) =>
                handleChange(
                  "measure_prices.extra_oppervlakte.aantal.value",
                  measure.measure_prices.extra_oppervlakte.aantal.value,
                  parseFloat(newValue)
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}