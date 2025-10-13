import { BaseRepository } from "./base.repository";
import { SavedCalculation } from "@/types/calculation";
import { COLLECTIONS } from "@/lib/database";

export class CalculationRepository extends BaseRepository<SavedCalculation> {
  constructor() {
    super(COLLECTIONS.SAVED_CALCULATIONS);
  }

  /**
   * Get all calculations sorted by saved date (most recent first)
   */
  async getAllCalculations(): Promise<SavedCalculation[]> {
    try {
      const collection = await this.getCollection();
      const calculations = await collection
        .find({})
        .sort({ savedAt: -1 })
        .toArray();

      return calculations.map((calc) => ({
        ...calc,
        _id: calc._id.toString(),
      })) as SavedCalculation[];
    } catch (error) {
      console.error("Get all calculations error:", error);
      throw error;
    }
  }

  /**
   * Get calculations by woning ID
   */
  async getCalculationsByWoningId(
    woningId: string
  ): Promise<SavedCalculation[]> {
    try {
      const collection = await this.getCollection();
      const calculations = await collection
        .find({ woningId })
        .sort({ savedAt: -1 })
        .toArray();

      return calculations.map((calc) => ({
        ...calc,
        _id: calc._id.toString(),
      })) as SavedCalculation[];
    } catch (error) {
      console.error("Get calculations by woning error:", error);
      throw error;
    }
  }
}
