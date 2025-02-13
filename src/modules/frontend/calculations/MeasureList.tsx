"use client";

import { searchDocuments } from "@/app/actions/crudActions";
import { useMeasureData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";

interface Calculation {
  type: string;
  value: string;
  position?: number;
}

interface MeasurePrice {
  name?: string;
  unit?: string;
  calculation: Calculation[];
}

interface Measure {
  name: string;
  group?: string;
  measure_prices?: MeasurePrice[];
  [key: string]: any;
}

interface GroupedMeasures {
  [key: string]: Measure[];
}

interface MeasureListProps {
  residenceData: Record<string, any> | null;
}

const calculateMeasure = (measurePrice: MeasurePrice, residenceData: Record<string, any>) => {
  if (!measurePrice?.calculation || !residenceData) {
    return { success: false, message: 'Benodigde gegevens ontbreken' };
  }

  try {
    let result = 1;
    let steps: string[] = [];
    
    for (const calc of measurePrice.calculation) {
      if (!calc?.type || !calc?.value) continue;

      if (calc.type === "variable" || calc.type === "value") {
        const value = residenceData[calc.value];
        
        if (value === undefined || value === null) {
          return { 
            success: false, 
            message: `Waarde voor ${calc.value} ontbreekt` 
          };
        }

        const numValue = Number(value);
        if (isNaN(numValue)) {
          return { 
            success: false, 
            message: `Waarde voor ${calc.value} (${value}) is geen getal` 
          };
        }

        result *= numValue;
        steps.push(`${calc.value}: ${numValue}`);
      }
    }

    return { 
      success: true, 
      value: result,
      steps: steps.join(' × ')
    };
  } catch (error) {
    console.error('Critical calculation error:', error);
    return { 
      success: false, 
      message: 'Berekening mislukt' 
    };
  }
};

export default function MeasureList({ residenceData }: MeasureListProps) {
  const { searchItems, items, isLoading, error } = useMeasureData();
  const [selectedResidence, setSelectedResidence] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    searchItems("");
  }, []);

  useEffect(() => {
    if (residenceData) {
      setSelectedResidence(residenceData);
    }
  }, [residenceData]);

  if (isLoading) return <div>Maatregelen laden...</div>;
  if (error) return <div>Fout bij laden maatregelen: {error}</div>;
  if (!items || items.length === 0) return <div>Geen maatregelen gevonden</div>;

  const groupedItems = items.reduce<GroupedMeasures>((groups, item) => {
    if (!item) return groups;
    const groupName = item.group || "Overig";
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(item as Measure);
    return groups;
  }, {});

  return (
    <div className="measure-list tile">
      {Object.entries(groupedItems).map(([groupName, groupItems]) => (
        <div key={groupName} className="measure-group">
          <h2 className="measure-group-title">{groupName}</h2>
          <div className="measure">
            {groupItems.map((measure, index) => (
              <div key={`${measure.name}-${index}`} className="measure__name">
                <div>{measure.name}</div>
                <div className="price">€ 17.389,-</div>
                {/* {measure.measure_prices?.map((price, priceIndex) => (
                  <div key={`${measure.name}-price-${priceIndex}`}>
                    {price.name && <div>Prijs: {price.name}</div>}
                    {price.calculation && selectedResidence && (
                      <div>
                        {(() => {
                          const result = calculateMeasure(price, selectedResidence);
                          if (result.success) {
                            return (
                              <>
                                Berekende waarde: {result.value}
                                {price.unit && ` ${price.unit}`}
                                <div className="text-sm text-gray-500">
                                  ({result.steps})
                                </div>
                              </>
                            );
                          } else {
                            return (
                              <div className="text-sm text-gray-500">
                                Kan niet berekenen: {result.message}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                ))} */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}