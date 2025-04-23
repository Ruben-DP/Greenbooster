'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

interface SaveCalculationData {
  woningId: string;
  typeId: string;
  measures: {
    id?: string; // Optional since some measures might not have an ID in the database
    name: string;
    group?: string;
    price?: number;
    heatDemandValue?: number;
    maintenanceCostPerYear?: number;
  }[];
  totalBudget: number;
  totalHeatDemand: number;
  name?: string; // Optional name for the saved calculation
}

export async function saveCalculation(data: SaveCalculationData) {
  try {
    const { db } = await connectToDatabase();
    
    const savedCalculation = {
      ...data,
      savedAt: new Date(),
    };
    
    const result = await db.collection('savedCalculations').insertOne(savedCalculation);
    
    // Revalidate any cached data on the calculation page
    revalidatePath('/kosten-berekening');
    
    return { 
      success: true, 
      id: result.insertedId.toString(),
      message: 'Berekening succesvol opgeslagen' 
    };
  } catch (error) {
    console.error('Error saving calculation:', error);
    return { 
      success: false, 
      message: 'Fout bij het opslaan van de berekening' 
    };
  }
}

// Function to get saved calculations
export async function getSavedCalculations() {
  try {
    const { db } = await connectToDatabase();
    
    const calculations = await db
      .collection('savedCalculations')
      .find({})
      .sort({ savedAt: -1 })
      .toArray();
    
    return { 
      success: true, 
      data: calculations 
    };
  } catch (error) {
    console.error('Error fetching saved calculations:', error);
    return { 
      success: false, 
      message: 'Fout bij het ophalen van opgeslagen berekeningen',
      data: []
    };
  }
}

// Function to get a specific saved calculation by ID
export async function getSavedCalculationById(id: string) {
  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = require('mongodb');
    
    const calculation = await db
      .collection('savedCalculations')
      .findOne({ _id: new ObjectId(id) });
    
    if (!calculation) {
      return {
        success: false,
        message: 'Berekening niet gevonden',
      };
    }
    
    return { 
      success: true, 
      data: calculation 
    };
  } catch (error) {
    console.error('Error fetching saved calculation:', error);
    return { 
      success: false, 
      message: 'Fout bij het ophalen van de opgeslagen berekening'
    };
  }
}