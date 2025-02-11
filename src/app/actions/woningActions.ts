// app/actions/woningActions.ts
"use server";
import clientPromise from "@/lib/mongoDB";
import { revalidatePath } from "next/cache";
import { berekenAfgeleideWaarden } from "./rekenblad";

export async function createWoning(formData: FormData) {
  try {
    const client = await clientPromise;
    const collection = client.db("Greenbooster").collection("woningen");
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
      measurementDetails: {
        // Building type
        typeFlat: formData.get("typeFlat"),
        isGrondgebonden: formData.get("grondgebonden") === "true",
        isPortiekflat: formData.get("portiekflat") === "true",
        isGalerieflat: formData.get("galerieflat") === "true",
        
        // Basis metingen
        breed: formData.get("breed"),
        diepte: formData.get("diepte"),
        goothoogte: formData.get("goothoogte"),
        zadeldak: formData.get("zadeldak"),
        aantalWoningen: formData.get("aantalWoningen"),
        hoogte: Number(formData.get("hoogte")),
        
        // Deur metingen
        voordeur_breedte: Number(formData.get("voordeur")),
        voordeur_hoogte: Number(formData.get("voordeur_2")),
        achterdeur_breedte: Number(formData.get("achterdeur")),
        achterdeur_hoogte: Number(formData.get("achterdeur_2")),
        
        // Woonkamer ramen
        woonkamer_raam1_breedte: Number(formData.get("woonkamer_raam1")),
        woonkamer_raam1_hoogte: Number(formData.get("woonkamer_raam1_2")),
        woonkamer_raam2_breedte: Number(formData.get("woonkamer_raam2")),
        woonkamer_raam2_hoogte: Number(formData.get("woonkamer_raam2_2")),
        woonkamer_raam3_breedte: Number(formData.get("woonkamer_raam3")),
        woonkamer_raam3_hoogte: Number(formData.get("woonkamer_raam3_2")),
        woonkamer_breedte: Number(formData.get("woonkamer_width")),
        woonkamer_lengte: Number(formData.get("woonkamer_length")),
        
        // Tweede woonkamer ramen
        woonkamer2_raam1_breedte: Number(formData.get("woonkamer2_raam1")),
        woonkamer2_raam1_hoogte: Number(formData.get("woonkamer2_raam1_2")),
        woonkamer2_raam2_breedte: Number(formData.get("woonkamer2_raam2")),
        woonkamer2_raam2_hoogte: Number(formData.get("woonkamer2_raam2_2")),
        woonkamer2_raam3_breedte: Number(formData.get("woonkamer2_raam3")),
        woonkamer2_raam3_hoogte: Number(formData.get("woonkamer2_raam3_2")),
        
        // Slaapkamer 1 ramen
        slaapkamer1_raam1_breedte: Number(formData.get("slaapkamer1_raam1")),
        slaapkamer1_raam1_hoogte: Number(formData.get("slaapkamer1_raam1_2")),
        slaapkamer1_raam2_breedte: Number(formData.get("slaapkamer1_raam2")),
        slaapkamer1_raam2_hoogte: Number(formData.get("slaapkamer1_raam2_2")),
        slaapkamer1_breedte: Number(formData.get("slaapkamer1_width")),
        slaapkamer1_lengte: Number(formData.get("slaapkamer1_length")),
        
        // Tweede slaapkamer 1 ramen
        slaapkamer1_2_raam1_breedte: Number(formData.get("slaapkamer1_2_raam1")),
        slaapkamer1_2_raam1_hoogte: Number(formData.get("slaapkamer1_2_raam1_2")),
        
        // Slaapkamer 2 ramen
        slaapkamer2_raam1_breedte: Number(formData.get("slaapkamer2_raam1")),
        slaapkamer2_raam1_hoogte: Number(formData.get("slaapkamer2_raam1_2")),
        slaapkamer2_raam2_breedte: Number(formData.get("slaapkamer2_raam2")),
        slaapkamer2_raam2_hoogte: Number(formData.get("slaapkamer2_raam2_2")),
        slaapkamer2_breedte: Number(formData.get("slaapkamer2_width")),
        slaapkamer2_lengte: Number(formData.get("slaapkamer2_length")),
        
        // Kamer afmetingen
        achterkamer_breedte: Number(formData.get("achterkamer_width")),
        achterkamer_lengte: Number(formData.get("achterkamer_length")),
        slaapkamer3_breedte: Number(formData.get("slaapkamer3_width")),
        slaapkamer3_lengte: Number(formData.get("slaapkamer3_length")),
        keuken_breedte: Number(formData.get("keuken_width")),
        keuken_lengte: Number(formData.get("keuken_length")),
        badkamer_breedte: Number(formData.get("badkamer_width")),
        badkamer_lengte: Number(formData.get("badkamer_length")),
        hal_breedte: Number(formData.get("hal_width")),
        hal_lengte: Number(formData.get("hal_length")),
        toilet_breedte: Number(formData.get("toilet_width")),
        toilet_lengte: Number(formData.get("toilet_length")),
      }
    };

    const berekeningen = berekenAfgeleideWaarden(woningData);
    
    // Combineer basis data met berekende waarden
    const completeWoningData = {
      ...woningData,
      ...berekeningen
    };

    const result = await collection.insertOne(completeWoningData);

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
