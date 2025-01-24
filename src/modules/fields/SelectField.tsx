import React, { useEffect, useState } from 'react';
import { searchDocuments } from "@/app/actions/crudActions";

interface Option {
  label: string;
  value: string;
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
const STATIC_VARIABLES = ["aantalWoningen", "dakOppvervlak"];


export function SelectField({
  label,
  value,
  onChange,
  options: providedOptions,
  required,
  disabled,
  isEditing,
  optionText,
  dynamicOptions
}: SelectFieldProps) {
  const [dynamicOptionsList, setDynamicOptionsList] = useState<Option[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (dynamicOptions) {
        try {
          const results = await searchDocuments(dynamicOptions.collection);
          const mappedOptions = results
            .filter((item: any) => item[dynamicOptions.displayField] !== dynamicOptions.currentValue)
            .map((item: any) => ({
              label: item[dynamicOptions.displayField],
              value: item[dynamicOptions.displayField],
              id: item._id
            }));
          
          const staticOptions = STATIC_VARIABLES.map(v => ({
            label: v,
            value: v
          }));
          
          setDynamicOptionsList([...staticOptions, ...mappedOptions]);
        } catch (error) {
          console.error('Failed to fetch options:', error);
        }
      }
    };
  
    fetchOptions();
  }, [dynamicOptions]);
  

  const finalOptions = dynamicOptions ? dynamicOptionsList : 
    Array.isArray(providedOptions) ? 
      providedOptions.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt) : 
      [];

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
            const selectedOption = finalOptions.find(opt => opt.value === e.target.value);
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