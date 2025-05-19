// types/settings.ts

export interface Settings {
  _id?: string;
  hourlyLaborCost: number;      // Uurloon kostprijs
  vatPercentage: number;        // BTW percentage
  inflationPercentage: number;  // Jaarlijks inflatie percentage
  cornerHouseCorrection: number; // Hoekhuis correctie
  abkMaterieel: number;         // ABK / materieel volgens begroting
  afkoop: number;               // Afkoop
  kostenPlanuitwerking: number; // Kosten t.b.v. nadere planuitwerking
  nazorgService: number;        // Nazorg / Service
  carPiDicVerzekering: number;  // CAR / PI / DIC verzekering
  bankgarantie: number;         // Bankgarantie
  algemeneKosten: number;       // Algemene kosten (AK)
  risico: number;               // Risico
  winst: number;                // Winst
  planvoorbereiding: number;    // Planvoorbereiding
  huurdersbegeleiding: number;  // Huurdersbegeleiding
  // Keeping profitPercentage optional for backward compatibility
  profitPercentage?: number;    // Old field, no longer used
}

export interface SettingsResult {
  success: boolean;
  data?: Settings;
  error?: string;
}