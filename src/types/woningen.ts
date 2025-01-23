// types/woning.ts
export interface Woning {
    projectInformation: {
      projectNumber: string;
      complexName: string;
      aantalVHE: number;
      adres: string;
      postcode: string;
      plaats: string;
      renovatieJaar: number;
      bouwPeriode: string;
    };
    
    energyDetails: {
      huidigLabel: string;
      huidigEnergie: number;
      voorkostenScenario: string;
      nieuwLabel: string;
      labelStappen: string;
      huidigVerbruik: number;
      huidigEnergieprijs: number;
    };
  
    typeAndMeasurements: {
      types: {
        grondgebonden: boolean;
        portiekflat: boolean;
        galerieflat: boolean;
      };
      typeFlat: string;
      breed: string;
      diepte: string;
    };
  }