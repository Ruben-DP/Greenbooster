import { BaseRepository } from "./base.repository";
import { ResidenceProfile } from "@/types/profile";
import { COLLECTIONS } from "@/lib/database";

export class ProfileRepository extends BaseRepository<ResidenceProfile> {
  constructor() {
    super(COLLECTIONS.RESIDENCE_PROFILES);
  }

  /**
   * Get all profiles sorted by saved date (most recent first)
   */
  async getAllProfiles(): Promise<ResidenceProfile[]> {
    try {
      const collection = await this.getCollection();
      const profiles = await collection
        .find({})
        .sort({ savedAt: -1 })
        .toArray();

      return profiles.map((profile) => ({
        ...profile,
        _id: profile._id.toString(),
      })) as ResidenceProfile[];
    } catch (error) {
      console.error("Get all profiles error:", error);
      throw error;
    }
  }

  /**
   * Get profiles by woning ID
   */
  async getProfilesByWoningId(woningId: string): Promise<ResidenceProfile[]> {
    try {
      const collection = await this.getCollection();
      const profiles = await collection
        .find({ woningId })
        .sort({ savedAt: -1 })
        .toArray();

      return profiles.map((profile) => ({
        ...profile,
        _id: profile._id.toString(),
      })) as ResidenceProfile[];
    } catch (error) {
      console.error("Get profiles by woning error:", error);
      throw error;
    }
  }
}
