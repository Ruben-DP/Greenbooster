import { BaseRepository } from "./base.repository";
import { Settings } from "@/types/settings";
import { COLLECTIONS } from "@/lib/database";

export class SettingsRepository extends BaseRepository<Settings> {
  constructor() {
    super(COLLECTIONS.SETTINGS);
  }

  /**
   * Get the application settings (there should only be one document)
   */
  async getSettings(): Promise<Settings | null> {
    return await this.findOne({});
  }

  /**
   * Update or create settings
   */
  async upsertSettings(settings: Settings) {
    try {
      const collection = await this.getCollection();
      const existingSettings = await this.getSettings();

      // Prepare settings object for update (remove _id if present)
      const { _id, ...settingsData } = settings;

      if (existingSettings) {
        // Update existing settings
        const result = await collection.updateOne(
          { _id: existingSettings._id as any },
          { $set: settingsData }
        );

        return {
          success: result.modifiedCount === 1,
          data: existingSettings._id
            ? { ...settings, _id: existingSettings._id }
            : settings,
        };
      } else {
        // Create new settings
        const result = await collection.insertOne(settingsData as any);

        return {
          success: result.acknowledged,
          data: { ...settings, _id: result.insertedId.toString() },
        };
      }
    } catch (error) {
      console.error("Upsert settings error:", error);
      throw error;
    }
  }
}
