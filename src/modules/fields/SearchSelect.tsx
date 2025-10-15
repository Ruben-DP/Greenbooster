import React, { useEffect, useState, useRef } from "react";
import { searchDocuments } from "@/app/actions/crudActions";

interface Option {
  label: string;
  value: string;
  id?: string;
  referenceData?: any;
}

interface SearchSelectProps {
  label: string;
  value: string;
  onChange: (value: string, id?: string, referenceData?: any) => void;
  options?: Option[] | string[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  placeholder?: string;
  dynamicOptions?: {
    collection: string;
    displayField: string;
    currentValue?: string;
    referenceFields?: string[];
  };
}

// Helper function to get nested values from objects
const getNestedValue = <T extends object>(obj: T, path: string): any => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

export function SearchSelect({
  label,
  value,
  onChange,
  options: providedOptions,
  required,
  disabled,
  isEditing,
  placeholder,
  dynamicOptions,
}: SearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      if (dynamicOptions) {
        try {
          const results = await searchDocuments(dynamicOptions.collection);
          const mappedOptions = results
            .filter(
              (item: any) =>
                getNestedValue(item, dynamicOptions.displayField) !==
                dynamicOptions.currentValue
            )
            .map((item: any) => {
              const displayValue = getNestedValue(item, dynamicOptions.displayField);
              return {
                label: displayValue || "N/A",
                value: item._id, // Use _id as the value instead of displayField
                id: item._id,
                referenceData: dynamicOptions.referenceFields?.reduce(
                  (acc, field) => {
                    acc[field] = getNestedValue(item, field);
                    return acc;
                  },
                  {} as Record<string, any>
                ),
              };
            });
          setAllOptions(mappedOptions);
        } catch (error) {
          console.error("Failed to fetch options:", error);
        }
      } else if (providedOptions) {
        const mapped = providedOptions.map((opt) =>
          typeof opt === "string" ? { label: opt, value: opt } : opt
        );
        setAllOptions(mapped);
      }
    };

    fetchOptions();
  }, [dynamicOptions, providedOptions]);

  useEffect(() => {
    const filtered = allOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, allOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = allOptions.find((opt) => opt.value === value);

  if (!isEditing) {
    return (
      <div className="form-field">
        <label className="field-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
        <div className="input-read-only">
          {selectedOption?.label || <span className="empty-reference">-</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="form-field" ref={wrapperRef}>
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      <div className="search-select">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || "Search..."}
          className="search-select__input"
          disabled={disabled}
        />
        {isOpen && filteredOptions.length > 0 && (
          <ul className="search-select__dropdown">
            {filteredOptions.map((option) => (
              <li
                key={option.id || option.value}
                onClick={() => {
                  onChange(option.value, option.id, option.referenceData);
                  setSearchTerm("");
                  setIsOpen(false);
                }}
                className="search-select__option"
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
