import React, { useEffect, useState } from 'react';
import { WoningType } from '@/types/woning';

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
  
  // Floor calculations
  vloerOppervlak: number;
  vloerOppervlakTotaal: number;
  
  // Kozijn details
  kozijnenVoorgevel: KozijnDetails[];
  kozijnenAchtergevel: KozijnDetails[];
  
  // Kozijn measurements
  kozijnOppervlakVoorTotaal: number;
  kozijnOppervlakAchterTotaal: number;
  kozijnOppervlakTotaal: number;
  kozijnRendementTotaal: number;
  kozijnOmtrekTotaal: number;
  
  // Gevel netto
  gevelOppervlakNetto: number;
  
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
  
  // Error tracking
  missingInputs: string[];
  calculationWarnings: string[];

  // Calculation explanations (new)
  calculationExplanations: Record<string, string>;
}

interface Props {
  dimensions: Dimensions;
  woningType: WoningType | null;
  onCalculate: (calculations: CalculationResults) => void;
}

export const CalculationHandler: React.FC<Props> = ({ dimensions, woningType, onCalculate }) => {
  const [calculations, setCalculations] = useState<CalculationResults | null>(null);

  // Main calculation function that orchestrates all calculations
  const updateCalculations = () => {
    if (!dimensions || !woningType) return;

    const errors: string[] = [];
    const warnings: string[] = [];
    const explanations: Record<string, string> = {};

    // Step 1: Parse dimensions
    const woningSpecifiek = parseDimensions(dimensions, errors);

    const kozijnInfo = calculateKozijnen(woningType, explanations);
    const basisMaten = calculateBasisMaten(woningSpecifiek, explanations, woningType);
    const afgeLeideMaten = calculateAfgeLeideMaten(woningSpecifiek, kozijnInfo, basisMaten, explanations);
    const projectTotalen = calculateProjectTotalen(woningSpecifiek, basisMaten, kozijnInfo, explanations);

    // Combine all results
    const results: CalculationResults = {
      woningSpecifiek,
      ...basisMaten,
      ...kozijnInfo,
      ...afgeLeideMaten,
      ...projectTotalen,
      missingInputs: errors,
      calculationWarnings: warnings,
      calculationExplanations: explanations
    };

    setCalculations(results);
    onCalculate(results);
    
    // Group calculations by category for more organized logging
    console.groupCollapsed("[CalculationHandler] Alle berekeningsdetails");
    
    // Basic measurements
    console.groupCollapsed("Basis Afmetingen (woningSpecifiek)");
    console.log(woningSpecifiek);
    console.groupEnd();
    
    // Gevel
    console.groupCollapsed("Gevel Berekeningen");
    logExplanationsByPrefix(explanations, "gevelOppervlak");
    console.groupEnd();
    
    // Dak
    console.groupCollapsed("Dak Berekeningen");
    logExplanationsByPrefix(explanations, "dakOppervlak");
    logExplanationsByPrefix(explanations, "dakLengte");
    logExplanationsByPrefix(explanations, "dakTotaal");
    logExplanationsByPrefix(explanations, "dakOverstek");
    console.groupEnd();
    
    // Kozijnen
    console.groupCollapsed("Kozijnen Berekeningen");
    logExplanationsByPrefix(explanations, "kozijn");
    console.groupEnd();
    
    // Vloer
    console.groupCollapsed("Vloer Berekeningen");
    logExplanationsByPrefix(explanations, "vloerOppervlak");
    console.groupEnd();
    
    // Project totals
    console.groupCollapsed("Project Totalen");
    logExplanationsByPrefix(explanations, "project");
    console.groupEnd();
    
    console.groupEnd(); // End of all calculation details
  };
  
  // Helper function to log explanations by prefix
  const logExplanationsByPrefix = (explanations: Record<string, string>, prefix: string) => {
    Object.entries(explanations)
      .filter(([key]) => key.startsWith(prefix))
      .forEach(([key, explanation]) => {
        console.log(`${key}: ${explanation}`);
      });
  };

  // Parse dimensions strings to numbers
  const parseDimensions = (dim: Dimensions, errors: string[]): WoningSpecifiek => {
    // Parse required dimensions
    const breedte = parseFloat(dim.breed.replace(',', '.'));
    const diepte = parseFloat(dim.diepte.replace(',', '.'));
    const gootHoogte = parseFloat(dim.goothoogte.replace(',', '.'));
    const nokHoogte = parseFloat(dim.nokhoogte.replace(',', '.'));
    const aantalWoningen = parseInt(dim.aantalwoningen);
    const heeftPlatDak = gootHoogte === nokHoogte || nokHoogte === undefined;
    
    // Parse optional dimensions
    const bouwlagen = dim.bouwlagen ? parseInt(dim.bouwlagen) : undefined;
    const breedteComplex = dim.breedtecomplex ? parseFloat(dim.breedtecomplex.replace(',', '.')) : undefined;
    const kopgevels = dim.kopgevels ? parseInt(dim.kopgevels) : undefined;
    const portieken = dim.portieken ? parseInt(dim.portieken) : undefined;

    // Validate parsed values
    if (isNaN(breedte)) errors.push('Breedte is ongeldig');
    if (isNaN(diepte)) errors.push('Diepte is ongeldig');
    if (isNaN(gootHoogte)) errors.push('Goothoogte is ongeldig');
    if (isNaN(nokHoogte)) errors.push('Nokhoogte is ongeldig');
    if (isNaN(aantalWoningen)) errors.push('Aantal woningen is ongeldig');

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


  const calculateKozijnen = (woningType: WoningType, explanations: Record<string, string>) => {
    // Helper function for kozijn calculations
    const berekenKozijn = (breedte?: number, hoogte?: number, type: string = ''): KozijnDetails => {
      if (!breedte || !hoogte) {
        explanations[`kozijn_${type}`] = `Ongeldige afmetingen: breedte=${breedte}, hoogte=${hoogte}`;
        return { type, breedte: 0, hoogte: 0, oppervlakte: 0, rendement: 0, omtrek: 0 };
      }

      const oppervlakte = breedte * hoogte;
      const rendement = (breedte - 0.15) * (hoogte - 0.15);
      const omtrek = (breedte + hoogte) * 2;

      explanations[`kozijn_${type}_oppervlakte`] = `${breedte} × ${hoogte} = ${oppervlakte}`;
      explanations[`kozijn_${type}_rendement`] = `(${breedte} - 0.15) × (${hoogte} - 0.15) = ${rendement}`;
      explanations[`kozijn_${type}_omtrek`] = `(${breedte} + ${hoogte}) × 2 = ${omtrek}`;

      return { type, breedte, hoogte, oppervlakte, rendement, omtrek };
    };

    // Calculate kozijnen details for voor- and achtergevel
    const kozijnenVoorgevel = Object.entries(woningType.voorGevelKozijnen || {}).map(
      ([type, dims]) => berekenKozijn(dims.breedte, dims.hoogte, type)
    );

    const kozijnenAchtergevel = Object.entries(woningType.achterGevelKozijnen || {}).map(
      ([type, dims]) => berekenKozijn(dims.breedte, dims.hoogte, type)
    );

    // Calculate kozijn totals
    const kozijnOppervlakVoorTotaal = kozijnenVoorgevel.reduce((sum, k) => sum + k.oppervlakte, 0);
    const kozijnOppervlakAchterTotaal = kozijnenAchtergevel.reduce((sum, k) => sum + k.oppervlakte, 0);
    const kozijnOppervlakTotaal = kozijnOppervlakVoorTotaal + kozijnOppervlakAchterTotaal;
    const kozijnRendementTotaal = [...kozijnenVoorgevel, ...kozijnenAchtergevel]
      .reduce((sum, k) => sum + k.rendement, 0);
    const kozijnOmtrekTotaal = [...kozijnenVoorgevel, ...kozijnenAchtergevel]
      .reduce((sum, k) => sum + k.omtrek, 0);

    // Add explanations for totals
    explanations["kozijnOppervlakVoorTotaal"] = `Som van alle voorgevel kozijn oppervlaktes = ${kozijnOppervlakVoorTotaal}`;
    explanations["kozijnOppervlakAchterTotaal"] = `Som van alle achtergevel kozijn oppervlaktes = ${kozijnOppervlakAchterTotaal}`;
    explanations["kozijnOppervlakTotaal"] = `${kozijnOppervlakVoorTotaal} + ${kozijnOppervlakAchterTotaal} = ${kozijnOppervlakTotaal}`;
    explanations["kozijnRendementTotaal"] = `Som van alle kozijn rendement waarden = ${kozijnRendementTotaal}`;
    explanations["kozijnOmtrekTotaal"] = `Som van alle kozijn omtrekken = ${kozijnOmtrekTotaal}`;

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

    return {
      kozijnenVoorgevel,
      kozijnenAchtergevel,
      kozijnOppervlakVoorTotaal,
      kozijnOppervlakAchterTotaal,
      kozijnOppervlakTotaal,
      kozijnRendementTotaal,
      kozijnOmtrekTotaal,
      kozijnenPerGrootte
    };
  };

  // Helper function to calculate kozijnen in a specific size range
  const calculateKozijnenInRange = (kozijnen: KozijnDetails[], min: number, max: number): number => {
    return kozijnen.reduce((sum, k) => {
      if (k.rendement > min && k.rendement <= max) {
        return sum + k.rendement;
      }
      return sum;
    }, 0);
  };

  const calculateBasisMaten = (woningSpecifiek: WoningSpecifiek, explanations: Record<string, string>, woningType: WoningType) => {
    const { breedte, diepte, gootHoogte, nokHoogte, heeftPlatDak } = woningSpecifiek;
    
    // Calculate gevel areas
    const gevelOppervlakVoor = breedte * gootHoogte;
    const gevelOppervlakAchter = breedte * gootHoogte;
    const gevelOppervlakTotaal = gevelOppervlakVoor + gevelOppervlakAchter;

    // Add explanations for gevel calculations
    explanations["gevelOppervlakVoor"] = `${breedte} (breedte) × ${gootHoogte} (gootHoogte) = ${gevelOppervlakVoor}`;
    explanations["gevelOppervlakAchter"] = `${breedte} (breedte) × ${gootHoogte} (gootHoogte) = ${gevelOppervlakAchter}`;
    explanations["gevelOppervlakTotaal"] = `${gevelOppervlakVoor} + ${gevelOppervlakAchter} = ${gevelOppervlakTotaal}`;

    // Calculate roof area
    let dakOppervlak;
    if (heeftPlatDak) {
      dakOppervlak = breedte * diepte;
      explanations["dakOppervlak"] = `${breedte} (breedte) × ${diepte} (diepte) = ${dakOppervlak} (plat dak)`;
    } else {
      dakOppervlak = Math.sqrt(Math.pow(diepte/2, 2) + Math.pow(nokHoogte - gootHoogte, 2)) * breedte * 2;
      explanations["dakOppervlak"] = `Math.sqrt(Math.pow(${diepte}/2, 2) + Math.pow(${nokHoogte} - ${gootHoogte}, 2)) × ${breedte} = ${dakOppervlak} (schuin dak)`;
    }

    // Calculate roof length
    let dakLengte;
    if (heeftPlatDak) {
      dakLengte = diepte;
      explanations["dakLengte"] = `${diepte} (diepte) = ${dakLengte} (plat dak)`;
    } else {
      dakLengte = Math.sqrt(Math.pow(diepte/2, 2) + Math.pow(nokHoogte - gootHoogte, 2)) * 2;
      explanations["dakLengte"] = `Math.sqrt(Math.pow(${diepte}/2, 2) + Math.pow(${nokHoogte} - ${gootHoogte}, 2)) × 2 = ${dakLengte} (schuin dak)`;
    }

    // Calculate floor area
    const vloerOppervlak = breedte * diepte;
    explanations["vloerOppervlak"] = `${breedte} (breedte) × ${diepte} (diepte) = ${vloerOppervlak}`;

    const breedteWoningPlusHoogte = breedte + woningType.ruimten.hoogte

    return {
      gevelOppervlakVoor,
      gevelOppervlakAchter,
      gevelOppervlakTotaal,
      dakOppervlak,
      dakLengte,
      vloerOppervlak,
      breedteWoningPlusHoogte
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
    const gevelOppervlakNetto = gevelOppervlakTotaal - kozijnOppervlakTotaal;
    explanations["gevelOppervlakNetto"] = `${gevelOppervlakTotaal} (gevelOppervlakTotaal) - ${kozijnOppervlakTotaal} (kozijnOppervlakTotaal) = ${gevelOppervlakNetto}`;

    // Calculate additional roof measurements
    const dakOverstekOppervlak = dakOppervlak * 0.05;
    explanations["dakOverstekOppervlak"] = `${dakOppervlak} (dakOppervlak) × 0.05 = ${dakOverstekOppervlak}`;
    
    const dakTotaalMetOverhang = dakOppervlak + dakOverstekOppervlak;
    explanations["dakTotaalMetOverhang"] = `${dakOppervlak} (dakOppervlak) + ${dakOverstekOppervlak} (dakOverstekOppervlak) = ${dakTotaalMetOverhang}`;

    return {
      gevelOppervlakNetto,
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
    const { gevelOppervlakTotaal, dakOppervlak, dakLengte, vloerOppervlak } = basisMaten;
    const { kozijnOppervlakTotaal } = kozijnInfo;

    // Calculate project totals
    const projectGevelOppervlak = gevelOppervlakTotaal * aantalWoningen;
    explanations["projectGevelOppervlak"] = `${gevelOppervlakTotaal} (gevelOppervlakTotaal) × ${aantalWoningen} (aantalWoningen) = ${projectGevelOppervlak}`;
    
    const projectKozijnenOppervlak = kozijnOppervlakTotaal * aantalWoningen;
    explanations["projectKozijnenOppervlak"] = `${kozijnOppervlakTotaal} (kozijnOppervlakTotaal) × ${aantalWoningen} (aantalWoningen) = ${projectKozijnenOppervlak}`;
    
    const projectDakOppervlak = dakOppervlak * aantalWoningen;
    explanations["projectDakOppervlak"] = `${dakOppervlak} (dakOppervlak) × ${aantalWoningen} (aantalWoningen) = ${projectDakOppervlak}`;
    
    const projectOmtrek = ((breedte * 2) + (diepte * 2 * 1.25)) * aantalWoningen;
    explanations["projectOmtrek"] = `((${breedte} (breedte) × 2) + (${diepte} (diepte) × 2 × 1.25)) × ${aantalWoningen} (aantalWoningen) = ${projectOmtrek}`;
    
    // Calculate totals
    const dakOppervlakTotaal = dakOppervlak * aantalWoningen;
    explanations["dakOppervlakTotaal"] = `${dakOppervlak} (dakOppervlak) × ${aantalWoningen} (aantalWoningen) = ${dakOppervlakTotaal}`;
    
    const dakLengteTotaal = dakLengte * aantalWoningen;
    explanations["dakLengteTotaal"] = `${dakLengte} (dakLengte) × ${aantalWoningen} (aantalWoningen) = ${dakLengteTotaal}`;
    
    const vloerOppervlakTotaal = vloerOppervlak * aantalWoningen;
    explanations["vloerOppervlakTotaal"] = `${vloerOppervlak} (vloerOppervlak) × ${aantalWoningen} (aantalWoningen) = ${vloerOppervlakTotaal}`;
    
    return {
      projectGevelOppervlak,
      projectKozijnenOppervlak,
      projectDakOppervlak,
      projectOmtrek,
      dakOppervlakTotaal,
      dakLengteTotaal,
      vloerOppervlakTotaal
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