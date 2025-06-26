import React, { useEffect, useState } from "react";
import { WoningType } from "@/types/woning";

// Types and Interfaces

interface Dimensions {
  breed: string;
  diepte: string;
  goothoogte: string;
  nokhoogte: string;
  aantalwoningen: string;
  bouwlagen: string;
  breedtecomplex: string;
  kopgevels: string;
  portieken: string;
}

interface KozijnDetails {
  type: string;
  breedte: number;
  hoogte: number;
  oppervlakte: number;
  rendement: number;
  omtrek: number;
}
interface KozijnGrootte {
  tot1M2: number;
  tot1_5M2: number;
  tot2M2: number;
  tot2_5M2: number;
  tot3M2: number;
  tot3_5M2: number;
  tot4M2: number;
  boven4M2: number;
}

interface WoningSpecifiek {
  breedte: number;
  diepte: number;
  gootHoogte: number;
  nokHoogte: number;
  aantalWoningen: number;
  heeftPlatDak: boolean;
  bouwlagen?: number;
  breedteComplex?: number;
  kopgevels?: number;
  portieken?: number;
}

interface CalculationResults {
  // Basic measurements
  woningSpecifiek: WoningSpecifiek;

  // Base surfaces
  gevelOppervlakVoor: number;
  gevelOppervlakAchter: number;
  gevelOppervlakTotaal: number;

  // Roof calculations
  dakOppervlak: number;
  dakOppervlakTotaal: number;
  dakLengte: number;
  dakLengteTotaal: number;
  lengteDakvlak: number; // Field for roof surface length
  lengteDakvlakPlusBreedteWoning: number; // Field for roof surface length plus house width

  // Floor calculations
  vloerOppervlak: number;
  vloerOppervlakTotaal: number;
  oppervlakteKelder: number; // Nieuw toegevoegde variabele

  // Kozijn details
  kozijnenVoorgevel: KozijnDetails[];
  kozijnenAchtergevel: KozijnDetails[];

  // Kozijn measurements
  kozijnOppervlakVoorTotaal: number;
  kozijnOppervlakAchterTotaal: number;
  kozijnOppervlakTotaal: number;
  kozijnOppervlakteWoning: number;
  kozijnRendementTotaal: number;
  kozijnOmtrekTotaal: number;

  // Gevel netto
  NettoGevelOppervlak: number;

  // Project totals
  projectGevelOppervlak: number;
  projectKozijnenOppervlak: number;
  projectDakOppervlak: number;

  // Additional roof measurements
  dakOverstekOppervlak: number;
  dakTotaalMetOverhang: number;

  // Project circumference
  projectOmtrek: number;

  // Kozijn grouping by size
  kozijnenPerGrootte: KozijnGrootte;

  // PV panel calculations (new)
  aantalPVPanelenGGB: number;
  oppervlaktePVPanelenGGB: number;
  aantalPVPanelenKop: number;
  aantalPVPanelenLangs: number;
  oppervlaktePVPanelenKop: number;
  oppervlaktePVPanelenLangs: number;

  // Error tracking
  missingInputs: string[];
  calculationWarnings: string[];

  // Calculation explanations (new)
  calculationExplanations: Record<string, string>;

  omtrekDraaidelen: number;
  omtrekKozijnen: number;
  omtrekVoordeur: number;
  vensterbankLengte: number;
  omtrekAchterdeur: number;
  oppervlakteHal: number;
  aantalSlaapkamers: number;
}

interface Props {
  dimensions: Dimensions;
  woningType: WoningType | null;
  onCalculate: (calculations: CalculationResults) => void;
}

export const CalculationHandler: React.FC<Props> = ({
  dimensions,
  woningType,
  onCalculate,
}) => {
  const [calculations, setCalculations] = useState<CalculationResults | null>(
    null
  );

  const calculateExtraMetingen = (
    woningSpecifiek: WoningSpecifiek,
    woningType: WoningType,
    kozijnInfo: any,
    explanations: Record<string, string>
  ) => {
    const { kozijnenVoorgevel, kozijnenAchtergevel } = kozijnInfo;

    // Calculate omtrekKozijnen (total perimeter of all window frames)
    const omtrekKozijnen = [
      ...kozijnenVoorgevel,
      ...kozijnenAchtergevel,
    ].reduce((sum, k) => sum + k.omtrek, 0);
    explanations[
      "omtrekKozijnen"
    ] = `Totale omtrek van alle kozijnen = ${omtrekKozijnen}`;

    // Calculate omtrekDraaidelen (perimeter of rotating parts - assume 60% of windows have rotating parts)
    const omtrekDraaidelen = omtrekKozijnen * 0.6;
    explanations[
      "omtrekDraaidelen"
    ] = `${omtrekKozijnen} (omtrekKozijnen) × 0.6 = ${omtrekDraaidelen}`;

    // Calculate vensterbankLengte (window sill length - assume bottom width of all windows)
    const vensterbankLengte = [
      ...kozijnenVoorgevel,
      ...kozijnenAchtergevel,
    ].reduce((sum, k) => sum + k.breedte, 0);
    explanations[
      "vensterbankLengte"
    ] = `Som van alle kozijn breedtes = ${vensterbankLengte}`;

    // Calculate omtrekVoordeur (perimeter of front door)
    let omtrekVoordeur = 0;
    if (woningType.voorgevelKozijnen && woningType.voorgevelKozijnen.voordeur) {
      const voordeur = woningType.voorgevelKozijnen.voordeur;
      omtrekVoordeur = (voordeur.breedte + voordeur.hoogte) * 2;
      explanations[
        "omtrekVoordeur"
      ] = `(${voordeur.breedte} + ${voordeur.hoogte}) × 2 = ${omtrekVoordeur}`;
    } else {
      explanations[
        "omtrekVoordeur"
      ] = `Geen voordeur gedefinieerd, omtrekVoordeur = 0`;
    }

    // Calculate omtrekAchterdeur (perimeter of back door)
    let omtrekAchterdeur = 0;
    if (
      woningType.achtergevelKozijnen &&
      woningType.achtergevelKozijnen.achterdeur
    ) {
      const achterdeur = woningType.achtergevelKozijnen.achterdeur;
      omtrekAchterdeur = (achterdeur.breedte + achterdeur.hoogte) * 2;
      explanations[
        "omtrekAchterdeur"
      ] = `(${achterdeur.breedte} + ${achterdeur.hoogte}) × 2 = ${omtrekAchterdeur}`;
    } else {
      explanations[
        "omtrekAchterdeur"
      ] = `Geen achterdeur gedefinieerd, omtrekAchterdeur = 0`;
    }

    // Calculate oppervlakteHal (area of the hallway)
    let oppervlakteHal = 0;
    if (woningType.ruimten && woningType.ruimten.hal) {
      oppervlakteHal =
        woningType.ruimten.hal.breedte * woningType.ruimten.hal.diepte;
      explanations[
        "oppervlakteHal"
      ] = `${woningType.ruimten.hal.breedte} × ${woningType.ruimten.hal.diepte} = ${oppervlakteHal}`;
    } else {
      // Default calculation if not specified - assume 5% of total floor area
      const vloerOppervlak = woningSpecifiek.breedte * woningSpecifiek.diepte;
      oppervlakteHal = vloerOppervlak * 0.05;
      explanations[
        "oppervlakteHal"
      ] = `${vloerOppervlak} (vloerOppervlak) × 0.05 = ${oppervlakteHal} (standaard berekening)`;
    }

    // Calculate aantalSlaapkamers (number of bedrooms)
    let aantalSlaapkamers = 0;
    if (woningType.ruimten) {
      const definedSlaapkamers = Object.keys(woningType.ruimten).filter(
        (key) => {
          const isSlaapkamer = key.startsWith("slaapkamer");
          const hasDimensions =
            woningType.ruimten[key] &&
            woningType.ruimten[key].breedte > 0 &&
            woningType.ruimten[key].hoogte > 0;
          return isSlaapkamer && hasDimensions;
        }
      );
      aantalSlaapkamers = definedSlaapkamers.length;
    }

    if (aantalSlaapkamers > 0) {
      explanations[
        "aantalSlaapkamers"
      ] = `Aantal gedefinieerde slaapkamers in woningType = ${aantalSlaapkamers}`;
    } else {
      // Fallback to default if no bedrooms are defined with valid dimensions
      aantalSlaapkamers = 3;
      explanations[
        "aantalSlaapkamers"
      ] = `Geen slaapkamers met valide afmetingen gevonden, standaard waarde wordt gebruikt = ${aantalSlaapkamers}`;
    }

    return {
      omtrekDraaidelen,
      omtrekKozijnen,
      omtrekVoordeur,
      vensterbankLengte,
      omtrekAchterdeur,
      oppervlakteHal,
      aantalSlaapkamers,
    };
  };

  // Main calculation function that orchestrates all calculations
  const updateCalculations = () => {
    if (!dimensions || !woningType) return;

    const errors: string[] = [];
    const warnings: string[] = [];
    const explanations: Record<string, string> = {};

    // Step 1: Parse dimensions
    const woningSpecifiek = parseDimensions(dimensions, errors);

    const kozijnInfo = calculateKozijnen(woningType, explanations);
    const basisMaten = calculateBasisMaten(
      woningSpecifiek,
      explanations,
      woningType
    );
    const afgeLeideMaten = calculateAfgeLeideMaten(
      woningSpecifiek,
      kozijnInfo,
      basisMaten,
      explanations
    );
    const projectTotalen = calculateProjectTotalen(
      woningSpecifiek,
      basisMaten,
      kozijnInfo,
      explanations
    );
    const pvPanelenInfo = calculatePVPanelen(
      woningSpecifiek,
      basisMaten,
      explanations
    );

    // Add the new extra measurements calculation
    const extraMetingen = calculateExtraMetingen(
      woningSpecifiek,
      woningType,
      kozijnInfo,
      explanations
    );

    // Combine all results
    const results: CalculationResults = {
      woningSpecifiek,
      ...basisMaten,
      ...kozijnInfo,
      ...afgeLeideMaten,
      ...projectTotalen,
      ...pvPanelenInfo,
      ...extraMetingen, // Add the new calculations
      missingInputs: errors,
      calculationWarnings: warnings,
      calculationExplanations: explanations,
    };

    setCalculations(results);
    onCalculate(results);

    // Group calculations by category for more organized logging
    console.groupCollapsed("[CalculationHandler] Alle berekeningsdetails");

    // Group calculations by category for more organized logging
    console.groupCollapsed("[CalculationHandler] Alle berekeningsdetails");

    // Basic measurements
    console.groupCollapsed("Basis Afmetingen (woningSpecifiek)");
    console.log(woningSpecifiek);
    console.groupEnd();

    // Gevel
    console.groupCollapsed("Gevel Berekeningen");
    logExplanationsByPrefix(explanations, "gevelOppervlak");
    logExplanationsByPrefix(explanations, "NettoGevelOppervlak");

    console.groupEnd();

    // Dak
    console.groupCollapsed("Dak Berekeningen");
    logExplanationsByPrefix(explanations, "dakOppervlak");
    logExplanationsByPrefix(explanations, "dakLengte");
    logExplanationsByPrefix(explanations, "dakTotaal");
    logExplanationsByPrefix(explanations, "dakOverstek");
    logExplanationsByPrefix(explanations, "lengteDakvlak");
    console.groupEnd();

    // Kozijnen
    console.groupCollapsed("Kozijnen Berekeningen");
    logExplanationsByPrefix(explanations, "kozijn");
    console.groupEnd();

    // Vloer
    console.groupCollapsed("Vloer Berekeningen");
    logExplanationsByPrefix(explanations, "vloerOppervlak");
    logExplanationsByPrefix(explanations, "oppervlakteKelder");
    console.groupEnd();

    // PV Panelen (new)
    console.groupCollapsed("PV Panelen Berekeningen");
    logExplanationsByPrefix(explanations, "aantalPV");
    logExplanationsByPrefix(explanations, "oppervlaktePV");
    console.groupEnd();

    // Project totals
    console.groupCollapsed("Project Totalen");
    logExplanationsByPrefix(explanations, "project");
    console.groupEnd();

    console.groupEnd(); // End of all calculation details

    console.groupCollapsed("Extra Metingen");
    logExplanationsByPrefix(explanations, "omtrek");
    logExplanationsByPrefix(explanations, "vensterbank");
    logExplanationsByPrefix(explanations, "oppervlakteHal");
    logExplanationsByPrefix(explanations, "aantalSlaapkamers");
    console.groupEnd();

    console.groupEnd(); // End of all calculation details
  };

  // Helper function to log explanations by prefix
  const logExplanationsByPrefix = (
    explanations: Record<string, string>,
    prefix: string
  ) => {
    Object.entries(explanations)
      .filter(([key]) => key.startsWith(prefix))
      .forEach(([key, explanation]) => {
        console.log(`${key}: ${explanation}`);
      });
  };

  // Parse dimensions strings to numbers
  const parseDimensions = (
    dim: Dimensions,
    errors: string[]
  ): WoningSpecifiek => {
    // Parse required dimensions
    const breedte = parseFloat(dim.breed.replace(",", "."));
    const diepte = parseFloat(dim.diepte.replace(",", "."));
    const gootHoogte = parseFloat(dim.goothoogte.replace(",", "."));
    const nokHoogte = parseFloat(dim.nokhoogte.replace(",", "."));
    const aantalWoningen = parseInt(dim.aantalwoningen);
    const heeftPlatDak = gootHoogte === nokHoogte || nokHoogte === undefined;

    // Parse optional dimensions
    const bouwlagen = dim.bouwlagen ? parseInt(dim.bouwlagen) : undefined;
    const breedteComplex = dim.breedtecomplex
      ? parseFloat(dim.breedtecomplex.replace(",", "."))
      : undefined;
    const kopgevels = dim.kopgevels ? parseInt(dim.kopgevels) : undefined;
    const portieken = dim.portieken ? parseInt(dim.portieken) : undefined;

    // Validate parsed values
    if (isNaN(breedte)) errors.push("Breedte is ongeldig");
    if (isNaN(diepte)) errors.push("Diepte is ongeldig");
    if (isNaN(gootHoogte)) errors.push("Goothoogte is ongeldig");
    if (isNaN(nokHoogte)) errors.push("Nokhoogte is ongeldig");
    if (isNaN(aantalWoningen)) errors.push("Aantal woningen is ongeldig");

    return {
      breedte,
      diepte,
      gootHoogte,
      nokHoogte,
      aantalWoningen,
      heeftPlatDak,
      bouwlagen,
      breedteComplex,
      kopgevels,
      portieken,
    };
  };

  // Calculate PV panel related values (new function)
  const calculatePVPanelen = (
    woningSpecifiek: WoningSpecifiek,
    basisMaten: any,
    explanations: Record<string, string>
  ) => {
    const {
      breedte,
      diepte,
      gootHoogte,
      nokHoogte,
      aantalWoningen,
      heeftPlatDak,
    } = woningSpecifiek;
    const { lengteDakvlak } = basisMaten;

    // Constants for PV panel dimensions
    const pvPaneelBreedte = 1.096; // From cell C113
    const pvPaneelHoogte = 1.754; // From cell C114

    // Calculate AantalPVPanelenGGB
    // First calculate PV in breedte (corresponds to C117)
    const pvInBreedte = Math.floor(breedte / pvPaneelBreedte);
    explanations[
      "aantalPVInBreedte"
    ] = `Math.floor(${breedte} (breedte) / ${pvPaneelBreedte} (pvPaneelBreedte)) = ${pvInBreedte}`;

    // Then calculate PV in diepte (corresponds to C118)
    const pvInDiepte = Math.floor(lengteDakvlak / pvPaneelHoogte - 1);
    explanations[
      "aantalPVInDiepte"
    ] = `Math.floor((${lengteDakvlak} (lengteDakvlak) / ${pvPaneelHoogte} (pvPaneelHoogte)) - 1) = ${pvInDiepte}`;

    // Calculate AantalPVPanelenGGB (corresponds to C119)
    const aantalPVPanelenGGB = pvInBreedte * pvInDiepte;
    explanations[
      "aantalPVPanelenGGB"
    ] = `${pvInBreedte} (pvInBreedte) × ${pvInDiepte} (pvInDiepte) = ${aantalPVPanelenGGB}`;

    // Calculate OppervlaktePVPanelenGGB (corresponds to C120)
    const oppervlaktePVPanelenGGB =
      aantalPVPanelenGGB * pvPaneelBreedte * pvPaneelHoogte;
    explanations[
      "oppervlaktePVPanelenGGB"
    ] = `${aantalPVPanelenGGB} (aantalPVPanelenGGB) × ${pvPaneelBreedte} (pvPaneelBreedte) × ${pvPaneelHoogte} (pvPaneelHoogte) = ${oppervlaktePVPanelenGGB}`;

    // Calculate PV in hoogte for kopgevel (corresponds to C125)
    const pvInHoogte = Math.floor((gootHoogte - 3) / pvPaneelHoogte);
    explanations[
      "aantalPVInHoogte"
    ] = `Math.floor((${gootHoogte} (gootHoogte) - 3) / ${pvPaneelHoogte} (pvPaneelHoogte)) = ${pvInHoogte}`;

    // Calculate PV in diepte for kopgevel (corresponds to C126)
    const pvInDiepteKop = Math.floor(diepte / pvPaneelBreedte);
    explanations[
      "aantalPVInDiepteKop"
    ] = `Math.floor(${diepte} (diepte) / ${pvPaneelBreedte} (pvPaneelBreedte)) = ${pvInDiepteKop}`;

    // Calculate AantalPVPanelenKop (corresponds to C127)
    const aantalPVPanelenKop = pvInHoogte * pvInDiepteKop;
    explanations[
      "aantalPVPanelenKop"
    ] = `${pvInHoogte} (pvInHoogte) × ${pvInDiepteKop} (pvInDiepteKop) = ${aantalPVPanelenKop}`;

    // Calculate AantalPVPanelenLangs (corresponds to C128)
    const aantalPVPanelenLangs = aantalWoningen * 2;
    explanations[
      "aantalPVPanelenLangs"
    ] = `${aantalWoningen} (aantalWoningen) × 2 = ${aantalPVPanelenLangs}`;

    // Calculate OppervlaktePVPanelenKop (corresponds to C123)
    const oppervlaktePVPanelenKop =
      aantalPVPanelenKop * pvPaneelBreedte * pvPaneelHoogte;
    explanations[
      "oppervlaktePVPanelenKop"
    ] = `${aantalPVPanelenKop} (aantalPVPanelenKop) × ${pvPaneelBreedte} (pvPaneelBreedte) × ${pvPaneelHoogte} (pvPaneelHoogte) = ${oppervlaktePVPanelenKop}`;

    // Calculate OppervlaktePVPanelenLangs (corresponds to C124)
    const oppervlaktePVPanelenLangs =
      aantalPVPanelenLangs * pvPaneelBreedte * pvPaneelHoogte;
    explanations[
      "oppervlaktePVPanelenLangs"
    ] = `${aantalPVPanelenLangs} (aantalPVPanelenLangs) × ${pvPaneelBreedte} (pvPaneelBreedte) × ${pvPaneelHoogte} (pvPaneelHoogte) = ${oppervlaktePVPanelenLangs}`;

    return {
      aantalPVPanelenGGB,
      oppervlaktePVPanelenGGB,
      aantalPVPanelenKop,
      aantalPVPanelenLangs,
      oppervlaktePVPanelenKop,
      oppervlaktePVPanelenLangs,
    };
  };

  const calculateKozijnen = (
    woningType: WoningType,
    explanations: Record<string, string>
  ) => {
    // Helper function for kozijn calculations
    const berekenKozijn = (
      breedte?: number,
      hoogte?: number,
      type: string = ""
    ): KozijnDetails => {
      if (!breedte || !hoogte) {
        explanations[
          `kozijn_${type}`
        ] = `Ongeldige afmetingen: breedte=${breedte}, hoogte=${hoogte}`;
        return {
          type,
          breedte: 0,
          hoogte: 0,
          oppervlakte: 0,
          rendement: 0,
          omtrek: 0,
        };
      }

      const oppervlakte = breedte * hoogte;
      const rendement = (breedte - 0.15) * (hoogte - 0.15);
      const omtrek = (breedte + hoogte) * 2;

      explanations[
        `kozijn_${type}_oppervlakte`
      ] = `${breedte} × ${hoogte} = ${oppervlakte}`;
      explanations[
        `kozijn_${type}_rendement`
      ] = `(${breedte} - 0.15) × (${hoogte} - 0.15) = ${rendement}`;
      explanations[
        `kozijn_${type}_omtrek`
      ] = `(${breedte} + ${hoogte}) × 2 = ${omtrek}`;

      return { type, breedte, hoogte, oppervlakte, rendement, omtrek };
    };

    // Process nested kozijn structures recursively
    const processKozijnen = (
      kozijnenData: any,
      prefix: string = ""
    ): KozijnDetails[] => {
      const result: KozijnDetails[] = [];

      // Handle null or undefined data
      if (!kozijnenData) return result;

      Object.entries(kozijnenData).forEach(([key, value]) => {
        const currentKey = prefix ? `${prefix}_${key}` : key;

        // If value has breedte property, it's a kozijn
        if (value && typeof value === "object" && "breedte" in value) {
          const { breedte, hoogte = 0 } = value as any;
          result.push(berekenKozijn(breedte, hoogte, currentKey));
        }
        // Otherwise it might be a nested object containing kozijnen
        else if (value && typeof value === "object") {
          result.push(...processKozijnen(value, currentKey));
        }
      });

      return result;
    };

    // Calculate kozijnen details for voor- and achtergevel
    const kozijnenVoorgevel = processKozijnen(woningType.voorgevelKozijnen);
    const kozijnenAchtergevel = processKozijnen(woningType.achtergevelKozijnen);

    // Calculate kozijn totals
    const kozijnOppervlakVoorTotaal = kozijnenVoorgevel.reduce(
      (sum, k) => sum + k.oppervlakte,
      0
    );
    const kozijnOppervlakAchterTotaal = kozijnenAchtergevel.reduce(
      (sum, k) => sum + k.oppervlakte,
      0
    );
    const kozijnOppervlakTotaal =
      kozijnOppervlakVoorTotaal + kozijnOppervlakAchterTotaal;
    const kozijnOppervlakteWoning = kozijnOppervlakTotaal;
    const kozijnRendementTotaal = [
      ...kozijnenVoorgevel,
      ...kozijnenAchtergevel,
    ].reduce((sum, k) => sum + k.rendement, 0);
    const kozijnOmtrekTotaal = [
      ...kozijnenVoorgevel,
      ...kozijnenAchtergevel,
    ].reduce((sum, k) => sum + k.omtrek, 0);

    // Add explanations for totals
    explanations[
      "kozijnOppervlakVoorTotaal"
    ] = `Som van alle voorgevel kozijn oppervlaktes = ${kozijnOppervlakVoorTotaal}`;
    explanations[
      "kozijnOppervlakAchterTotaal"
    ] = `Som van alle achtergevel kozijn oppervlaktes = ${kozijnOppervlakAchterTotaal}`;
    explanations[
      "kozijnOppervlakTotaal"
    ] = `${kozijnOppervlakVoorTotaal} + ${kozijnOppervlakAchterTotaal} = ${kozijnOppervlakTotaal}`;
    explanations[
      "kozijnRendementTotaal"
    ] = `Som van alle kozijn rendement waarden = ${kozijnRendementTotaal}`;
    explanations[
      "kozijnOmtrekTotaal"
    ] = `Som van alle kozijn omtrekken = ${kozijnOmtrekTotaal}`;

    // Group kozijnen by size
    const alleKozijnen = [...kozijnenVoorgevel, ...kozijnenAchtergevel];
    const kozijnenPerGrootte: KozijnGrootte = {
      tot1M2: calculateKozijnenInRange(alleKozijnen, 0, 1),
      tot1_5M2: calculateKozijnenInRange(alleKozijnen, 1, 1.5),
      tot2M2: calculateKozijnenInRange(alleKozijnen, 1.5, 2),
      tot2_5M2: calculateKozijnenInRange(alleKozijnen, 2, 2.5),
      tot3M2: calculateKozijnenInRange(alleKozijnen, 2.5, 3),
      tot3_5M2: calculateKozijnenInRange(alleKozijnen, 3, 3.5),
      tot4M2: calculateKozijnenInRange(alleKozijnen, 3.5, 4),
      boven4M2: calculateKozijnenInRange(alleKozijnen, 4, Infinity),
    };

    // Calculate Glass surface totals (using rendement/netto values)
    const glasOppervlakVoorTotaal = kozijnenVoorgevel.reduce(
      (sum, k) => sum + k.rendement,
      0
    );
    const glasOppervlakAchterTotaal = kozijnenAchtergevel.reduce(
      (sum, k) => sum + k.rendement,
      0
    );
    const glasOppervlakteWoning =
      glasOppervlakVoorTotaal + glasOppervlakAchterTotaal;

    // Add explanations for glass surface totals
    explanations[
      "glasOppervlakVoorTotaal"
    ] = `Som van alle voorgevel kozijn netto oppervlaktes = ${glasOppervlakVoorTotaal}`;
    explanations[
      "glasOppervlakAchterTotaal"
    ] = `Som van alle achtergevel kozijn netto oppervlaktes = ${glasOppervlakAchterTotaal}`;
    explanations[
      "glasOppervlakteWoning"
    ] = `${glasOppervlakVoorTotaal} + ${glasOppervlakAchterTotaal} = ${glasOppervlakteWoning}`;

    return {
      kozijnenVoorgevel,
      kozijnenAchtergevel,
      kozijnOppervlakVoorTotaal,
      kozijnOppervlakAchterTotaal,
      kozijnOppervlakTotaal,
      kozijnOppervlakteWoning,
      kozijnRendementTotaal,
      kozijnOmtrekTotaal,
      kozijnenPerGrootte,
      glasOppervlakVoorTotaal,
      glasOppervlakAchterTotaal,
      glasOppervlakteWoning,
    };
  };

  // Helper function to calculate kozijnen in a specific size range
  const calculateKozijnenInRange = (
    kozijnen: KozijnDetails[],
    min: number,
    max: number
  ): number => {
    return kozijnen.reduce((sum, k) => {
      if (k.rendement > min && k.rendement <= max) {
        return sum + k.rendement;
      }
      return sum;
    }, 0);
  };
  const calculateBasisMaten = (
    woningSpecifiek: WoningSpecifiek,
    explanations: Record<string, string>,
    woningType: WoningType
  ) => {
    const {
      breedte,
      diepte,
      gootHoogte,
      nokHoogte,
      heeftPlatDak,
      breedteComplex,
    } = woningSpecifiek;

    // Calculate gevel areas
    const gevelOppervlakVoor = breedte * gootHoogte;
    const gevelOppervlakAchter = breedte * gootHoogte;
    const gevelOppervlakTotaal = gevelOppervlakVoor + gevelOppervlakAchter;

    // Add explanations for gevel calculations
    explanations[
      "gevelOppervlakVoor"
    ] = `${breedte} (breedte) × ${gootHoogte} (gootHoogte) = ${gevelOppervlakVoor}`;
    explanations[
      "gevelOppervlakAchter"
    ] = `${breedte} (breedte) × ${gootHoogte} (gootHoogte) = ${gevelOppervlakAchter}`;
    explanations[
      "gevelOppervlakTotaal"
    ] = `${gevelOppervlakVoor} + ${gevelOppervlakAchter} = ${gevelOppervlakTotaal}`;

    // Calculate LengteDakvlak based on the Excel formula
    let lengteDakvlak;
    if (heeftPlatDak) {
      lengteDakvlak = diepte;
      explanations[
        "lengteDakvlak"
      ] = `${diepte} (diepte) = ${lengteDakvlak} (plat dak)`;
    } else {
      lengteDakvlak =
        Math.sqrt(
          Math.pow(diepte / 2, 2) + Math.pow(nokHoogte - gootHoogte, 2)
        ) * 2;
      explanations[
        "lengteDakvlak"
      ] = `Math.sqrt(Math.pow(${diepte}/2, 2) + Math.pow(${nokHoogte} - ${gootHoogte}, 2)) × 2 = ${lengteDakvlak} (schuin dak)`;
    }
    // Calculate LengteDakvlakPlusBreedteWoning
    const lengteDakvlakPlusBreedteWoning = lengteDakvlak + breedte;
    explanations[
      "lengteDakvlakPlusBreedteWoning"
    ] = `${lengteDakvlak} (lengteDakvlak) + ${breedte} (breedte) = ${lengteDakvlakPlusBreedteWoning}`;

    // Calculate roof area
    let dakOppervlak;
    if (heeftPlatDak) {
      dakOppervlak = breedte * diepte;
      explanations[
        "dakOppervlak"
      ] = `${breedte} (breedte) × ${diepte} (diepte) = ${dakOppervlak} (plat dak)`;
    } else {
      dakOppervlak =
        Math.sqrt(
          Math.pow(diepte / 2, 2) + Math.pow(nokHoogte - gootHoogte, 2)
        ) *
        breedte *
        2;
      explanations[
        "dakOppervlak"
      ] = `Math.sqrt(Math.pow(${diepte}/2, 2) + Math.pow(${nokHoogte} - ${gootHoogte}, 2)) × ${breedte} × 2 = ${dakOppervlak} (schuin dak)`;
    }

    // Calculate roof length
    let dakLengte;
    if (heeftPlatDak) {
      dakLengte = diepte;
      explanations[
        "dakLengte"
      ] = `${diepte} (diepte) = ${dakLengte} (plat dak)`;
    } else {
      dakLengte =
        Math.sqrt(
          Math.pow(diepte / 2, 2) + Math.pow(nokHoogte - gootHoogte, 2)
        ) * 2;
      explanations[
        "dakLengte"
      ] = `Math.sqrt(Math.pow(${diepte}/2, 2) + Math.pow(${nokHoogte} - ${gootHoogte}, 2)) × 2 = ${dakLengte} (schuin dak)`;
    }

    // Calculate floor area
    const vloerOppervlak = breedte * diepte;
    explanations[
      "vloerOppervlak"
    ] = `${breedte} (breedte) × ${diepte} (diepte) = ${vloerOppervlak}`;

    // Calculate kelder area (new)
    let oppervlakteKelder = 0;
    if (breedteComplex) {
      oppervlakteKelder = breedteComplex * diepte;
      explanations[
        "oppervlakteKelder"
      ] = `${breedteComplex} (breedteComplex) × ${diepte} (diepte) = ${oppervlakteKelder}`;
    } else {
      explanations[
        "oppervlakteKelder"
      ] = `Geen breedteComplex opgegeven, oppervlakteKelder = 0`;
    }

    const breedteWoningPlusHoogte = breedte + woningType.ruimten.hoogte;

    return {
      gevelOppervlakVoor,
      gevelOppervlakAchter,
      gevelOppervlakTotaal,
      dakOppervlak,
      dakLengte,
      vloerOppervlak,
      oppervlakteKelder, // New field added
      breedteWoningPlusHoogte,
      lengteDakvlak,
      lengteDakvlakPlusBreedteWoning,
    };
  };

  const calculateAfgeLeideMaten = (
    woningSpecifiek: WoningSpecifiek,
    kozijnInfo: any,
    basisMaten: any,
    explanations: Record<string, string>
  ) => {
    const { gevelOppervlakTotaal, dakOppervlak } = basisMaten;
    const { kozijnOppervlakTotaal } = kozijnInfo;

    // Calculate net gevel area
    const NettoGevelOppervlak = gevelOppervlakTotaal - kozijnOppervlakTotaal;
    explanations[
      "NettoGevelOppervlak"
    ] = `${gevelOppervlakTotaal} (gevelOppervlakTotaal) - ${kozijnOppervlakTotaal} (kozijnOppervlakTotaal) = ${NettoGevelOppervlak}`;

    // Calculate additional roof measurements
    const dakOverstekOppervlak = dakOppervlak * 0.05;
    explanations[
      "dakOverstekOppervlak"
    ] = `${dakOppervlak} (dakOppervlak) × 0.05 = ${dakOverstekOppervlak}`;

    const dakTotaalMetOverhang = dakOppervlak + dakOverstekOppervlak;
    explanations[
      "dakTotaalMetOverhang"
    ] = `${dakOppervlak} (dakOppervlak) + ${dakOverstekOppervlak} (dakOverstekOppervlak) = ${dakTotaalMetOverhang}`;

    return {
      NettoGevelOppervlak,
      dakOverstekOppervlak,
      dakTotaalMetOverhang,
    };
  };

  const calculateProjectTotalen = (
    woningSpecifiek: WoningSpecifiek,
    basisMaten: any,
    kozijnInfo: any,
    explanations: Record<string, string>
  ) => {
    const { breedte, diepte, aantalWoningen } = woningSpecifiek;
    const {
      gevelOppervlakTotaal,
      dakOppervlak,
      dakLengte,
      vloerOppervlak,
      oppervlakteKelder,
    } = basisMaten;
    const { kozijnOppervlakTotaal } = kozijnInfo;

    // Calculate project totals
    const projectGevelOppervlak = gevelOppervlakTotaal * aantalWoningen;
    explanations[
      "projectGevelOppervlak"
    ] = `${gevelOppervlakTotaal} (gevelOppervlakTotaal) × ${aantalWoningen} (aantalWoningen) = ${projectGevelOppervlak}`;

    const projectKozijnenOppervlak = kozijnOppervlakTotaal * aantalWoningen;
    explanations[
      "projectKozijnenOppervlak"
    ] = `${kozijnOppervlakTotaal} (kozijnOppervlakTotaal) × ${aantalWoningen} (aantalWoningen) = ${projectKozijnenOppervlak}`;

    const projectDakOppervlak = dakOppervlak * aantalWoningen;
    explanations[
      "projectDakOppervlak"
    ] = `${dakOppervlak} (dakOppervlak) × ${aantalWoningen} (aantalWoningen) = ${projectDakOppervlak}`;

    const projectOmtrek = (breedte * 2 + diepte * 2) * aantalWoningen;
    explanations[
      "projectOmtrek"
    ] = `((${breedte} (breedte) × 2) + (${diepte} (diepte) × 2)) × ${aantalWoningen} (aantalWoningen) = ${projectOmtrek}`;

    // Calculate totals
    const dakOppervlakTotaal = dakOppervlak * aantalWoningen;
    explanations[
      "dakOppervlakTotaal"
    ] = `${dakOppervlak} (dakOppervlak) × ${aantalWoningen} (aantalWoningen) = ${dakOppervlakTotaal}`;

    const dakLengteTotaal = dakLengte * aantalWoningen;
    explanations[
      "dakLengteTotaal"
    ] = `${dakLengte} (dakLengte) × ${aantalWoningen} (aantalWoningen) = ${dakLengteTotaal}`;

    const vloerOppervlakTotaal = vloerOppervlak * aantalWoningen;
    explanations[
      "vloerOppervlakTotaal"
    ] = `${vloerOppervlak} (vloerOppervlak) × ${aantalWoningen} (aantalWoningen) = ${vloerOppervlakTotaal}`;

    return {
      projectGevelOppervlak,
      projectKozijnenOppervlak,
      projectDakOppervlak,
      projectOmtrek,
      dakOppervlakTotaal,
      dakLengteTotaal,
      vloerOppervlakTotaal,
    };
  };

  // Run calculations whenever dimensions or woningType changes
  useEffect(() => {
    updateCalculations();
  }, [dimensions, woningType]);

  // This component doesn't render anything, it just performs calculations
  return null;
};

export default CalculationHandler;
