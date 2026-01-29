/**
 * Database module exports
 */

export { default as clientPromise, getDatabase } from "./client";
export { DB_NAME, COLLECTIONS, type CollectionName } from "./constants";
export { MONGODB_URI, MONGODB_OPTIONS } from "./config";
