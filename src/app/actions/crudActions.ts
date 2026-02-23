"use server";
import clientPromise from "@/lib/mongoDB";
import { ObjectId } from "mongodb";

interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}


export async function searchDocuments<T>(
  collectionName: string,
  searchTerm?: string,
  searchField: string = "name"
): Promise<T[]> {
  try {
    const client = await clientPromise;
    const collection = client.db("verduurzaamings-versneller").collection(collectionName);

    let query = {};
    
    if (searchTerm) {
      if (searchField === "_id") {
        try {
          query = { _id: new ObjectId(searchTerm) };
        } catch (error) {
          return [];
        }
      } else {
        query = { [searchField]: { $regex: searchTerm, $options: "i" } };
      }
    }

    const docs = await collection.find(query).toArray();
    return docs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    })) as T[];
  } catch (error) {
    console.error(`Search error in ${collectionName}:`, error);
    throw error;
  }
}

export async function createDocument<T extends { _id?: string }>(
  collectionName: string,
  document: T
): Promise<DatabaseResult<T>> {
  try {
    const client = await clientPromise;
    const collection = client.db("verduurzaamings-versneller").collection(collectionName);

    const { _id, ...documentData } = document;
    const result = await collection.insertOne(documentData);

    return { 
      success: result.acknowledged,
      data: { ...document, _id: result.insertedId.toString() }
    };
  } catch (error) {
    console.error(`Create error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed"
    };
  }
}

export async function updateDocument<T extends { _id: string }>(
  collectionName: string,
  id: string,
  document: T
): Promise<DatabaseResult<T>> {
  try {
    const client = await clientPromise;
    const collection = client.db("verduurzaamings-versneller").collection(collectionName);
    
    const { _id, ...updateData } = document;
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 1) {
      return { success: true, data: document };
    }
    if (result.matchedCount === 0) {
      return { success: false, error: "Document not found" };
    }
    return { success: false, error: "Document found but not modified" };
  } catch (error) {
    console.error(`Update error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed"
    };
  }
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<DatabaseResult<{ id: string }>> {
  try {
    const client = await clientPromise;
    const collection = client.db("verduurzaamings-versneller").collection(collectionName);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return { success: true, data: { id } };
    }

    return {
      success: false,
      error: "Document not found or could not be deleted"
    };
  } catch (error) {
    console.error(`Delete error in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deletion failed"
    };
  }
}

export async function getMeasuresByIds(
  measureIds: string[]
): Promise<any[]> {
  try {
    const client = await clientPromise;
    const collection = client.db("verduurzaamings-versneller").collection("retrofittingMeasures");

    const objectIds = measureIds.map(id => new ObjectId(id));
    const measures = await collection.find({ _id: { $in: objectIds } }).toArray();

    return measures.map((measure) => ({
      ...measure,
      _id: measure._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching measures by IDs:", error);
    return [];
  }
}