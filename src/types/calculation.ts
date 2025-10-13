export interface CalculationMeasure {
  id?: string;
  name: string;
  group?: string;
  price?: number;
  heatDemandValue?: number;
  maintenanceCostPerYear?: number;
}

export interface SavedCalculation {
  _id?: string;
  woningId: string;
  typeId: string;
  measures: CalculationMeasure[];
  totalBudget: number;
  totalHeatDemand: number;
  name?: string;
  savedAt?: Date;
}

export interface CalculationResult {
  success: boolean;
  data?: SavedCalculation | SavedCalculation[];
  id?: string;
  message?: string;
}
