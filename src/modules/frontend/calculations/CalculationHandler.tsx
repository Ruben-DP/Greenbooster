import React, { useEffect, useState } from 'react';
import { WoningType, Woning } from '@/types/woning';

interface KozijnDetails {
  type: string;
  breedte: number;
  hoogte: number;
  oppervlakte: number;
  rendement: number;
  omtrek: number;
}

interface CalculationResults {
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
  kozijnenPerGrootte: {
    tot1M2: number;
    tot1_5M2: number;
    tot2M2: number;
    tot2_5M2: number;
    tot3M2: number;
    tot3_5M2: number;
    tot4M2: number;
    boven4M2: number;
  };
  
  // Error tracking
  missingInputs: string[];
  calculationWarnings: string[];
}

interface Props {
  woning: Woning | null;
  woningType: WoningType | null;
  onCalculate: (calculations: CalculationResults) => void;
}

export const CalculationHandler: React.FC<Props> = ({ woning, woningType, onCalculate }) => {
  const [calculations, setCalculations] = useState<CalculationResults | null>(null);

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

  const updateCalculations = () => {
    if (!woning || !woningType) return;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic measurements
    const breedte = 5.1; // This should come from woning
    const diepte = 10.4; // This should come from woning
    const gootHoogte = 6; // This should come from woning
    const nokHoogte = 8; // This should come from woning
    const heeftPlatDak = gootHoogte === nokHoogte;

    // Calculate kozijnen
    const kozijnenVoorgevel = Object.entries(woningType.voorGevelKozijnen || {}).map(
      ([type, dims]) => berekenKozijn(dims.breedte, dims.hoogte, type)
    );

    const kozijnenAchtergevel = Object.entries(woningType.achterGevelKozijnen || {}).map(
      ([type, dims]) => berekenKozijn(dims.breedte, dims.hoogte, type)
    );

    // Calculate base measurements
    const gevelOppervlakVoor = breedte * gootHoogte;
    const gevelOppervlakAchter = breedte * gootHoogte;
    const gevelOppervlakTotaal = gevelOppervlakVoor + gevelOppervlakAchter;

    // Calculate kozijn totals
    const kozijnOppervlakVoorTotaal = kozijnenVoorgevel.reduce((sum, k) => sum + k.oppervlakte, 0);
    const kozijnOppervlakAchterTotaal = kozijnenAchtergevel.reduce((sum, k) => sum + k.oppervlakte, 0);
    const kozijnOppervlakTotaal = kozijnOppervlakVoorTotaal + kozijnOppervlakAchterTotaal;
    const kozijnRendementTotaal = [...kozijnenVoorgevel, ...kozijnenAchtergevel]
      .reduce((sum, k) => sum + k.rendement, 0);
    const kozijnOmtrekTotaal = [...kozijnenVoorgevel, ...kozijnenAchtergevel]
      .reduce((sum, k) => sum + k.omtrek, 0);

    // Calculate roof area
    const dakOppervlak = heeftPlatDak
      ? diepte * gootHoogte
      : (diepte * ((nokHoogte - gootHoogte) / 2)) + (diepte * gootHoogte);

    // Calculate roof length
    const dakLengte = heeftPlatDak
      ? diepte
      : Math.sqrt(Math.pow(diepte/2, 2) + Math.pow(nokHoogte - gootHoogte, 2)) * 2;

    // Calculate floor area
    const vloerOppervlak = breedte * diepte;

    // Calculate kozijn size groups
    const alleKozijnen = [...kozijnenVoorgevel, ...kozijnenAchtergevel];
    const kozijnenPerGrootte = {
      tot1M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 0 && k.rendement <= 1 ? k.rendement : 0), 0),
      tot1_5M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 1 && k.rendement <= 1.5 ? k.rendement : 0), 0),
      tot2M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 1.5 && k.rendement <= 2 ? k.rendement : 0), 0),
      tot2_5M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 2 && k.rendement <= 2.5 ? k.rendement : 0), 0),
      tot3M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 2.5 && k.rendement <= 3 ? k.rendement : 0), 0),
      tot3_5M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 3 && k.rendement <= 3.5 ? k.rendement : 0), 0),
      tot4M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 3.5 && k.rendement <= 4 ? k.rendement : 0), 0),
      boven4M2: alleKozijnen.reduce((sum, k) => sum + (k.rendement > 4 ? k.rendement : 0), 0),
    };

    // Calculate additional measurements
    const dakOverstekOppervlak = dakOppervlak * 0.05;
    const dakTotaalMetOverhang = dakOppervlak + dakOverstekOppervlak;
    const projectOmtrek = ((breedte * 2) + (diepte * 2 * 1.25)) * woning.aantalWoningen;

    const results: CalculationResults = {
      gevelOppervlakVoor,
      gevelOppervlakAchter,
      gevelOppervlakTotaal,
      dakOppervlak,
      dakOppervlakTotaal: dakOppervlak * woning.aantalWoningen,
      dakLengte,
      dakLengteTotaal: dakLengte * woning.aantalWoningen,
      vloerOppervlak,
      vloerOppervlakTotaal: vloerOppervlak * woning.aantalWoningen,
      kozijnenVoorgevel,
      kozijnenAchtergevel,
      kozijnOppervlakVoorTotaal,
      kozijnOppervlakAchterTotaal,
      kozijnOppervlakTotaal,
      kozijnRendementTotaal,
      kozijnOmtrekTotaal,
      gevelOppervlakNetto: gevelOppervlakTotaal - kozijnOppervlakTotaal,
      projectGevelOppervlak: gevelOppervlakTotaal * woning.aantalWoningen,
      projectKozijnenOppervlak: kozijnOppervlakTotaal * woning.aantalWoningen,
      projectDakOppervlak: dakOppervlak * woning.aantalWoningen,
      dakOverstekOppervlak,
      dakTotaalMetOverhang,
      projectOmtrek,
      kozijnenPerGrootte,
      missingInputs: errors,
      calculationWarnings: warnings
    };

    setCalculations(results);
    onCalculate(results);
  };

  useEffect(() => {
    updateCalculations();
  }, [woning, woningType]);

  return null;
};

export default CalculationHandler;