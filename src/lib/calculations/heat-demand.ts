// heat-demand.ts

interface HeatDemandPeriod {
    period: string;
    value: number;
  }

  interface HeatDemandData {
    portiek?: HeatDemandPeriod[];
    gallerij?: HeatDemandPeriod[];
    grondgebonden?: HeatDemandPeriod[];
  }

  interface Measure {
    name: string;
    heat_demand?: HeatDemandData;
    [key: string]: any;
  }

  /**
   * Gets the heat demand value for a measure based on building type and period
   */
  export function getHeatDemandValue(
    measure: Measure,
    buildingType: string,
    buildPeriod: string
  ): number {
    // Default value if no match is found
    const defaultValue = 0;

    // Return default if no heat_demand data exists
    if (!measure.heat_demand) {
      return defaultValue;
    }

    // Map building type to the correct key in heat_demand object
    let typeKey: 'portiek' | 'gallerij' | 'grondgebonden' = 'grondgebonden'; // Default to grondgebonden

    if (buildingType?.toLowerCase().includes('portiek')) {
      typeKey = 'portiek';
    } else if (buildingType?.toLowerCase().includes('galerij') ||
               buildingType?.toLowerCase().includes('gallerij')) {
      typeKey = 'gallerij';
    }

    // Get heat demand values for this building type
    const typeValues = measure.heat_demand[typeKey];

    // Return default if no values exist for this type
    if (!Array.isArray(typeValues) || typeValues.length === 0) {
      return defaultValue;
    }

    // Find the matching period
    const periodData = typeValues.find(item => item.period === buildPeriod);

    // Return the heat demand value if found, otherwise default
    return periodData?.value ?? defaultValue;
  }
