// app/actions/variableActions.ts
"use server";

import clientPromise from "@/lib/mongoDB";

export async function fetchVariables(): Promise<Array<{ variableName: string }>> {
  try {
    const client = await clientPromise;
    const collection = client.db("Greenbooster").collection("variables");
    
    const variables = await collection.find({}).toArray();
    return variables.map(variable => ({
      variableName: variable.variableName
    }));
  } catch (error) {
    console.error("Fetch variables error:", error);
    throw error;
  }
}