'use server';

import clientPromise from "@/lib/mongoDB";
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';

interface ProfileMeasure {
  id: string;
  name: string;
  group?: string;
  price?: number;
  heatDemandValue?: number;
  maintenanceCostPerYear?: number;
}

interface SaveProfileData {
  woningId: string;
  typeId: string;
  measures: ProfileMeasure[];
  totalBudget: number;
  totalHeatDemand: number;
  name: string; // Name for the profile
}

export async function saveProfile(data: SaveProfileData) {
  try {
    const client = await clientPromise;
    const db = client.db("verduurzaamings-versneller");
    
    const profileData = {
      ...data,
      savedAt: new Date(),
    };
    
    const result = await db.collection('residenceProfiles').insertOne(profileData);
    
    // Revalidate any cached data
    revalidatePath('/kosten-berekening');
    revalidatePath('/vergelijken');
    
    return { 
      success: true, 
      id: result.insertedId.toString(),
      message: 'Profiel succesvol opgeslagen' 
    };
  } catch (error) {
    console.error('Error saving profile:', error);
    return { 
      success: false, 
      message: 'Fout bij het opslaan van het profiel' 
    };
  }
}

// Function to get saved profiles
export async function getSavedProfiles() {
  try {
    const client = await clientPromise;
    const db = client.db("verduurzaamings-versneller");
    
    const profiles = await db
      .collection('residenceProfiles')
      .find({})
      .sort({ savedAt: -1 })
      .toArray();
    
    return { 
      success: true, 
      data: profiles.map(profile => ({
        ...profile,
        _id: profile._id.toString()
      }))
    };
  } catch (error) {
    console.error('Error fetching saved profiles:', error);
    return { 
      success: false, 
      message: 'Fout bij het ophalen van opgeslagen profielen',
      data: []
    };
  }
}

// Function to get a specific saved profile by ID
export async function getProfileById(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("verduurzaamings-versneller");
    
    const profile = await db
      .collection('residenceProfiles')
      .findOne({ _id: new ObjectId(id) });
    
    if (!profile) {
      return {
        success: false,
        message: 'Profiel niet gevonden',
      };
    }
    
    return { 
      success: true, 
      data: {
        ...profile,
        _id: profile._id.toString()
      }
    };
  } catch (error) {
    console.error('Error fetching saved profile:', error);
    return { 
      success: false, 
      message: 'Fout bij het ophalen van het opgeslagen profiel'
    };
  }
}

// Function to delete a saved profile
export async function deleteProfile(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("verduurzaamings-versneller");
    
    const result = await db
      .collection('residenceProfiles')
      .deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return {
        success: false,
        message: 'Profiel niet gevonden',
      };
    }
    
    // Revalidate any cached data
    revalidatePath('/vergelijken');
    
    return { 
      success: true, 
      message: 'Profiel succesvol verwijderd' 
    };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { 
      success: false, 
      message: 'Fout bij het verwijderen van het profiel'
    };
  }
}