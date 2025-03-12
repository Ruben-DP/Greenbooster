interface Measure {
  name: string;
  group?: string;
  measure_prices?: MeasurePrice[];
  [key: string]: any;
}

interface SelectedMeasuresProps {
  measures: Measure[];
  onRemove: (measure: Measure) => void;
  heatDemand: string;
}

export default function SelectedMeasures({
  measures,
  onRemove,
}: SelectedMeasuresProps) {
  const total = measures.reduce(
    (sum, measure) => sum + (measure.price || 0),
    0
  );

  console.log("selected measures", measures);
  return (
    <section className="tile selected-measures">
      <h2 className="selected-measures__title">Geselecteerde maatregelen</h2>
      {measures.length === 0 ? (
        <p className="selected-measures__empty">
          Geen maatregelen geselecteerd
        </p>
      ) : (
        <>
          <ul className="selected-measures__list">
            {measures.map((measure, index) => (
              <li
                key={`${measure.name}-${index}`}
                className="selected-measures__item"
              >
                <div className="selected-measures__content">
                  <span className="selected-measures__name">
                    {measure.name}
                  </span>

                  <span className="selected-measures__price">
                    € {measure.price?.toLocaleString("nl-NL")},-
                  </span>

                  <button
                    onClick={() => onRemove(measure)}
                    className="selected-measures__remove"
                    aria-label="Verwijder maatregel"
                  >
                    ×
                  </button>
                </div>
                <div className="selected-measures__bottom-bar">
                  <span>
                    {measure.heatDemandValue && measure.heatDemandValue}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
