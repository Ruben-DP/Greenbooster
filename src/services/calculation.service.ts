import { CalculationRepository } from "@/repositories/calculation.repository";
import { SavedCalculation, CalculationResult } from "@/types/calculation";

export class CalculationService {
  private repository: CalculationRepository;

  constructor() {
    this.repository = new CalculationRepository();
  }

  /**
   * Save a new calculation
   */
  async saveCalculation(
    calculationData: Omit<SavedCalculation, "_id" | "savedAt">
  ): Promise<CalculationResult> {
    try {
      const calculation: SavedCalculation = {
        ...calculationData,
        savedAt: new Date(),
      };

      const result = await this.repository.create(calculation);

      if (result.success && result.data) {
        return {
          success: true,
          id: result.data._id,
          message: "Berekening succesvol opgeslagen",
        };
      }

      return {
        success: false,
        message: result.error || "Fout bij het opslaan van de berekening",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Fout bij het opslaan van de berekening",
      };
    }
  }

  /**
   * Get all saved calculations
   */
  async getSavedCalculations(): Promise<CalculationResult> {
    try {
      const calculations = await this.repository.getAllCalculations();

      return {
        success: true,
        data: calculations,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Fout bij het ophalen van opgeslagen berekeningen",
        data: [],
      };
    }
  }

  /**
   * Get a specific saved calculation by ID
   */
  async getCalculationById(id: string): Promise<CalculationResult> {
    try {
      const calculation = await this.repository.findById(id);

      if (!calculation) {
        return {
          success: false,
          message: "Berekening niet gevonden",
        };
      }

      return {
        success: true,
        data: calculation,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Fout bij het ophalen van de opgeslagen berekening",
      };
    }
  }

  /**
   * Get calculations by woning ID
   */
  async getCalculationsByWoningId(
    woningId: string
  ): Promise<CalculationResult> {
    try {
      const calculations = await this.repository.getCalculationsByWoningId(
        woningId
      );

      return {
        success: true,
        data: calculations,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Fout bij het ophalen van berekeningen",
        data: [],
      };
    }
  }

  /**
   * Delete a saved calculation
   */
  async deleteCalculation(id: string): Promise<CalculationResult> {
    try {
      const result = await this.repository.delete(id);

      if (result.success) {
        return {
          success: true,
          message: "Berekening succesvol verwijderd",
        };
      }

      return {
        success: false,
        message: result.error || "Berekening niet gevonden",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Fout bij het verwijderen van de berekening",
      };
    }
  }
}
