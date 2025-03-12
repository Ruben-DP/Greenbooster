// price-calculator.ts

interface Calculation {
    type: string;
    value: string;
    position?: number;
  }
  
  interface MeasurePrice {
    name?: string;
    unit?: string;
    calculation: Calculation[];
    price?: number;
  }
  
  interface CalculationResult {
    price: number;
    calculations: any[];
    isValid: boolean;
    errorMessage?: string;
    warningLog: string[];
  }
  
  /**
   * Calculates the price for a measure based on formula and residence data
   */
  export function calculateMeasurePrice(
    measurePrices: MeasurePrice[] | undefined,
    calculationData: Record<string, any> | null
  ): CalculationResult {
    // Return early if we don't have the required data
    if (!measurePrices || !calculationData) {
      return {
        price: 0,
        calculations: [],
        isValid: false,
        errorMessage: "Geen berekeningen of data beschikbaar",
        warningLog: [],
      };
    }
  
    let hasErrors = false;
    let errorMessages: string[] = [];
    let warningLog: string[] = [];
  
    // Process each measurement price calculation
    const results = measurePrices.map((measurePrice) => {
      try {
        // Initialize calculation values
        let result = 0;
        let formulaSteps: any[] = [];
        let currentValue = 0;
        let operation = "+";
        let calculationValid = true;
        let stepError = "";
        let variableWarnings: string[] = [];
  
        // Process each step in the calculation formula
        measurePrice.calculation.forEach((calc, index) => {
          if (!calc?.type || !calc?.value) return;
  
          // If this is an operator, just update the current operation
          if (calc.type === "operator") {
            operation = calc.value;
            return;
          }
  
          // Handle variables in the calculation
          if (calc.type === "variable") {
            const value = findVariableValue(calc.value, calculationData);
  
            // Check if we found a valid value
            if (value === undefined || value === null) {
              stepError = `Variabele ${calc.value} niet gevonden in berekeningen`;
              variableWarnings.push(stepError);
              calculationValid = false;
              return;
            }
  
            // Convert to number and validate
            const numValue = Number(value);
            if (isNaN(numValue)) {
              stepError = `Waarde voor ${calc.value} (${value}) is geen getal`;
              variableWarnings.push(stepError);
              calculationValid = false;
              return;
            }
  
            // Apply the mathematical operation
            currentValue = applyOperation(currentValue, numValue, operation, index);
            
            // Check for division by zero
            if (operation === "/" && numValue === 0) {
              stepError = "Deling door nul poging";
              variableWarnings.push(stepError);
              calculationValid = false;
              return;
            }
  
            // Record this calculation step
            formulaSteps.push({
              variable: calc.value,
              value: numValue,
              operation: operation,
              currentResult: currentValue,
            });
          }
        });
  
        // If calculation had errors, return error info
        if (!calculationValid) {
          hasErrors = true;
          errorMessages.push(stepError);
          warningLog = warningLog.concat(variableWarnings);
          return {
            name: measurePrice.name || "Unnamed",
            unitPrice: measurePrice.price || 0,
            quantity: 0,
            totalPrice: 0,
            unit: measurePrice.unit || "m²",
            steps: formulaSteps,
            error: stepError,
            variableWarnings,
            isValid: false,
          };
        }
  
        // Calculate final price using the unit price
        const unitPrice = measurePrice.price || 0;
        result = currentValue * unitPrice;
  
        // Return successful calculation
        return {
          name: measurePrice.name || "Unnamed",
          unitPrice: unitPrice,
          quantity: currentValue,
          totalPrice: result,
          unit: measurePrice.unit || "m²",
          steps: formulaSteps,
          isValid: true,
        };
      } catch (error) {
        // Handle unexpected errors
        hasErrors = true;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errorMessages.push(errorMessage);
        warningLog.push(`Error in calculation: ${errorMessage}`);
        
        return {
          name: measurePrice.name || "Calculation Error",
          unitPrice: measurePrice.price || 0,
          quantity: 0,
          totalPrice: 0,
          unit: measurePrice.unit || "m²",
          error: errorMessage,
          isValid: false,
        };
      }
    });
  
    // Sum up all prices from individual calculations
    const totalPrice = results.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
  
    // Return final calculation result
    return {
      price: totalPrice,
      calculations: results,
      isValid: !hasErrors,
      errorMessage: errorMessages.length > 0 ? errorMessages.join("; ") : undefined,
      warningLog,
    };
  }
  
  /**
   * Helper function to find a variable value in the calculation data
   */
  function findVariableValue(variableName: string, calculationData: Record<string, any>): any {
    let value;
    
    // Try direct lookup in woningSpecifiek
    if (calculationData.woningSpecifiek && 
        calculationData.woningSpecifiek[variableName] !== undefined) {
      value = calculationData.woningSpecifiek[variableName];
      return value;
    }
    
    // Try direct lookup in top level
    if (calculationData[variableName] !== undefined) {
      value = calculationData[variableName];
      return value;
    }
  
    // Try legacy variable names
    const legacyMapping: Record<string, string | number> = {
      AantalWoningen: "aantalWoningen",
      Dakoppervlak: "dakOppervlak",
      LengteDakvlak: "dakLengte",
      BreedteWoning: "breedte",
      NettoGevelOppervlak: "gevelOppervlakNetto",
      VloerOppervlakteBeganeGrond: "vloerOppervlak",
      OmtrekKozijnen: "kozijnOmtrekTotaal",
      GevelOppervlak: "gevelOppervlakTotaal",
      "5%": 0.05,
    };
  
    // If it's a fixed numeric value like "5%"
    if (typeof legacyMapping[variableName] === "number") {
      return legacyMapping[variableName];
    }
  
    // Try legacy mapping in woningSpecifiek
    const mappedName = legacyMapping[variableName] as string;
    if (mappedName && calculationData.woningSpecifiek && 
        calculationData.woningSpecifiek[mappedName] !== undefined) {
      return calculationData.woningSpecifiek[mappedName];
    }
  
    // Try legacy mapping in top level
    if (mappedName && calculationData[mappedName] !== undefined) {
      return calculationData[mappedName];
    }
    
    // Try direct lookup in dimensions
    if (calculationData.dimensions && 
        calculationData.dimensions[variableName.toLowerCase()] !== undefined) {
      return calculationData.dimensions[variableName.toLowerCase()];
    }
  
    // Try as a numeric literal
    if (!isNaN(Number(variableName))) {
      return Number(variableName);
    }
  
    // No value found
    return undefined;
  }
  
  /**
   * Helper function to apply a mathematical operation
   */
  function applyOperation(currentValue: number, operand: number, operation: string, index: number): number {
    // For first operation or addition
    if (index === 0 || operation === "+") {
      return currentValue + operand;
    } 
    // Subtraction
    else if (operation === "-") {
      return currentValue - operand;
    } 
    // Multiplication
    else if (operation === "*") {
      return currentValue * operand;
    } 
    // Division (assumes division by zero is checked elsewhere)
    else if (operation === "/") {
      return currentValue / operand;
    }
    
    // Default fallback
    return currentValue;
  }