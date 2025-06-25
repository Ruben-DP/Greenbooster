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
  pricesPerType?: {
    grondgebonden: number;
    portiek: number;
    gallerij: number;
  };
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
  calculationData: Record<string, any> | null,
  residenceType: string,
  splitPrices: boolean
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
      let calculationValid = true;
      let stepError = "";
      let variableWarnings: string[] = [];

      // Parse the calculation into tokens that can be evaluated with respect to operator precedence
      const tokens: Array<{type: 'value' | 'operator', value: number | string}> = [];
      let currentOperator = "+"; // Default start operator
      
      // Process each step in the calculation formula to collect all tokens
      measurePrice.calculation.forEach((calc) => {
        if (!calc?.type || !calc?.value) return;

        // If this is an operator, just update the current operation
        if (calc.type === "operator") {
          currentOperator = calc.value;
          tokens.push({ type: 'operator', value: currentOperator });
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
          
          // Check for division by zero preemptively
          if (tokens.length > 0 && 
              tokens[tokens.length-1].type === 'operator' && 
              tokens[tokens.length-1].value === "/" && 
              numValue === 0) {
            stepError = "Deling door nul poging";
            variableWarnings.push(stepError);
            calculationValid = false;
            return;
          }

          tokens.push({ type: 'value', value: numValue });
          
          // Record this calculation step for traceability
          formulaSteps.push({
            variable: calc.value,
            value: numValue,
            operation: tokens.length > 2 ? tokens[tokens.length-2].value : '+', 
            // We'll update this later with correct result
            currentResult: 0,
          });
        }
      });

      // If calculation had errors during token collection, return error info
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

      // Evaluate the expression with proper operator precedence
      const evaluationResult = evaluateExpression(tokens);
      
      // Update the formulaSteps with correct intermediate results
      let runningTotal = 0;
      for (let i = 0; i < formulaSteps.length; i++) {
        if (i === 0) {
          runningTotal = formulaSteps[i].value;
        } else {
          const operation = formulaSteps[i].operation;
          const value = formulaSteps[i].value;
          
          // This simple approach isn't entirely correct for proper operator precedence,
          // but maintains backward compatibility with the logging structure
          runningTotal = applyOperation(runningTotal, value, operation, i);
        }
        formulaSteps[i].currentResult = runningTotal;
      }

      // Calculate final price using the unit price
      let unitPrice = 0;
      if (splitPrices && measurePrice.pricesPerType) {
        if (residenceType.toLowerCase().includes('portiek')) {
          unitPrice = measurePrice.pricesPerType.portiek ?? measurePrice.price ?? 0;
        } else if (residenceType.toLowerCase().includes('galerij') || residenceType.toLowerCase().includes('gallerij')) {
          unitPrice = measurePrice.pricesPerType.gallerij ?? measurePrice.price ?? 0;
        } else { // 'grondgebonden' and default
          unitPrice = measurePrice.pricesPerType.grondgebonden ?? measurePrice.price ?? 0;
        }
      } else {
        unitPrice = measurePrice.price || 0;
      }
      result = evaluationResult * unitPrice;

      // Return successful calculation
      return {
        name: measurePrice.name || "Unnamed",
        unitPrice: unitPrice,
        quantity: evaluationResult,
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
 * Evaluates an expression with proper operator precedence (PEMDAS/MVDWOA)
 */
function evaluateExpression(tokens: Array<{type: 'value' | 'operator', value: number | string}>): number {
  // If no tokens, return 0
  if (tokens.length === 0) return 0;
  
  // If just one value token, return it
  if (tokens.length === 1 && tokens[0].type === 'value') return tokens[0].value as number;
  
  // First perform multiplications and divisions
  const secondPassTokens: Array<{type: 'value' | 'operator', value: number | string}> = [];
  let i = 0;
  
  // Start with first token
  if (tokens[0].type === 'value') {
    secondPassTokens.push(tokens[0]);
    i = 1;
  } else {
    // If first token is an operator, we assume a leading 0
    secondPassTokens.push({ type: 'value', value: 0 });
    i = 0;
  }
  
  // Process multiplications and divisions
  while (i < tokens.length) {
    // Get the operator
    const operator = tokens[i].value;
    
    // If we're at the end or next token is not a value, just add and continue
    if (i + 1 >= tokens.length || tokens[i + 1].type !== 'value') {
      secondPassTokens.push(tokens[i]);
      i++;
      continue;
    }
    
    // Get the next value
    const nextValue = tokens[i + 1].value as number;
    
    // Handle multiplication and division with precedence
    if (operator === '*' || operator === '/') {
      const lastValue = secondPassTokens.pop()!.value as number;
      const result = operator === '*' ? lastValue * nextValue : lastValue / nextValue;
      secondPassTokens.push({ type: 'value', value: result });
      i += 2; // Skip the operator and the value we just processed
    } else {
      // For + and -, just add to tokens for second pass
      secondPassTokens.push(tokens[i]);
      i++;
    }
  }
  
  // Now handle additions and subtractions in a second pass
  let result = secondPassTokens[0].type === 'value' ? secondPassTokens[0].value as number : 0;
  for (let j = 1; j < secondPassTokens.length; j += 2) {
    const operator = secondPassTokens[j].value as string;
    
    // If we're at the end or next token is not a value, break
    if (j + 1 >= secondPassTokens.length || secondPassTokens[j + 1].type !== 'value') {
      break;
    }
    
    const value = secondPassTokens[j + 1].value as number;
    
    if (operator === '+') {
      result += value;
    } else if (operator === '-') {
      result -= value;
    }
  }
  
  return result;
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
 * Note: This is kept for backward compatibility with logging, but should
 * not be used for the actual calculation (which uses evaluateExpression instead)
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