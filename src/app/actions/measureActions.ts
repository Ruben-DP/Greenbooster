"use server";

import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";
import { Measure } from "@/types/measures";

export async function searchMeasures(searchTerm?: string): Promise<Measure[]> {
  try {
    const client = await clientPromise;
    const collection = client
      .db("Greenbooster")
      .collection("retrofittingMeasures");

    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};

    const docs = await collection.find(query).toArray();
    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as Measure[];
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

export async function createMeasure(
  measure: Measure
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const collection = client
      .db("Greenbooster")
      .collection("retrofittingMeasures");

    const { _id, ...measureData } = measure;
    const result = await collection.insertOne(measureData);

    return { success: result.acknowledged };
  } catch (error) {
    console.error("Create error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

export async function updateMeasure(
  id: string,
  measure: Measure
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("trying to update this id:", id);
    const client = await clientPromise;
    const collection = client
      .db("Greenbooster")
      .collection("retrofittingMeasures");
    
    const { _id, ...updateData } = measure;
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    // Check if the update was successful
    if (result.ok && result.value) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: "Update operation completed but no document was modified" 
      };
    }
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}