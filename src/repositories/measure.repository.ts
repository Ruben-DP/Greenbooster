import { BaseRepository } from "./base.repository";
import { Measure } from "@/types/measures";
import { COLLECTIONS } from "@/lib/database";

export class MeasureRepository extends BaseRepository<Measure> {
  constructor() {
    super(COLLECTIONS.RETROFITTING_MEASURES);
  }

  /**
   * Search measures by name or group
   */
  async searchMeasures(searchTerm?: string): Promise<Measure[]> {
    try {
      const collection = await this.getCollection();
      const query = searchTerm
        ? {
            $or: [
              { name: { $regex: searchTerm, $options: "i" } },
              { group: { $regex: searchTerm, $options: "i" } },
            ],
          }
        : {};

      const docs = await collection.find(query).toArray();

      return docs.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as Measure[];
    } catch (error) {
      console.error("Search measures error:", error);
      throw error;
    }
  }

  /**
   * Get measures by group
   */
  async getMeasuresByGroup(group: string): Promise<Measure[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection.find({ group }).toArray();

      return docs.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as Measure[];
    } catch (error) {
      console.error("Get measures by group error:", error);
      throw error;
    }
  }
}
