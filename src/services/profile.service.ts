import { ProfileRepository } from "@/repositories/profile.repository";
import { ResidenceProfile, ProfileResult } from "@/types/profile";

export class ProfileService {
  private repository: ProfileRepository;

  constructor() {
    this.repository = new ProfileRepository();
  }

  /**
   * Save a new residence profile
   */
  async saveProfile(profileData: Omit<ResidenceProfile, "_id" | "savedAt">): Promise<ProfileResult> {
    try {
      const profile: ResidenceProfile = {
        ...profileData,
        savedAt: new Date(),
      };

      const result = await this.repository.create(profile);

      if (result.success && result.data) {
        return {
          success: true,
          id: result.data._id,
          message: "Profiel succesvol opgeslagen",
        };
      }

      return {
        success: false,
        message: result.error || "Fout bij het opslaan van het profiel",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Fout bij het opslaan van het profiel",
      };
    }
  }

  /**
   * Get all saved profiles
   */
  async getSavedProfiles(): Promise<ProfileResult> {
    try {
      const profiles = await this.repository.getAllProfiles();

      return {
        success: true,
        data: profiles,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Fout bij het ophalen van opgeslagen profielen",
        data: [],
      };
    }
  }

  /**
   * Get a specific saved profile by ID
   */
  async getProfileById(id: string): Promise<ProfileResult> {
    try {
      const profile = await this.repository.findById(id);

      if (!profile) {
        return {
          success: false,
          message: "Profiel niet gevonden",
        };
      }

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Fout bij het ophalen van het opgeslagen profiel",
      };
    }
  }

  /**
   * Get profiles by woning ID
   */
  async getProfilesByWoningId(woningId: string): Promise<ProfileResult> {
    try {
      const profiles = await this.repository.getProfilesByWoningId(woningId);

      return {
        success: true,
        data: profiles,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Fout bij het ophalen van profielen",
        data: [],
      };
    }
  }

  /**
   * Delete a saved profile
   */
  async deleteProfile(id: string): Promise<ProfileResult> {
    try {
      const result = await this.repository.delete(id);

      if (result.success) {
        return {
          success: true,
          message: "Profiel succesvol verwijderd",
        };
      }

      return {
        success: false,
        message: result.error || "Profiel niet gevonden",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Fout bij het verwijderen van het profiel",
      };
    }
  }
}
