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

    // Step 1: Parse dimensions
    const woningSpecifiek = parseDimensions(dimensions, errors);

    const kozijnInfo = calculateKozijnen(woningType);
    const basisMaten = calculateBasisMaten(woningSpecifiek);
    const afgeLeideMaten = calculateAfgeLeideMaten(woningSpecifiek, kozijnInfo, basisMaten);
    const projectTotalen = calculateProjectTotalen(woningSpecifiek, basisMaten, kozijnInfo);

    // Combine all results
    const results: CalculationResults = {
      woningSpecifiek,
      ...basisMaten,
      ...kozijnInfo,
      ...afgeLeideMaten,
      ...projectTotalen,
      missingInputs: errors,
      calculationWarnings: warnings
    };

    setCalculations(results);
    onCalculate(results);
  };

  // Parse dimensions strings to numbers
  const parseDimensions = (dim: Dimensions, errors: string[]): WoningSpecifiek => {
    // Parse required dimensions
    const breedte = parseFloat(dim.breed.replace(',', '.'));
    const diepte = parseFloat(dim.diepte.replace(',', '.'));
    const gootHoogte = parseFloat(dim.goothoogte.replace(',', '.'));
    const nokHoogte = parseFloat(dim.nokhoogte.replace(',', '.'));
    const aantalWoningen = parseInt(dim.aantalwoningen);
    const heeftPlatDak = gootHoogte === nokHoogte;
    
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


  const calculateKozijnen = (woningType: WoningType) => {
    // Helper function for kozijn calculations
    const berekenKozijn = (breedte?: number, hoogte?: number, type: string = ''): KozijnDetails => {
      if (!breedte || !hoogte) {
        return { type, breedte: 0, hoogte: 0, oppervlakte: 0, rendement: 0, omtrek: 0 };
      }

      const oppervlakte = breedte * hoogte;
      const rendement = (breedte - 0.15) * (hoogte - 0.15);
      const omtrek = (breedte + hoogte) * 2;

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

  const calculateBasisMaten = (woningSpecifiek: WoningSpecifiek) => {
    const { breedte, diepte, gootHoogte, nokHoogte, heeftPlatDak } = woningSpecifiek;
    
    // Calculate gevel areas
    const gevelOppervlakVoor = breedte * gootHoogte;
    const gevelOppervlakAchter = breedte * gootHoogte;
    const gevelOppervlakTotaal = gevelOppervlakVoor + gevelOppervlakAchter;

    // Calculate roof area
    const dakOppervlak = heeftPlatDak
    ? breedte * diepte // For flat roof
    : Math.sqrt(Math.pow(diepte/2, 2) + Math.pow(nokHoogte - gootHoogte, 2))

    // Calculate roof length
    const dakLengte = heeftPlatDak
      ? diepte
      : Math.sqrt(Math.pow(diepte/2, 2) + Math.pow(nokHoogte - gootHoogte, 2)) * 2;

    // Calculate floor area
    const vloerOppervlak = breedte * diepte;

    return {
      gevelOppervlakVoor,
      gevelOppervlakAchter,
      gevelOppervlakTotaal,
      dakOppervlak,
      dakLengte,
      vloerOppervlak
    };
  };


  const calculateAfgeLeideMaten = (
    woningSpecifiek: WoningSpecifiek, 
    kozijnInfo: any, 
    basisMaten: any
  ) => {
    const { gevelOppervlakTotaal, dakOppervlak } = basisMaten;
    const { kozijnOppervlakTotaal } = kozijnInfo;

    // Calculate net gevel area
    const gevelOppervlakNetto = gevelOppervlakTotaal - kozijnOppervlakTotaal;

    // Calculate additional roof measurements
    const dakOverstekOppervlak = dakOppervlak * 0.05;
    const dakTotaalMetOverhang = dakOppervlak + dakOverstekOppervlak;

    return {
      gevelOppervlakNetto,
      dakOverstekOppervlak,
      dakTotaalMetOverhang,
    };
  };

  const calculateProjectTotalen = (
    woningSpecifiek: WoningSpecifiek, 
    basisMaten: any, 
    kozijnInfo: any
  ) => {
    const { breedte, diepte, aantalWoningen } = woningSpecifiek;
    const { gevelOppervlakTotaal, dakOppervlak, dakLengte, vloerOppervlak } = basisMaten;
    const { kozijnOppervlakTotaal } = kozijnInfo;

    // Calculate project totals
    const projectGevelOppervlak = gevelOppervlakTotaal * aantalWoningen;
    const projectKozijnenOppervlak = kozijnOppervlakTotaal * aantalWoningen;
    const projectDakOppervlak = dakOppervlak * aantalWoningen;
    const projectOmtrek = ((breedte * 2) + (diepte * 2 * 1.25)) * aantalWoningen;
    
    // Calculate totals
    const dakOppervlakTotaal = dakOppervlak * aantalWoningen;
    const dakLengteTotaal = dakLengte * aantalWoningen;
    const vloerOppervlakTotaal = vloerOppervlak * aantalWoningen;

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