export interface PeriodValue {
  period: string;
  value: number;
}

export interface PriceComponent {
  name: string;
  aantal: {
    type: string;
    value: number;
    unit: string;
    percentage?: number;
  };
}

export interface Measure {
  _id: string;
  name: string;
  group: string;
  heat_demand: {
    grongebonden: PeriodValue[];
    portiek: PeriodValue[];
    gallerij: PeriodValue[];
  };
  measure_prices: {
    geisoleerde_dakplaat: PriceComponent;
    extra_oppervlakte: PriceComponent;
  };
  additional_components: string[];
}

// Searchable fields configuration
export interface SearchableField {
  label: string;
  value: string;
  path?: string;
}

export const measureSearchableFields: SearchableField[] = [
  { label: "Name", value: "name" },
  { label: "Group", value: "group" },
  // Grongebonden
  {
    label: "Grongebonden Value",
    value: "grongebonden_value",
    path: "heat_demand.grongebonden.value",
  },
  {
    label: "Grongebonden Period",
    value: "grongebonden_period",
    path: "heat_demand.grongebonden.period",
  },
  // Portiek
  {
    label: "Portiek Value",
    value: "portiek_value",
    path: "heat_demand.portiek.value",
  },
  {
    label: "Portiek Period",
    value: "portiek_period",
    path: "heat_demand.portiek.period",
  },
  // Gallerij
  {
    label: "Gallerij Value",
    value: "gallerij_value",
    path: "heat_demand.gallerij.value",
  },
  {
    label: "Gallerij Period",
    value: "gallerij_period",
    path: "heat_demand.gallerij.period",
  },
  // Measure prices
  {
    label: "Component Name",
    value: "component_name",
    path: "measure_prices.geisoleerde_dakplaat.name",
  },
];
