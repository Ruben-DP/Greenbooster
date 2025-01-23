export interface Item {
  _id: string;
  name?: string;
  group?: string;
  [key: string]: any;
}

export interface ChangeRecord {
  fieldId: string;
  label: string;
  oldValue: string;
  newValue: string;
}

export interface FormField {
  id: string;
  label?: string;
  value: string;
  type: "text" | "email" | "number" | "tel" | "hidden" | "dropdown";
  required?: boolean;
  dropdownFields?: string[];
  path?: string;
}