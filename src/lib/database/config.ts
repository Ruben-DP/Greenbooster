import { MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

export const MONGODB_URI = process.env.MONGODB_URI;

// Database connection options
// Using temporary mobile hotspot connection settings
export const MONGODB_OPTIONS: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
};

// For standard connections, use these options instead:
// export const MONGODB_OPTIONS: MongoClientOptions = {
//   maxPoolSize: 10,
//   minPoolSize: 5,
// };
