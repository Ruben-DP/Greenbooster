export interface ProfileMeasure {
  id: string;
  name: string;
  group?: string;
  price?: number;
  heatDemandValue?: number;
  maintenanceCostPerYear?: number;
}

export interface ResidenceProfile {
  _id?: string;
  woningId: string;
  typeId: string;
  measures: ProfileMeasure[];
  totalBudget: number;
  totalHeatDemand: number;
  name: string;
  savedAt?: Date;
}

export interface ProfileResult {
  success: boolean;
  data?: ResidenceProfile | ResidenceProfile[];
  id?: string;
  message?: string;
}
