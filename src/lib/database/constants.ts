/**
 * Database configuration constants
 */

export const DB_NAME = "main-db";

export const COLLECTIONS = {
  WONINGEN: "woningen",
  RETROFITTING_MEASURES: "retrofittingMeasures",
  VARIABLES: "variables",
  TYPES: "types",
  SETTINGS: "settings",
  RESIDENCE_PROFILES: "residenceProfiles",
  SAVED_CALCULATIONS: "savedCalculations",
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
