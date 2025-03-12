// heat-demand-utils.ts

/**
 * Gets the heat demand value from a measure based on building type and period
 */
export function getHeatDemandValue(
  measure: any,
  buildingType: string,
  buildPeriod: string
): number {

    // console.log("heat-demand.tsx recieved: measure -",measure, "residenceType-",buildingType, "build period-", buildPeriod);
  // Default value if nothing is found
  const defaultValue = 0;

  // Check if measure has heat_demand data
  if (!measure?.heat_demand) {
    return defaultValue;
  }

  // Map building type to heat_demand property key
  let typeKey = "grondgebonden"; // Default

  if (buildingType?.toLowerCase().includes("portiek")) {
    typeKey = "portiek";
  } else if (
    buildingType?.toLowerCase().includes("galerij") ||
    buildingType?.toLowerCase().includes("gallerij")
  ) {
    typeKey = "gallerij";
  }

  // Get the values for this type
  const typeValues = measure.heat_demand[typeKey];

  // Return default if no values exist for this type
  if (!Array.isArray(typeValues) || typeValues.length === 0) {
    return defaultValue;
  }

  // Find the matching period
  const periodData = typeValues.find((p) => p.period === buildPeriod);

  // Return the value if found, otherwise default
  return periodData?.value ?? defaultValue;
}
