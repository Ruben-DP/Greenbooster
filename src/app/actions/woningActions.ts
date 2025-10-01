// src/app/actions/woningActions.ts
// Fixed woningActions.ts
"use server";
import clientPromise from "@/lib/mongoDB";
import { revalidatePath } from "next/cache";

export async function createWoning(formData: FormData) {
  try {
    const client = await clientPromise;
    const collection = client.db("main-db").collection("woningen");
    
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
        huidigVerbruik: Number(formData.get("huidigEnergieVerbruik")), // FIXED: mapping correct field
        huidigEnergieprijs: Number(formData.get("huidigEnergieprijs")), // FIXED: consistent field name
      },
      typeId: typeId,
      isGrondgebonden: formData.get("grondgebonden") === "true",
      isPortiekflat: formData.get("portiekflat") === "true",
      isGalerieflat: formData.get("galerieflat") === "true",
      dimensions: {
        breed: formData.get("breed"),
        diepte: formData.get("diepte"),
        goothoogte: formData.get("goothoogte"),
        nokhoogte: formData.get("nokhoogte"),
        aantalwoningen: formData.get("aantalwoningen"),
        kopgevels: formData.get("kopgevels"),
        breedtecomplex: formData.get("breedtecomplex"),
        portieken: formData.get("portieken"),
        bouwlagen: formData.get("bouwlagen")
      },
      measures: [] // Initialize with an empty array of measures
    };

    const result = await collection.insertOne(woningData);

    if (result.acknowledged) {
      revalidatePath("/woningen");
      return { 
        success: true,
        data: {
          _id: result.insertedId.toString()
        }
      };
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
    const collection = client.db("main-db").collection("woningen");
    const { ObjectId } = require('mongodb');

    // Convert FormData to object and parse nested structure
    const updateData = {
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
        huidigVerbruik: Number(formData.get("huidigEnergieVerbruik")), // FIXED: consistent field mapping
        huidigEnergieprijs: Number(formData.get("huidigEnergieprijs")), // FIXED: consistent field name
      },
      typeId: formData.get("typeId"),
      isGrondgebonden: formData.get("grondgebonden") === "true",
      isPortiekflat: formData.get("portiekflat") === "true",
      isGalerieflat: formData.get("galerieflat") === "true",
      dimensions: {
        breed: formData.get("breed"),
        diepte: formData.get("diepte"),
        goothoogte: formData.get("goothoogte"),
        nokhoogte: formData.get("nokhoogte"),
        aantalwoningen: formData.get("aantalwoningen"),
        kopgevels: formData.get("kopgevels"),
        breedtecomplex: formData.get("breedtecomplex"),
        portieken: formData.get("portieken"),
        bouwlagen: formData.get("bouwlagen")
      }
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
    const collection = client.db("main-db").collection("woningen");

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

export async function updateWoningMeasures(id: string, measures: any[]) {
  try {
    const client = await clientPromise;
    const collection = client.db("main-db").collection("woningen");
    const { ObjectId } = require('mongodb');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { measures: measures } }
    );

    if (result.modifiedCount === 1 || result.matchedCount === 1) {
      revalidatePath("/kosten-berekening");
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