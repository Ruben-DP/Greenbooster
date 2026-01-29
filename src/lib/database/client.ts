import { MongoClient, Db } from "mongodb";
import { MONGODB_URI, MONGODB_OPTIONS } from "./config";
import { DB_NAME } from "./constants";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the client across hot reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, MONGODB_OPTIONS);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, create a new client for each connection
  client = new MongoClient(MONGODB_URI, MONGODB_OPTIONS);
  clientPromise = client.connect();
}

/**
 * Get a MongoDB client promise
 * @returns Promise<MongoClient>
 */
export default clientPromise;

/**
 * Get the database instance
 * @returns Promise<Db>
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

/**
 * Export client promise for backward compatibility
 */
export { clientPromise };
