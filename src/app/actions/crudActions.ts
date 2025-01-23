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
    const collection = client.db("Greenbooster").collection(collectionName);

    const query = searchTerm
      ? { [searchField]: { $regex: searchTerm, $options: "i" } }
      : {};

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
    const collection = client.db("Greenbooster").collection(collectionName);

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
    const collection = client.db("Greenbooster").collection(collectionName);
    
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