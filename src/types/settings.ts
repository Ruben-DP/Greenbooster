export interface Settings {
  _id?: string;
  hourlyLaborCost: number;     
  profitPercentage: number;    
  vatPercentage: number;       
  inflationPercentage: number; 
  cornerHouseCorrection: number; 
}

export interface SettingsResult {
  success: boolean;
  data?: Settings;
  error?: string;
}