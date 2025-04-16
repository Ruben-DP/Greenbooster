import {
  Factory,
  Flame,
  ReceiptEuro,
  ReceiptText,
  Volume1,
} from "lucide-react";

interface Measure {
  name: string;
  price?: number;
  heatDemandValue?: number | string;
  nuisance?: number | string;
  maintenanceCost40Years?: number;
  maintenanceCostPerYear?: number;
  [key: string]: any;
}

interface StatsProps {
  selectedMeasures: Measure[];
  totalHeatDemand: number;
}

export default function Stats({
  selectedMeasures = [],
  totalHeatDemand = 0,
}: StatsProps) {
  // Format price with Dutch formatting
  const formatPrice = (price: number) => {
    return price.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate highest nuisance indicator
  const highestNuisance = selectedMeasures.reduce((highest, measure) => {
    const nuisanceValue = measure.nuisance
      ? parseFloat(String(measure.nuisance))
      : 0;
    return Math.max(highest, isNaN(nuisanceValue) ? 0 : nuisanceValue);
  }, 0);

  // Calculate CO2 reduction
  const co2Reduction = totalHeatDemand * 0.21;

  // Calculate total cost (initial investment)
  const totalCost = selectedMeasures.reduce((sum, measure) => {
    return sum + (measure.price || 0);
  }, 0);

  // Calculate total maintenance cost over 40 years
  const totalMaintenance40Years = selectedMeasures.reduce((sum, measure) => {
    return sum + (measure.maintenanceCost40Years || 0);
  }, 0);

  // Calculate total maintenance cost per year
  const totalMaintenancePerYear = selectedMeasures.reduce((sum, measure) => {
    return sum + (measure.maintenanceCostPerYear || 0);
  }, 0);

  // Calculate Total Cost of Ownership (TCO) over 40 years
  const totalTCO = totalCost + totalMaintenance40Years;

  return (
    <section className="stats tile">
      <div className="tile-title">
        Resultaten
      </div>
      {/* <div className="stats__row">
        <span className="stats__label">CO₂ Reductie:</span>
        <span className="stats__value">
          <div className="icon-grouper">
            <Factory />
            <strong>{co2Reduction.toFixed(0)} kg/m²</strong>
          </div>
        </span>
      </div> */}

      {totalMaintenancePerYear > 0 && (
        <div className="stats__row">
          <span className="stats__label"><ReceiptText size={20} /> Onderhoudskosten per jaar:</span>
          <span className="stats__value">
            <div className="icon-grouper">
              € {formatPrice(totalMaintenancePerYear)}
            </div>
          </span>
        </div>
      )}
      {totalTCO > 0 && (
        <>
          <div className="stats__row">
            <span className="stats__label"><ReceiptEuro size={20} /> TCO (40 jaar):</span>
            <span className="stats__value">
              <div className="icon-grouper">
                € {formatPrice(totalTCO)}
              </div>
            </span>
          </div>

          {/* <div className="stats__row">
            <span className="stats__label">Gemiddelde jaarlijkse kosten:</span>
            <span className="stats__value">
              € {formatPrice(totalTCO / 40)}
            </span>
          </div> */}
        </>
      )}
      {totalHeatDemand > 0 && (
        <div className="stats__row">
          <span className="stats__label"><Flame size={20} /> Warmtebehoefte: </span>
          <span className="stats__value">
            <div className="icon-grouper">
              {totalHeatDemand.toFixed(1)}
              
            </div>
          </span>
        </div>
      )}
      {highestNuisance > 0 && (
        <div className="stats__row">
          <span className="stats__label"><Volume1 size={20} /> Hinder indicator:</span>
          <span className="stats__value">
            <div className="icon-grouper">
              {highestNuisance.toFixed(1)}
              
            </div>
          </span>
        </div>
      )}

      {totalMaintenancePerYear <= 0 &&
        totalTCO <= 0 &&
        totalHeatDemand <= 0 &&
        highestNuisance <= 0 && <span>Geen maatregelen geselecteerd</span>}
    </section>
  );
}
