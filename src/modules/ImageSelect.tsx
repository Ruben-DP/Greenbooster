"use client";
import { useState, useRef, useEffect } from 'react';

interface ImageSelectOption {
  value: string;
  label: string;
  imageSrc?: string;
}

interface ImageSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: ImageSelectOption[];
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

export default function ImageSelect({
  id,
  name,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  label
}: ImageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ImageSelectOption | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  // Set initial selected option based on value
  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Create a synthetic event to pass to the onChange handler
  const handleSelect = (option: ImageSelectOption) => {
    if (disabled) return;
    
    setSelectedOption(option);
    setIsOpen(false);
    
    // Create a synthetic change event
    const syntheticEvent = {
      target: {
        id,
        name,
        value: option.value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(syntheticEvent);
  };

  return (
    <div className={label ? "project-form__field" : ""} ref={selectRef}>
      {label && <label htmlFor={id}>{label}{required && <span className="required">*</span>}</label>}
      
      {/* Hidden native select for form submission */}
      <select 
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={{ display: 'none' }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Custom select UI */}
      <div 
        className={`image-select ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="image-select__selected">
          {selectedOption ? (
            <>
              {selectedOption.imageSrc && (
                <img 
                  src={selectedOption.imageSrc} 
                  alt={selectedOption.label} 
                  className="image-select__image" 
                />
              )}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="image-select__placeholder">Kies woning type</span>
          )}
          <svg 
            className={`image-select__arrow ${isOpen ? 'open' : ''}`} 
            width="14" 
            height="8" 
            viewBox="0 0 14 8" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {isOpen && !disabled && (
          <div className="image-select__dropdown">
            {options.map((option) => (
              <div
                key={option.value}
                className={`image-select__option ${selectedOption?.value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option.imageSrc && (
                  <img 
                    src={option.imageSrc} 
                    alt={option.label} 
                    className="image-select__image" 
                  />
                )}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* CSS for the custom select */}
      <style jsx>{`
        .image-select {
          position: relative;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
        }
        
        .image-select.disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .image-select__selected {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          justify-content: space-between;
        }
        
        .image-select__selected span {
          margin-right: auto;
        }
        
        .image-select__placeholder {
          color: #757575;
        }
        
        .image-select__arrow {
          transition: transform 0.2s ease;
        }
        
        .image-select__arrow.open {
          transform: rotate(180deg);
        }
        
        .image-select__dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background-color: white;
          outline: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 4px 4px;
          z-index: 100;
          max-height: 480px;
          overflow-y: auto;

        }
        
        .image-select__option {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          cursor: pointer;
        }
        
        .image-select__option:hover {
          background-color: #f5f5f5;
        }
        
        .image-select__option.selected {
          background-color: #f0f7ff;
        }
        
        .image-select__image {
          width: 200px;
          height: 200px;
          object-fit: cover;
          margin-right: 10px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}