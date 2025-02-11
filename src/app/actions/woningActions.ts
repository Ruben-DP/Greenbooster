// app/actions/woningActions.ts
"use server";
import clientPromise from "@/lib/mongoDB";
import { revalidatePath } from "next/cache";
import { berekenAfgeleideWaarden } from "./rekenblad";

export async function createWoning(formData: FormData) {
  try {
    const client = await clientPromise;
    const collection = client.db("Greenbooster").collection("woningen");
    
    // Get the typeId from the form
    const typeId = formData.get("typeId");

    const woningData = {
      projectInformation: {
        projectNumber: formData.get("projectNumber"),
        complexName: formData.get("complexName"),
        aantalVHE: Number(formData.get("aantalVHE")),
        adres: formData.get("adres"),
        postcode: formData.get("postcode"),
        plaats: formData.get("plaats"),
        renovatieJaar: Number(formData.get("renovatieJaar")),
        bouwPeriode: formData.get("bouwPeriode"),
      },
      energyDetails: {
        huidigLabel: formData.get("huidigLabel"),
        huidigEnergie: Number(formData.get("huidigEnergie")),
        voorkostenScenario: formData.get("voorkostenScenario"),
        nieuwLabel: formData.get("nieuwLabel"),
        labelStappen: formData.get("labelStappen"),
        huidigVerbruik: Number(formData.get("huidigVerbruik")),
        huidigEnergieprijs: Number(formData.get("huidigEnergieprijs")),
      },
      typeId: typeId, // Store the type reference
      isGrondgebonden: formData.get("grondgebonden") === "true",
      isPortiekflat: formData.get("portiekflat") === "true",
      isGalerieflat: formData.get("galerieflat") === "true",
    };

    const result = await collection.insertOne(woningData);

    if (result.acknowledged) {
      revalidatePath("/woningen");
      return { success: true };
    }

    return {
      success: false,
      error: "Failed to create woning",
    };
  } catch (error) {
    console.error("Create error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

export async function updateWoning(id: string, formData: FormData) {
  try {
    const client = await clientPromise;
    const collection = client.db("Greenbooster").collection("woningen");

    // Convert FormData to object and parse nested structure
    const updateData = {
      projectInformation: {
        projectNumber: formData.get("projectNumber"),
        complexName: formData.get("complexName"),
        aantalVHE: Number(formData.get("aantalVHE")),
        // ... other fields
      },
      // ... other sections
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 1) {
      revalidatePath("/woningen");
      return { success: true };
    }

    return {
      success: false,
      error:
        result.matchedCount === 0
          ? "Document not found"
          : "Document found but not modified",
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function searchWoningen(searchTerm?: string) {
  try {
    const client = await clientPromise;
    const collection = client.db("Greenbooster").collection("woningen");

    const query = searchTerm
      ? {
          $or: [
            {
              "projectInformation.projectNumber": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              "projectInformation.complexName": {
                $regex: searchTerm,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const docs = await collection.find(query).toArray();

    return {
      success: true,
      data: docs.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })),
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}
