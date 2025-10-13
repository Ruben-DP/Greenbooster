import { SettingsRepository } from "@/repositories/settings.repository";
import { Settings, SettingsResult } from "@/types/settings";

// Default settings if none exist in the database
const DEFAULT_SETTINGS: Settings = {
  hourlyLaborCost: 51,         // €51 per hour
  vatPercentage: 21,           // 21% BTW (VAT)
  inflationPercentage: 1,      // 1% annual inflation
  cornerHouseCorrection: -10,  // -10% correction for corner houses
  abkMaterieel: 5,             // ABK / materieel volgens begroting
  afkoop: 2,                   // Afkoop
  kostenPlanuitwerking: 3,     // Kosten t.b.v. nadere planuitwerking
  nazorgService: 1.5,          // Nazorg / Service
  carPiDicVerzekering: 1,      // CAR / PI / DIC verzekering
  bankgarantie: 0.5,           // Bankgarantie
  algemeneKosten: 8,           // Algemene kosten (AK)
  risico: 2,                   // Risico
  winst: 5,                    // Winst
  planvoorbereiding: 3,        // Planvoorbereiding
  huurdersbegeleiding: 2       // Huurdersbegeleiding
};

export class SettingsService {
  private repository: SettingsRepository;

  constructor() {
    this.repository = new SettingsRepository();
  }

  /**
   * Get application settings, creating defaults if none exist
   */
  async getSettings(): Promise<SettingsResult> {
    try {
      const settings = await this.repository.getSettings();

      if (settings) {
        // Merge with defaults to ensure all fields exist
        const settingsWithDefaults: Settings = {
          ...DEFAULT_SETTINGS,
          ...settings,
          _id: settings._id,
        };

        return { success: true, data: settingsWithDefaults };
      }

      // If no settings exist, create default settings
      const result = await this.repository.create(DEFAULT_SETTINGS);

      if (result.success) {
        return { success: true, data: result.data };
      }

      return {
        success: false,
        error: "Failed to initialize settings",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get settings",
      };
    }
  }

  /**
   * Update application settings
   */
  async updateSettings(settings: Settings): Promise<SettingsResult> {
    try {
      const result = await this.repository.upsertSettings(settings);

      if (result.success) {
        return { success: true, data: result.data };
      }

      return {
        success: false,
        error: "Failed to update settings",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update settings",
      };
    }
  }
}
