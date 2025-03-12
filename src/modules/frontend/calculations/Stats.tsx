export default function Stats({ selectedMeasures = [] }) {
  const initialHeatDemand = 0;
  const totalHeatDemand = selectedMeasures.reduce((total, measure) => {
    const demandValue = measure.heatDemandValue
      ? parseFloat(measure.heatDemandValue)
      : 0;
    return total + (isNaN(demandValue) ? 0 : demandValue);
  }, initialHeatDemand);

  const highestNuisance = selectedMeasures.reduce((highest, measure) => {
    const nuisanceValue = measure.nuisance ? parseFloat(measure.nuisance) : 0;
    return Math.max(highest, isNaN(nuisanceValue) ? 0 : nuisanceValue);
  }, 0);

  //this needs to be changed i dont know how to calculate this
  const co2Reduction = totalHeatDemand * 0.21;
  console.log(selectedMeasures);
  return (
    <section className="stats tile">
      <div className="stats__row">
        <span className="stats__label">Warmtebehoefte: </span>
        <span className="stats__value">
          <strong>{totalHeatDemand.toFixed(1)} kWh/m²</strong>
        </span>
      </div>

      <div className="stats__row">
        <span className="stats__label">Hinder indicator:</span>
        <span className="stats__value">
          <strong> {highestNuisance.toFixed(1)}</strong>
        </span>
      </div>

      <div className="stats__row">
        <span className="stats__label">CO₂ Reductie:</span>
        <span className="stats__value">
          <strong> {co2Reduction.toFixed(0)} kg/m²</strong>
        </span>
      </div>

      <div className="stats__row">
        <span className="stats__label">TCO (40 jaar):</span>
        <span className="stats__value">MJOB 40 + Totale Kosten</span>
      </div>
      <div className="stats__row">
        <span className="stats__label">Gemiddelde jaarlijkse kosten:</span>
        <span className="stats__value">MJOB 40 / 40</span>
      </div>
    </section>
  );
}
