"use server";
import clientPromise from "@/lib/mongoDB";
import { buildMeasureQuery, Measure, MEASURES_COLLECTION } from "@/types/measures";

const databaseName = "Greenbooster";
const searchResultLimit = 8;

// Helper function to serialize MongoDB documents (all types)
function serializeDocument(doc: any): any {
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

interface SearchResponse {
  success: boolean;
  total?: number;
  searchableFields?: string[];
  results?: Measure[];
  error?: string;
}

export async function searchData(
  collection: string,
  projection: any,
  searchTerm?: string
): Promise<SearchResponse> {
  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const coll = db.collection(collection);

    let query = {};
    // Only build search query if searchTerm is not empty
    if (searchTerm && searchTerm.trim()) {
      query = buildMeasureQuery(searchTerm);
    }

    const results = await coll
      .find(query)  // Empty query {} will return all documents
      .project(projection)
      .limit(searchResultLimit)
      .toArray();

    const serializedResults = results.map(serializeDocument);

    return {
      success: true,
      total: serializedResults.length,
      results: serializedResults,
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}