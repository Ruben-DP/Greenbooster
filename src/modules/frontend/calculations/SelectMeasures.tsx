import { Flame } from "lucide-react";


interface MeasurePrice {
  name?: string;
  unit?: string;
  calculation: any[];
  price?: number;
}

interface Measure {
  name: string;
  group?: string;
  measure_prices?: MeasurePrice[];
  maintenanceCostPerYear?: number;
  price?: number;
  heatDemandValue?: number;
  [key: string]: any;
}

interface GroupedMeasures {
  [key: string]: Measure[];
}

interface SelectedMeasuresProps {
  measures: Measure[];
  onRemove: (measure: Measure) => void;
}

export default function SelectedMeasures({
  measures,
  onRemove,
}: SelectedMeasuresProps) {
  // Group measures by their group property
  const groupedMeasures = measures.reduce<GroupedMeasures>((groups, measure) => {
    if (!measure) return groups;
    const groupName = measure.group || "Overig";
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(measure);
    return groups;
  }, {});

  const total = measures.reduce(
    (sum, measure) => sum + (measure.price || 0),
    0
  );

  // Calculate total yearly maintenance cost
  const totalMaintenanceCost = measures.reduce(
    (sum, measure) => sum + (measure.maintenanceCostPerYear || 0),
    0
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <section className="tile selected-measures">
      <h2 className="selected-measures__title">Geselecteerde maatregelen</h2>
      {measures.length === 0 ? (
        <p className="selected-measures__empty">
          Geen maatregelen geselecteerd
        </p>
      ) : (
        <>
          {Object.entries(groupedMeasures).map(([groupName, groupMeasures]) => (
            <div key={groupName} className="selected-measures__group">
              <h3 className="selected-measures__group-title">{groupName}</h3>
              <ul className="selected-measures__list">
                {groupMeasures.map((measure, index) => (
                  <li
                    key={`${measure.name}-${index}`}
                    className="selected-measures__item"
                  >
                    <div className="selected-measures__content">
                      <span className="selected-measures__name">
                        {measure.name}
                      </span>
                      <div>
                        <span className="selected-measures__price">
                          {/* {measure.maintenanceCostPerYear && (
                            <span>
                              {" "}
                              €{formatPrice(measure.maintenanceCostPerYear)} p.j.
                            </span>
                          )} */}
                          € {measure.price ? formatPrice(measure.price) : "0,00"}
                        </span>

                        <button
                          onClick={() => onRemove({ ...measure, action: 'remove' })}
                          className="selected-measures__remove"
                          aria-label="Verwijder maatregel"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    {/* <div className="selected-measures__bottom-bar">
                      <div className="selected-measures__details">
                        <div className="icon-values">
                          {measure.heatDemandValue && (
                            <>
                              <Flame />
                              <span className="selected-measures__heat">
                                <strong>{measure.heatDemandValue}</strong>kWh/m²
                              </span>
                            </>
                          )}
                        </div>
                        {measure.maintenanceCostPerYear > 0 && (
                          <span className="selected-measures__maintenance">
                            € {formatPrice(measure.maintenanceCostPerYear)} p.j.
                          </span>
                        )}
                      </div>
                    </div> */}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
