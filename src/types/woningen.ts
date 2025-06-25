// src/types/woningen.ts
export interface ProjectInformation {
  projectNumber: string;
  complexName: string;
  aantalVHE: number;
  adres: string;
  postcode: string;
  plaats: string;
  renovatieJaar: number;
  bouwPeriode: string;
}

export interface EnergyDetails {
  huidigLabel: string;
  huidigEnergie: number;
  voorkostenScenario: string;
  nieuwLabel: string;
  labelStappen: string;
  huidigVerbruik: number;
  huidigEnergieprijs: number;
}

export interface RoomDimensions {
  breedte?: number;
  hoogte?: number;
}

export interface WoningType {
  _id: string;
  naam: string;
  type?: string;
  voorGevelKozijnen: {
    voordeur: RoomDimensions;
    toilet: RoomDimensions;
    woonkamer: RoomDimensions;
    slaapkamer: RoomDimensions;
  };
  achterGevelKozijnen: {
    achterdeur: RoomDimensions;
    keuken: RoomDimensions;
    woonkamer: RoomDimensions;
    slaapkamer1: RoomDimensions;
    slaapkamer2: RoomDimensions;
  };
  ruimten: {
    woonkamer: RoomDimensions;
    achterkamer: RoomDimensions;
    slaapkamer: RoomDimensions;
    slaapkamer2: RoomDimensions;
    keuken: RoomDimensions;
    badkamer: RoomDimensions;
    hal: RoomDimensions;
    toilet: RoomDimensions;
    hoogte: number;
  };
}

export interface Woning {
  _id: string;
  projectInformation: ProjectInformation;
  energyDetails: EnergyDetails;
  typeId: string;
  isGrondgebonden: boolean;
  isPortiekflat: boolean;
  isGalerieflat: boolean;
  measures?: any[];
  dimensions: {
    breed: string;
    diepte: string;
    goothoogte: string;
    nokhoogte: string;
    aantalwoningen: string;
    kopgevels: string;
    breedtecomplex: string;
    portieken: string;
    bouwlagen: string;
  };
}