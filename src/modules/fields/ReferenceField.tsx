import React, { useEffect, useState } from 'react';
import { searchDocuments } from "@/app/actions/crudActions";

interface ReferenceFieldProps {
  label: string;
  value: string;
  onChange: (path: string, oldValue: any, newValue: any) => void;
  path: string;
  collection: string;
  displayField: string;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
}

export function ReferenceField({
  label,
  value = "",
  onChange,
  path,
  collection,
  displayField,
  required = false,
  disabled,
  isEditing,
}: ReferenceFieldProps) {
  const [options, setOptions] = useState<Array<{ _id: string, [key: string]: any }>>([]);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const results = await searchDocuments(collection);
        setOptions(results);
        
        // Find and set the display name when options are loaded
        const selected = results.find(opt => opt._id === value);
        if (selected) {
          setDisplayName(selected[displayField]);
        }
      } catch (error) {
        console.error('Failed to fetch reference options:', error);
      }
    };

    fetchOptions();
  }, [collection, value, displayField]);

  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark"> *</span>}
      </label>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => onChange(path, value, e.target.value)}
          className="input-base"
          required={required}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option._id} value={option._id}>
              {option[displayField]}
            </option>
          ))}
        </select>
      ) : (
        <div className="input-read-only">
          {displayName || <span className="empty-reference">-</span>}
        </div>
      )}
    </div>
  );
}