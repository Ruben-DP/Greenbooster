'use server';

import clientPromise from "@/lib/mongoDB";
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';

interface SaveScenarioData {
  name: string;
  measureIds: string[];
  woningId?: string;
}

export async function saveScenario(data: SaveScenarioData) {
  try {
    const client = await clientPromise;
    const db = client.db("main-db");

    const scenarioData = {
      naam: data.name, // Using 'naam' to match the pattern of other collections
      measureIds: data.measureIds,
      woningId: data.woningId,
      createdAt: new Date(),
    };

    const result = await db.collection('scenarios').insertOne(scenarioData);

    // Revalidate any cached data
    revalidatePath('/admin/scenarios');
    revalidatePath('/kosten-berekening');

    return {
      success: true,
      id: result.insertedId.toString(),
      message: 'Scenario succesvol opgeslagen'
    };
  } catch (error) {
    console.error('Error saving scenario:', error);
    return {
      success: false,
      message: 'Fout bij het opslaan van het scenario'
    };
  }
}

// Function to get saved scenarios
export async function getSavedScenarios() {
  try {
    const client = await clientPromise;
    const db = client.db("main-db");

    const scenarios = await db
      .collection('scenarios')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: scenarios.map(scenario => ({
        ...scenario,
        _id: scenario._id.toString()
      }))
    };
  } catch (error) {
    console.error('Error fetching saved scenarios:', error);
    return {
      success: false,
      message: 'Fout bij het ophalen van opgeslagen scenarios',
      data: []
    };
  }
}

// Function to get a specific scenario by ID
export async function getScenarioById(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("main-db");

    const scenario = await db
      .collection('scenarios')
      .findOne({ _id: new ObjectId(id) });

    if (!scenario) {
      return {
        success: false,
        message: 'Scenario niet gevonden',
      };
    }

    return {
      success: true,
      data: {
        ...scenario,
        _id: scenario._id.toString()
      }
    };
  } catch (error) {
    console.error('Error fetching saved scenario:', error);
    return {
      success: false,
      message: 'Fout bij het ophalen van het opgeslagen scenario'
    };
  }
}

// Function to delete a saved scenario
export async function deleteScenario(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db("main-db");

    const result = await db
      .collection('scenarios')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: 'Scenario niet gevonden',
      };
    }

    // Revalidate any cached data
    revalidatePath('/admin/scenarios');

    return {
      success: true,
      message: 'Scenario succesvol verwijderd'
    };
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return {
      success: false,
      message: 'Fout bij het verwijderen van het scenario'
    };
  }
}

// Function to get measures by their IDs
export async function getMeasuresByIds(measureIds: string[]) {
  try {
    const client = await clientPromise;
    const db = client.db("main-db");

    // Convert string IDs to ObjectIds
    const objectIds = measureIds.map(id => new ObjectId(id));

    const measures = await db
      .collection('retrofittingMeasures')
      .find({ _id: { $in: objectIds } })
      .toArray();

    return {
      success: true,
      data: measures.map(measure => ({
        ...measure,
        _id: measure._id.toString()
      }))
    };
  } catch (error) {
    console.error('Error fetching measures by IDs:', error);
    return {
      success: false,
      message: 'Fout bij het ophalen van maatregelen',
      data: []
    };
  }
}
