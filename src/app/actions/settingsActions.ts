'use server';

import clientPromise from "@/lib/mongoDB";
import { Settings, SettingsResult } from "@/types/settings";
import { revalidatePath } from "next/cache";

// Default settings if none exist in the database
const DEFAULT_SETTINGS: Settings = {
  hourlyLaborCost: 51,         // €51 per hour
  vatPercentage: 21,           // 21% BTW (VAT)
  inflationPercentage: 1,      // 1% annual inflation
  cornerHouseCorrection: -10,  // -10% correction for corner houses
  abkMaterieel: 5,             // ABK / materieel volgens begroting
  afkoop: 2,                   // Afkoop
  kostenPlanuitwerking: 3,     // Kosten t.b.v. nadere planuitwerking
  nazorgService: 1.5,          // Nazorg / Service
  carPiDicVerzekering: 1,      // CAR / PI / DIC verzekering
  bankgarantie: 0.5,           // Bankgarantie
  algemeneKosten: 8,           // Algemene kosten (AK)
  risico: 2,                   // Risico
  winst: 5,                    // Winst
  planvoorbereiding: 3,        // Planvoorbereiding
  huurdersbegeleiding: 2       // Huurdersbegeleiding
};

/**
 * Fetches application settings from the database
 */
export async function getSettings(): Promise<SettingsResult> {
  try {
    const client = await clientPromise;
    const db = client.db("verduurzaamings-versneller");
    
    // Try to get existing settings
    const settings = await db.collection('settings').findOne({});
    
    // If settings exist, return them
    if (settings) {
      // Convert _id to string to prevent serialization errors
      // Add default values for new fields if they don't exist yet
      const settingsWithDefaults = {
        _id: settings._id.toString(), // Convert ObjectId to string
        ...DEFAULT_SETTINGS, // Provide defaults for all fields
        ...settings, // Override with existing values from DB
        _id: settings._id.toString() // Keep the ID at the end to ensure it's a string
      };
      
      // Remove profitPercentage if it exists (we're replacing it with new fields)
      if ('profitPercentage' in settingsWithDefaults) {
        delete settingsWithDefaults.profitPercentage;
      }
      
      return { 
        success: true, 
        data: settingsWithDefaults
      };
    }
    
    // If no settings exist, create default settings
    const result = await db.collection('settings').insertOne(DEFAULT_SETTINGS);
    
    if (result.acknowledged) {
      return { 
        success: true, 
        data: { 
          _id: result.insertedId.toString(), // Convert ObjectId to string
          ...DEFAULT_SETTINGS 
        }
      };
    }
    
    return { 
      success: false, 
      error: "Failed to initialize settings"
    };
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch settings"
    };
  }
}

/**
 * Updates application settings
 */
export async function updateSettings(settings: Settings): Promise<SettingsResult> {
  try {
    const client = await clientPromise;
    const db = client.db("verduurzaamings-versneller");
    
    // Check if settings already exist
    const existingSettings = await db.collection('settings').findOne({});
    
    // Prepare settings object for update (remove _id if present)
    const settingsToUpdate = { ...settings };
    if ('_id' in settingsToUpdate) {
      delete settingsToUpdate._id;
    }
    
    let result;
    
    if (existingSettings) {
      // Update existing settings
      result = await db.collection('settings').updateOne(
        { _id: existingSettings._id },
        { $set: settingsToUpdate }
      );
      
      if (result.modifiedCount === 1) {
        // Revalidate paths where settings might be used
        revalidatePath('/admin/instellingen');
        revalidatePath('/kosten-berekening');
        
        return { 
          success: true, 
          data: {
            _id: existingSettings._id.toString(), // Convert ObjectId to string
            ...settingsToUpdate
          }
        };
      }
    } else {
      // Create new settings if they don't exist
      result = await db.collection('settings').insertOne(settingsToUpdate);
      
      if (result.acknowledged) {
        // Revalidate paths where settings might be used
        revalidatePath('/admin/instellingen');
        revalidatePath('/kosten-berekening');
        
        return { 
          success: true, 
          data: {
            _id: result.insertedId.toString(), // Convert ObjectId to string
            ...settingsToUpdate
          }
        };
      }
    }
    
    return { 
      success: false, 
      error: "Failed to update settings"
    };
    
  } catch (error) {
    console.error('Error updating settings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update settings"
    };
  }
}