import {
  BadgeEuro,
  CloudAlert,
  Factory,
  Flame,
  Heater,
  ReceiptEuro,
  ReceiptText,
  Volume1,
} from "lucide-react";
import styles from "./Stats.module.scss";

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
    <section className={`${styles.stats} tile`}>
      <div className="tile-title">Resultaten</div>
      {/* <div className={styles.stats__row}>
        <span className={styles.stats__label}>CO₂ Reductie:</span>
        <span className={styles.stats__value}>
          <div className={styles["icon-grouper"]}>
            <Factory />
            <strong>{co2Reduction.toFixed(0)} kg/m²</strong>
          </div>
        </span>
      </div> */}

      {totalMaintenancePerYear > 0 && (
        <div className={styles.stats__row}>
          <span className={styles.stats__label}>
            <ReceiptText size={20} /> Onderhoudskosten per jaar:
          </span>
          <span className={styles.stats__value}>
            <div className={styles["icon-grouper"]}>
              € {formatPrice(totalMaintenancePerYear)}
            </div>
          </span>
        </div>
      )}
      {totalTCO > 0 && (
        <>
          <div className={styles.stats__row}>
            <span className={styles.stats__label}>
              <BadgeEuro size={20} /> TCO (40 jaar):
            </span>
            <span className={styles.stats__value}>
              <div className={styles["icon-grouper"]}>€ {formatPrice(totalTCO)}</div>
            </span>
          </div>

          {/* <div className={styles.stats__row}>
            <span className={styles.stats__label}>Gemiddelde jaarlijkse kosten:</span>
            <span className={styles.stats__value}>
              € {formatPrice(totalTCO / 40)}
            </span>
          </div> */}
        </>
      )}
      {totalHeatDemand > 0 && (
        <div className={styles.stats__row}>
          <span className={styles.stats__label}>
            <Flame size={20} /> Warmtebehoefte:{" "}
          </span>
          <span className={styles.stats__value}>
            <div className={styles["icon-grouper"]}>{totalHeatDemand.toFixed(1)}</div>
          </span>
        </div>
      )}
      {highestNuisance > 0 && (
        <div className={styles.stats__row}>
          <span className={styles.stats__label}>
            <Volume1 size={20} /> Hinder indicator:
          </span>
          <span className={styles.stats__value}>
            <div className={styles["icon-grouper"]}>{highestNuisance.toFixed(1)}</div>
          </span>
        </div>
      )}
      {totalHeatDemand > 0 && (
        <>
          <div className={styles.stats__row}>
            <span className={styles.stats__label}>
              <CloudAlert size={20} />
              Besparing Co2 uitstoot
            </span>
            <span className={styles.stats__value}>
              <div className={`${styles["icon-grouper"]} ${styles.alert}`}>Geen berekening</div>
            </span>
          </div>
          <div className={styles.stats__row}>
            <span className={styles.stats__label}>
              <ReceiptEuro size={20} />
              NCW (Netto contante waarde)
            </span>
            <span className={styles.stats__value}>
              <div className={`${styles["icon-grouper"]} ${styles.alert}`}>Geen berekening</div>
            </span>
          </div>
          <div className={styles.stats__row}>
            <span className={styles.stats__label}>
              <Heater size={20} />
              Verbruik per maand
            </span>
            <span className={styles.stats__value}>
              <div className={`${styles["icon-grouper"]} ${styles.alert}`}>Geen berekening</div>
            </span>
          </div>
        </>
      )}

      {totalMaintenancePerYear <= 0 &&
        totalTCO <= 0 &&
        totalHeatDemand <= 0 &&
        highestNuisance <= 0 && <span>Geen maatregelen geselecteerd</span>}
    </section>
  );
}
