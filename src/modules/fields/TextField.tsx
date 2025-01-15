import React from 'react';
import BaseField, { ReadOnlyContent } from './BaseField';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'number' | 'tel';
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
}

export const TextField = React.memo(({
  label,
  value = '',   
  onChange,
  type = 'text',
  required,
  disabled,
  isEditing
}: TextFieldProps) => (
  <BaseField label={label} required={required}>
    {isEditing ? (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        className="input-base"
        required={required}
        disabled={disabled}
        autoFocus={isEditing}
      />
    ) : (
      <ReadOnlyContent>{value}</ReadOnlyContent>
    )}
  </BaseField>
));

TextField.displayName = 'TextField';