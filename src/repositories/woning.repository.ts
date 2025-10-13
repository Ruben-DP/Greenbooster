import { BaseRepository } from "./base.repository";
import { Woning } from "@/types/woningen";
import { COLLECTIONS } from "@/lib/database";
import { ObjectId } from "mongodb";

export class WoningRepository extends BaseRepository<Woning> {
  constructor() {
    super(COLLECTIONS.WONINGEN);
  }

  /**
   * Search woningen by project number or complex name
   */
  async searchWoningen(searchTerm?: string): Promise<Woning[]> {
    try {
      const collection = await this.getCollection();
      const query = searchTerm
        ? {
            $or: [
              {
                "projectInformation.projectNumber": {
                  $regex: searchTerm,
                  $options: "i",
                },
              },
              {
                "projectInformation.complexName": {
                  $regex: searchTerm,
                  $options: "i",
                },
              },
            ],
          }
        : {};

      const docs = await collection.find(query).toArray();

      return docs.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as Woning[];
    } catch (error) {
      console.error("Search woningen error:", error);
      throw error;
    }
  }

  /**
   * Update measures for a woning
   */
  async updateMeasures(id: string, measures: any[]) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { measures: measures } }
      );

      return {
        success: result.modifiedCount === 1 || result.matchedCount === 1,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      console.error("Update measures error:", error);
      throw error;
    }
  }
}
