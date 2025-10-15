"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/app/actions/settingsActions";
import { Settings, CustomField } from "@/types/settings";

interface BudgetProps {
  totalAmount: number;
  numberOfUnits?: number;
  residenceCustomFields?: CustomField[];
}

export default function Budget({
  totalAmount,
  numberOfUnits = 0,
  residenceCustomFields = [],
}: BudgetProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const result = await getSettings();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateBudgetBreakdown = () => {
    if (!settings) return null;

    const directCosts = Math.max(0, totalAmount);

    // Calculate global custom fields amounts
    const globalCustomFieldsAmounts = settings.customFields?.map(field => ({
      name: field.name,
      amount: directCosts > 0 ? field.value || 0 : 0,
      type: field.type || 'euro'
    })) || [];

    // Calculate residence-specific custom fields amounts
    const residenceCustomFieldsAmounts = residenceCustomFields.map(field => {
      const fieldType = field.type || 'euro';
      let amount = 0;

      if (directCosts > 0) {
        if (fieldType === 'percentage') {
          // Calculate percentage of direct costs
          amount = directCosts * ((field.value || 0) / 100);
        } else {
          // Use absolute value for euro
          amount = field.value || 0;
        }
      }

      return {
        name: field.name,
        amount,
        type: fieldType
      };
    });

    // Legacy support for old custom fields
    const legacyCustomValue1Amount = directCosts > 0 ? settings.customValue1 || 0 : 0;
    const legacyCustomValue2Amount = directCosts > 0 ? settings.customValue2 || 0 : 0;

    // Calculate total custom fields amount (global + residence + legacy)
    const totalCustomFieldsAmount =
      globalCustomFieldsAmounts.reduce((sum, field) => sum + field.amount, 0) +
      residenceCustomFieldsAmounts.reduce((sum, field) => sum + field.amount, 0) +
      legacyCustomValue1Amount +
      legacyCustomValue2Amount;

    const subtotalDirectAndCustom = directCosts + totalCustomFieldsAmount;

    const abkMaterieelAmount =
      subtotalDirectAndCustom * ((settings.abkMaterieel || 0) / 100);
    const subtotalAfterABK = subtotalDirectAndCustom + abkMaterieelAmount;

    const afkoopAmount = subtotalDirectAndCustom * ((settings.afkoop || 0) / 100);
    const subtotalDirectABKAfkoop = subtotalAfterABK + afkoopAmount;

    const planuitwerkingAmount =
      subtotalDirectAndCustom * ((settings.kostenPlanuitwerking || 0) / 100);
    const subtotalAfterPlanuitwerking =
      subtotalDirectABKAfkoop + planuitwerkingAmount;

    const nazorgServiceAmount =
      subtotalDirectAndCustom * ((settings.nazorgService || 0) / 100);
    const carPiDicAmount =
      subtotalDirectAndCustom * ((settings.carPiDicVerzekering || 0) / 100);
    const bankgarantieAmount =
      subtotalDirectAndCustom * ((settings.bankgarantie || 0) / 100);
    const algemeneKostenAmount =
      subtotalDirectAndCustom * ((settings.algemeneKosten || 0) / 100);
    const risicoAmount = subtotalDirectAndCustom * ((settings.risico || 0) / 100);
    const winstAmount = subtotalDirectAndCustom * ((settings.winst || 0) / 100);

    const subtotalBouwkosten =
      subtotalAfterPlanuitwerking +
      nazorgServiceAmount +
      carPiDicAmount +
      bankgarantieAmount +
      algemeneKostenAmount +
      risicoAmount +
      winstAmount;

    const planvoorbereidingAmount =
      subtotalDirectAndCustom * ((settings.planvoorbereiding || 0) / 100);
    const huurdersbegeleidingAmount =
      subtotalDirectAndCustom * ((settings.huurdersbegeleiding || 0) / 100);

    const subtotalAfterBijkomendeKosten =
      subtotalBouwkosten + planvoorbereidingAmount + huurdersbegeleidingAmount;

    const totalExclVAT = subtotalAfterBijkomendeKosten;
    const vat = totalExclVAT * (settings.vatPercentage / 100);
    const finalAmount = totalExclVAT + vat;

    const pricePerUnitInclVAT =
      numberOfUnits > 0 ? finalAmount / numberOfUnits : 0;
    const pricePerUnitExclVAT =
      numberOfUnits > 0 ? totalExclVAT / numberOfUnits : 0;

    return {
      directCosts,
      globalCustomFieldsAmounts,
      residenceCustomFieldsAmounts,
      legacyCustomValue1Amount,
      legacyCustomValue2Amount,
      totalCustomFieldsAmount,
      subtotalDirectAndCustom,
      abkMaterieelAmount,
      subtotalAfterABK,
      afkoopAmount,
      subtotalDirectABKAfkoop,
      planuitwerkingAmount,
      subtotalAfterPlanuitwerking,
      nazorgServiceAmount,
      carPiDicAmount,
      bankgarantieAmount,
      algemeneKostenAmount,
      risicoAmount,
      winstAmount,
      subtotalBouwkosten,
      planvoorbereidingAmount,
      huurdersbegeleidingAmount,
      subtotalAfterBijkomendeKosten,
      totalExclVAT,
      vat,
      finalAmount,
      pricePerUnitInclVAT,
      pricePerUnitExclVAT,
    };
  };

  const breakdown = calculateBudgetBreakdown();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section className="budget tile">
      <div className="budget__header">
        <h4 className="tile-title">Kosten</h4>
        {!isLoading && breakdown && (
          <button
            onClick={toggleExpanded}
            className="budget__toggle-btn"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Verberg details" : "Toon details"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="budget__loading">Berekenen...</div>
      ) : !settings ? (
        <div className="budget__error">Kon instellingen niet laden</div>
      ) : (
        <>
          <div className="budget__amount">
            <span className="budget__currency">€</span>
            <span className="budget__sum">
              {breakdown ? formatCurrency(breakdown.finalAmount) : "0,00"}
            </span>
            <span className="budget__vat-note">incl. BTW</span>
          </div>

          {/* --- AANPASSING HIER --- */}
          {breakdown && (
            <div className="budget__total-excl-vat">
              <span>
                (€ {formatCurrency(breakdown.totalExclVAT)} excl. BTW)
              </span>
            </div>
          )}

          {breakdown && numberOfUnits > 0 && (
            <div className="budget__unit-prices">
              <div className="budget__unit-price-line">
                <span>Prijs per eenheid (incl. BTW)</span>
                <span>€ {formatCurrency(breakdown.pricePerUnitInclVAT)}</span>
              </div>
              <div className="budget__unit-price-line">
                <span>Prijs per eenheid (excl. BTW)</span>
                <span>€ {formatCurrency(breakdown.pricePerUnitExclVAT)}</span>
              </div>
              <div className="budget__unit-count-line">
                <span>Aantal woningen</span>
                <span>{numberOfUnits}</span>
              </div>
            </div>
          )}

          {isExpanded && breakdown && (
            <div className="budget__breakdown">
              {/* Rest van de uitklapbare details... */}
              <div className="budget__section">
                <div className="budget__line budget__line--main">
                  <span>Directe kosten</span>
                  <span>€ {formatCurrency(breakdown.directCosts)}</span>
                </div>
                {/* Display global custom fields */}
                {breakdown.globalCustomFieldsAmounts.map((field, index) => (
                  field.amount > 0 && (
                    <div key={`global-custom-field-${index}`} className="budget__line">
                      <span>{field.name}</span>
                      <span>€ {formatCurrency(field.amount)}</span>
                    </div>
                  )
                ))}
                {/* Display residence-specific custom fields */}
                {breakdown.residenceCustomFieldsAmounts.map((field, index) => (
                  field.amount > 0 && (
                    <div key={`residence-custom-field-${index}`} className="budget__line">
                      <span>{field.name}</span>
                      <span>€ {formatCurrency(field.amount)}</span>
                    </div>
                  )
                ))}

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal</span>
                  <span>
                    € {formatCurrency(breakdown.subtotalDirectAndCustom)}
                  </span>
                </div>
              </div>

              <div className="budget__section">
                <div className="budget__line">
                  <span>
                    ABK / materieel volgens begroting ({settings.abkMaterieel}%)
                  </span>
                  <span>€ {formatCurrency(breakdown.abkMaterieelAmount)}</span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal na ABK</span>
                  <span>€ {formatCurrency(breakdown.subtotalAfterABK)}</span>
                </div>
              </div>

              <div className="budget__section">
                <div className="budget__line">
                  <span>Afkoop ({settings.afkoop}%)</span>
                  <span>€ {formatCurrency(breakdown.afkoopAmount)}</span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Directe kosten + ABK + Afkoop</span>
                  <span>
                    € {formatCurrency(breakdown.subtotalDirectABKAfkoop)}
                  </span>
                </div>
              </div>

              <div className="budget__section">
                <div className="budget__line">
                  <span>
                    Kosten t.b.v. nadere planuitwerking (
                    {settings.kostenPlanuitwerking}%)
                  </span>
                  <span>
                    € {formatCurrency(breakdown.planuitwerkingAmount)}
                  </span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal na planuitwerking</span>
                  <span>
                    € {formatCurrency(breakdown.subtotalAfterPlanuitwerking)}
                  </span>
                </div>
              </div>

              <div className="budget__section">
                <div className="budget__line">
                  <span>Nazorg / Service ({settings.nazorgService}%)</span>
                  <span>€ {formatCurrency(breakdown.nazorgServiceAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>
                    CAR / PI / DIC verzekering ({settings.carPiDicVerzekering}%)
                  </span>
                  <span>€ {formatCurrency(breakdown.carPiDicAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>Bankgarantie ({settings.bankgarantie}%)</span>
                  <span>€ {formatCurrency(breakdown.bankgarantieAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>Algemene kosten (AK) ({settings.algemeneKosten}%)</span>
                  <span>
                    € {formatCurrency(breakdown.algemeneKostenAmount)}
                  </span>
                </div>

                <div className="budget__line">
                  <span>Risico ({settings.risico}%)</span>
                  <span>€ {formatCurrency(breakdown.risicoAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>Winst ({settings.winst}%)</span>
                  <span>€ {formatCurrency(breakdown.winstAmount)}</span>
                </div>

                <div className="budget__line budget__line--subtotal">
                  <span>Bouwkosten</span>
                  <span>€ {formatCurrency(breakdown.subtotalBouwkosten)}</span>
                </div>
              </div>

              <div className="budget__section">
                <div className="budget__line">
                  <span>Planvoorbereiding ({settings.planvoorbereiding}%)</span>
                  <span>
                    € {formatCurrency(breakdown.planvoorbereidingAmount)}
                  </span>
                </div>

                <div className="budget__line">
                  <span>
                    Huurdersbegeleiding ({settings.huurdersbegeleiding}%)
                  </span>
                  <span>
                    € {formatCurrency(breakdown.huurdersbegeleidingAmount)}
                  </span>
                </div>
              </div>

              <div className="budget__section">
                <div className="budget__line budget__line--subtotal">
                  <span>Totale aanbieding excl. BTW</span>
                  <span>€ {formatCurrency(breakdown.totalExclVAT)}</span>
                </div>

                <div className="budget__line">
                  <span>BTW ({settings.vatPercentage}%)</span>
                  <span>€ {formatCurrency(breakdown.vat)}</span>
                </div>

                <div className="budget__line budget__line--final">
                  <span>Totaal incl. BTW</span>
                  <span>€ {formatCurrency(breakdown.finalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .budget__unit-prices {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #eaeaea;
        }

        .budget__unit-price-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Styling voor de eerste regel: Prijs per eenheid (incl. BTW) */
        .budget__unit-price-line:first-child {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .budget__unit-price-line:first-child span:last-child {
          font-weight: 600;
          color: #1a1a1a;
        }

        /* Styling voor de tweede regel: Prijs per eenheid (excl. BTW) */
        .budget__unit-price-line:nth-child(2) {
          font-size: 14px;
          color: #666;
        }

        .budget__unit-price-line:nth-child(2) span:last-child {
          font-weight: 400; /* Normaal gewicht */
        }

        /* Styling voor aantal eenheden */
        .budget__unit-count-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #666;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #f0f0f0;
        }

        .budget__unit-count-line span:last-child {
          font-weight: 500;
        }
        .budget {
          display: flex;
          flex-direction: column;
        }
        .budget__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .budget__toggle-btn {
          background: transparent;
          border: none;
          color: var(--accent-color, #4361ee);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
          min-width: 92px;
        }
        .budget__toggle-btn:hover {
          background: rgba(67, 97, 238, 0.1);
        }
        .budget__amount {
          display: flex;
          align-items: baseline;
          /* margin-bottom: 10px; */ /* Verwijderd voor betere uitlijning met nieuwe regel */
          justify-content: center;
        }

        /* --- NIEUWE STYLE VOOR TOTAAL EXCL. BTW --- */
        .budget__total-excl-vat {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-top: -4px;
          margin-bottom: 16px;
        }

        .budget__unit-prices {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eaeaea;
        }
        .budget__unit-price-line {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          margin-bottom: 6px;
          color: #333;
        }
        .budget__unit-price-line span:last-child {
          font-weight: 600;
        }
        .budget__currency {
          font-size: 24px;
          font-weight: bold;
          margin-right: 4px;
        }
        .budget__sum {
          font-size: 32px;
          font-weight: bold;
        }
        .budget__vat-note {
          font-size: 14px;
          color: #666;
          margin-left: 8px;
        }
        .budget__breakdown {
          margin-top: 16px;
          border-top: 1px solid #eaeaea;
          padding-top: 16px;
        }
        .budget__section {
          margin-bottom: 16px;
        }
        .budget__section:last-child {
          margin-bottom: 0;
        }
        .budget__heading {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #eaeaea;
        }
        .budget__line {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .budget__line span {
          font-size: 15px;
        }
        .budget__line--subtotal span {
          font-size: 16px;
        }
        .budget__line--main {
          font-weight: 600;
        }
        .budget__line--subtotal {
          border-top: 1px dashed #eaeaea;
          padding-top: 8px;
          margin-top: 8px;
        }
        .budget__line--subtotal span {
          font-weight: 600;
        }
        .budget__line--final span {
          font-weight: 700;
          font-size: 18px;
          padding-top: 12px;
          margin-top: 12px;
        }
        .budget__loading {
          font-size: 16px;
          color: #666;
          text-align: center;
          padding: 20px 0;
        }
        .budget__error {
          font-size: 16px;
          color: #e53e3e;
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
    </section>
  );
}
