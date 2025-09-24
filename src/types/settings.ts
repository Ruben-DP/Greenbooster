export interface CustomField {
  id: string;
  name: string;
  value: number;
}

export interface Settings {
  _id?: string;
  hourlyLaborCost: number;     
  profitPercentage: number;    
  vatPercentage: number;       
  inflationPercentage: number; 
  cornerHouseCorrection: number;
  customFields?: CustomField[];
  // Legacy fields for backward compatibility
  customValue1?: number;
  customValue2?: number;
  customValue1Name?: string;
  customValue2Name?: string;
  // Additional settings fields
  abkMaterieel?: number;
  afkoop?: number;
  kostenPlanuitwerking?: number;
  nazorgService?: number;
  carPiDicVerzekering?: number;
  bankgarantie?: number;
  algemeneKosten?: number;
  risico?: number;
  winst?: number;
  planvoorbereiding?: number;
  huurdersbegeleiding?: number;
}

export interface SettingsResult {
  success: boolean;
  data?: Settings;
  error?: string;
}