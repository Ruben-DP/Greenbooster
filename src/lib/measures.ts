import { FormField } from "@/types/types";

export const MEASURES_COLLECTION = "retrofittingMeasures";

// Main interfaces
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

interface PeriodValue {
  period: string;
  value: number;
}

interface PriceComponent {
  name: string;
  aantal: {
    type: string;
    value: number;
    unit: string;
    percentage?: number;
  };
}
// Searchable fields configuration
export interface SearchableField {
  label: string;
  value: string;
  path?: string;
}

//fetch this data:
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

// Projection for MongoDB queries
export const measureProjection = measureSearchableFields.reduce(
  (acc, field) => {
    if (field.path) {
      acc[field.path] = 1;
    } else {
      acc[field.value] = 1;
    }
    return acc;
  },
  {} as Record<string, number>
);

// Query builder function
export function buildMeasureQuery(searchTerm: string) {
  const searchConditions = measureSearchableFields.map((field) => {
    if (!field.path) {
      // Direct field search
      return { [field.value]: { $regex: searchTerm, $options: "i" } };
    }

    // For nested paths, convert array notation to dot notation
    const mongoPath = field.path.replace(/\[(\d+)\]/g, ".$1");
    return { [mongoPath]: { $regex: searchTerm, $options: "i" } };
  });

  return { $or: searchConditions };
}

// Form fields configuration
export const measureFields = (detailData: any) => {
  return {
    id: { type: "hidden", value: detailData._id },
    name: {
      label: "Measure Name",
      value: detailData?.name || "",
      required: true,
      type: "text",
    },
    measure_prices: {
      geisoleerde_dakplaat: {
        name: {
          label: "Name",
          value:
            getNestedValue(
              detailData,
              "measure_prices.geisoleerde_dakplaat.name"
            ) || "",
          required: true,
          type: "text",
          path: "measure_prices.geisoleerde_dakplaat.name",
        },
        aantal: {
          value: {
            label: "Aantal",
            value:
              getNestedValue(
                detailData,
                "measure_prices.geisoleerde_dakplaat.aantal.value"
              ) || "",
            required: true,
            type: "number",
            path: "measure_prices.geisoleerde_dakplaat.aantal.value",
          },
          unit: {
            label: "Unit",
            value:
              getNestedValue(
                detailData,
                "measure_prices.geisoleerde_dakplaat.aantal.unit"
              ) || "",
            required: true,
            type: "dropdown",
            dropdownFields: ["m2", "pieces", "meters"],
            path: "measure_prices.geisoleerde_dakplaat.aantal.unit",
          },
        },
      },
      extra_oppervlakte: {
        aantal: {
          percentage: {
            label: "Percentage",
            value:
              getNestedValue(
                detailData,
                "measure_prices.extra_oppervlakte.aantal.percentage"
              ) || "",
            required: false,
            type: "number",
            path: "measure_prices.extra_oppervlakte.aantal.percentage",
          },
        },
      },
    },
    heat_demand: {
      grongebonden: [
        "tot 1965",
        "1965-1974",
        "1975-1982",
        "1983-1987",
        "1988-1991",
      ].map((period, index) => ({
        value: {
          label: period,
          value:
            getNestedValue(
              detailData,
              `heat_demand.grongebonden[${index}].value`
            ) || "",
          required: true,
          type: "number",
          path: `heat_demand.grongebonden[${index}].value`,
        },
      })),
      portiek: [
        "tot 1965",
        "1965-1974",
        "1975-1982",
        "1983-1987",
        "1988-1991",
      ].map((period, index) => ({
        value: {
          label: period,
          value:
            getNestedValue(detailData, `heat_demand.portiek[${index}].value`) ||
            "",
          required: true,
          type: "number",
          path: `heat_demand.portiek[${index}].value`,
        },
      })),
      gallerij: [
        "tot 1965",
        "1965-1974",
        "1975-1982",
        "1983-1987",
        "1988-1991",
      ].map((period, index) => ({
        value: {
          label: period,
          value:
            getNestedValue(
              detailData,
              `heat_demand.gallerij[${index}].value`
            ) || "",
          required: true,
          type: "number",
          path: `heat_demand.gallerij[${index}].value`,
        },
      })),
    },
  };
};

// Helper function (same as in contacts)
export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    if (key.includes("[")) {
      const arrayKey = key.split("[")[0];
      const index = parseInt(key.split("[")[1]);
      return current?.[arrayKey]?.[index];
    }
    return current?.[key];
  }, obj);
}
