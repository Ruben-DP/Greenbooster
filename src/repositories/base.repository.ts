import { Collection, ObjectId, WithId, Document } from "mongodb";
import { getDatabase } from "@/lib/database";

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Base repository providing generic CRUD operations
 */
export class BaseRepository<T extends { _id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Get the MongoDB collection
   */
  protected async getCollection(): Promise<Collection<Document>> {
    const db = await getDatabase();
    return db.collection(this.collectionName);
  }

  /**
   * Search documents with optional filtering
   */
  async search(
    searchTerm?: string,
    searchField: string = "name"
  ): Promise<T[]> {
    try {
      const collection = await this.getCollection();
      let query: any = {};

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
      console.error(`Search error in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const collection = await this.getCollection();
      const doc = await collection.findOne({ _id: new ObjectId(id) });

      if (!doc) return null;

      return {
        ...doc,
        _id: doc._id.toString(),
      } as T;
    } catch (error) {
      console.error(`Find by ID error in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Find all documents
   */
  async findAll(): Promise<T[]> {
    try {
      const collection = await this.getCollection();
      const docs = await collection.find({}).toArray();

      return docs.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as T[];
    } catch (error) {
      console.error(`Find all error in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async create(document: T): Promise<DatabaseResult<T>> {
    try {
      const collection = await this.getCollection();
      const { _id, ...documentData } = document;
      const result = await collection.insertOne(documentData as any);

      return {
        success: result.acknowledged,
        data: { ...document, _id: result.insertedId.toString() },
      };
    } catch (error) {
      console.error(`Create error in ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Creation failed",
      };
    }
  }

  /**
   * Update a document by ID
   */
  async update(id: string, document: T): Promise<DatabaseResult<T>> {
    try {
      const collection = await this.getCollection();
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
      console.error(`Update error in ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string): Promise<DatabaseResult<{ id: string }>> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 1) {
        return { success: true, data: { id } };
      }

      return {
        success: false,
        error: "Document not found or could not be deleted",
      };
    } catch (error) {
      console.error(`Delete error in ${this.collectionName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Deletion failed",
      };
    }
  }

  /**
   * Find one document by query
   */
  async findOne(query: any): Promise<T | null> {
    try {
      const collection = await this.getCollection();
      const doc = await collection.findOne(query);

      if (!doc) return null;

      return {
        ...doc,
        _id: doc._id.toString(),
      } as T;
    } catch (error) {
      console.error(`Find one error in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Count documents matching query
   */
  async count(query: any = {}): Promise<number> {
    try {
      const collection = await this.getCollection();
      return await collection.countDocuments(query);
    } catch (error) {
      console.error(`Count error in ${this.collectionName}:`, error);
      throw error;
    }
  }
}
