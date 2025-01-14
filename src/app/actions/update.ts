"use server";

import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";

const databaseName = "Greenbooster";

export async function updateDocument(
  collection: string,
  formFields: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collectionRef = db.collection(collection);

    // Extract the ID from the formFields
    const documentId = formFields.id?.value;
    if (!documentId) {
      return { success: false, error: "Document ID is required for update" };
    }

    // Create a flat update object by traversing the nested structure
    const flattenObject = (obj: any): Record<string, any> => {
      const result: Record<string, any> = {};

      // Handle id field
      if (obj.id?.value) {
        result._id = new ObjectId(obj.id.value);
      }

      // Handle name field
      if (obj.name?.value) {
        result.name = obj.name.value;
      }

      // Handle heat_demand field
      if (obj.heat_demand) {
        result.heat_demand = {
          grongebonden: obj.heat_demand.grongebonden?.map((item: any) => 
            item.value ? { value: item.value.value } : item
          ) || [],
          portiek: obj.heat_demand.portiek?.map((item: any) => 
            item.value ? { value: item.value.value } : item
          ) || [],
          gallerij: obj.heat_demand.gallerij?.map((item: any) => 
            item.value ? { value: item.value.value } : item
          ) || []
        };
      }

      // Handle measure_prices field
      if (obj.measure_prices) {
        result.measure_prices = {};
        Object.entries(obj.measure_prices).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'object' && value !== null) {
            result.measure_prices[key] = {};
            Object.entries(value).forEach(([subKey, subValue]: [string, any]) => {
              if (subValue && typeof subValue === 'object' && 'value' in subValue) {
                result.measure_prices[key][subKey] = subValue.value;
              } else {
                result.measure_prices[key][subKey] = subValue;
              }
            });
          }
        });
      }

      return result;
    };

    // Flatten the form fields
    const updateObject = flattenObject(formFields);

    // Add updatedAt timestamp
    updateObject.updatedAt = new Date();

    console.log('Update object:', updateObject);

    // Remove _id from update object as it's used in the query
    const { _id, ...updateData } = updateObject;

    const result = await collectionRef.findOneAndUpdate(
      { _id: new ObjectId(documentId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result?.value) {
      const updatedDoc = await collectionRef.findOne({
        _id: new ObjectId(documentId)
      });
      
      if (!updatedDoc) {
        return {
          success: false,
          error: `Failed to retrieve updated ${collection} document`
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`Update ${collection} error:`, error);
    const errorMessage = error instanceof Error && error.message.includes("ObjectId")
      ? "Invalid document ID format"
      : error instanceof Error
        ? error.message
        : `An error occurred while updating the ${collection} document`;

    return { success: false, error: errorMessage };
  }
}