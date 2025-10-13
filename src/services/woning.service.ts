import { WoningRepository } from "@/repositories/woning.repository";
import { Woning, ProjectInformation, EnergyDetails } from "@/types/woningen";
import { DatabaseResult } from "@/repositories/base.repository";

export class WoningService {
  private repository: WoningRepository;

  constructor() {
    this.repository = new WoningRepository();
  }

  /**
   * Search woningen
   */
  async searchWoningen(searchTerm?: string): Promise<{
    success: boolean;
    data?: Woning[];
    error?: string;
  }> {
    try {
      const woningen = await this.repository.searchWoningen(searchTerm);
      return { success: true, data: woningen };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      };
    }
  }

  /**
   * Get woning by ID
   */
  async getWoningById(id: string): Promise<DatabaseResult<Woning>> {
    try {
      const woning = await this.repository.findById(id);
      if (!woning) {
        return { success: false, error: "Woning not found" };
      }
      return { success: true, data: woning };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get woning",
      };
    }
  }

  /**
   * Create a new woning from form data
   */
  async createWoning(formData: FormData): Promise<DatabaseResult<Woning>> {
    try {
      const typeId = formData.get("typeId") as string;

      const woningData: Omit<Woning, "_id"> = {
        projectInformation: {
          projectNumber: formData.get("projectNumber") as string,
          complexName: formData.get("complexName") as string,
          aantalVHE: Number(formData.get("aantalVHE")),
          adres: formData.get("adres") as string,
          postcode: formData.get("postcode") as string,
          plaats: formData.get("plaats") as string,
          renovatieJaar: Number(formData.get("renovatieJaar")),
          bouwPeriode: formData.get("bouwPeriode") as string,
        },
        energyDetails: {
          huidigLabel: formData.get("huidigLabel") as string,
          huidigEnergie: Number(formData.get("huidigEnergie")),
          voorkostenScenario: formData.get("voorkostenScenario") as string,
          nieuwLabel: formData.get("nieuwLabel") as string,
          labelStappen: formData.get("labelStappen") as string,
          huidigVerbruik: Number(formData.get("huidigEnergieVerbruik")),
          huidigEnergieprijs: Number(formData.get("huidigEnergieprijs")),
        },
        typeId: typeId,
        isGrondgebonden: formData.get("grondgebonden") === "true",
        isPortiekflat: formData.get("portiekflat") === "true",
        isGalerieflat: formData.get("galerieflat") === "true",
        dimensions: {
          breed: formData.get("breed") as string,
          diepte: formData.get("diepte") as string,
          goothoogte: formData.get("goothoogte") as string,
          nokhoogte: formData.get("nokhoogte") as string,
          aantalwoningen: formData.get("aantalwoningen") as string,
          kopgevels: formData.get("kopgevels") as string,
          breedtecomplex: formData.get("breedtecomplex") as string,
          portieken: formData.get("portieken") as string,
          bouwlagen: formData.get("bouwlagen") as string,
        },
        measures: [],
      };

      return await this.repository.create(woningData as Woning);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Creation failed",
      };
    }
  }

  /**
   * Update an existing woning
   */
  async updateWoning(
    id: string,
    formData: FormData
  ): Promise<DatabaseResult<Woning>> {
    try {
      const updateData: Omit<Woning, "_id"> = {
        projectInformation: {
          projectNumber: formData.get("projectNumber") as string,
          complexName: formData.get("complexName") as string,
          aantalVHE: Number(formData.get("aantalVHE")),
          adres: formData.get("adres") as string,
          postcode: formData.get("postcode") as string,
          plaats: formData.get("plaats") as string,
          renovatieJaar: Number(formData.get("renovatieJaar")),
          bouwPeriode: formData.get("bouwPeriode") as string,
        },
        energyDetails: {
          huidigLabel: formData.get("huidigLabel") as string,
          huidigEnergie: Number(formData.get("huidigEnergie")),
          voorkostenScenario: formData.get("voorkostenScenario") as string,
          nieuwLabel: formData.get("nieuwLabel") as string,
          labelStappen: formData.get("labelStappen") as string,
          huidigVerbruik: Number(formData.get("huidigEnergieVerbruik")),
          huidigEnergieprijs: Number(formData.get("huidigEnergieprijs")),
        },
        typeId: formData.get("typeId") as string,
        isGrondgebonden: formData.get("grondgebonden") === "true",
        isPortiekflat: formData.get("portiekflat") === "true",
        isGalerieflat: formData.get("galerieflat") === "true",
        dimensions: {
          breed: formData.get("breed") as string,
          diepte: formData.get("diepte") as string,
          goothoogte: formData.get("goothoogte") as string,
          nokhoogte: formData.get("nokhoogte") as string,
          aantalwoningen: formData.get("aantalwoningen") as string,
          kopgevels: formData.get("kopgevels") as string,
          breedtecomplex: formData.get("breedtecomplex") as string,
          portieken: formData.get("portieken") as string,
          bouwlagen: formData.get("bouwlagen") as string,
        },
      } as Omit<Woning, "_id">;

      return await this.repository.update(id, updateData as Woning);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  /**
   * Update measures for a woning
   */
  async updateWoningMeasures(
    id: string,
    measures: any[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.repository.updateMeasures(id, measures);

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error:
          result.matchedCount === 0
            ? "Document not found"
            : "Document found but not modified",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  /**
   * Delete a woning
   */
  async deleteWoning(id: string): Promise<DatabaseResult<{ id: string }>> {
    return await this.repository.delete(id);
  }
}
