"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/app/actions/settingsActions";
import { Settings } from "@/types/settings";

interface BudgetProps {
  totalAmount: number;
}

export default function Budget({ totalAmount }: BudgetProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch settings from database
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

  // Format currency values
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate budget breakdown with all factors from settings
  const calculateBudgetBreakdown = () => {
    if (!settings) return null;

    // Start with base amount (direct costs)
    const directCosts = Math.max(0, totalAmount);

    // ABK / Materieel
    const abkMaterieelAmount = directCosts * (settings.abkMaterieel / 100);

    // Afkoop
    const afkoopAmount = directCosts * (settings.afkoop / 100);

    // Kosten t.b.v. nadere planuitwerking
    const planuitwerkingAmount =
      directCosts * (settings.kostenPlanuitwerking / 100);

    // Nazorg / Service
    const nazorgServiceAmount = directCosts * (settings.nazorgService / 100);

    // CAR / PI / DIC verzekering
    const carPiDicAmount = directCosts * (settings.carPiDicVerzekering / 100);

    // Bankgarantie
    const bankgarantieAmount = directCosts * (settings.bankgarantie / 100);

    // Subtotal 1 - Direct costs plus initial factors
    const subtotal1 =
      directCosts +
      abkMaterieelAmount +
      afkoopAmount +
      planuitwerkingAmount +
      nazorgServiceAmount +
      carPiDicAmount +
      bankgarantieAmount;

    // Algemene kosten (AK)
    const algemeneKostenAmount = subtotal1 * (settings.algemeneKosten / 100);

    // Risico
    const risicoAmount = subtotal1 * (settings.risico / 100);

    // Winst
    const winstAmount = subtotal1 * (settings.winst / 100);

    // Subtotal 2 - After AK, Risico, Winst
    const subtotal2 =
      subtotal1 + algemeneKostenAmount + risicoAmount + winstAmount;

    // Planvoorbereiding
    const planvoorbereidingAmount =
      subtotal1 * (settings.planvoorbereiding / 100);

    // Huurdersbegeleiding
    const huurdersbegeleidingAmount =
      subtotal1 * (settings.huurdersbegeleiding / 100);

    // Custom fields if they exist
    const customValue1Amount = subtotal1 * ((settings.customValue1 || 0) / 100);
    const customValue2Amount = subtotal1 * ((settings.customValue2 || 0) / 100);

    // Subtotal 3 - After all factors before VAT
    const subtotal3 =
      subtotal2 +
      planvoorbereidingAmount +
      huurdersbegeleidingAmount +
      customValue1Amount +
      customValue2Amount;

    // BTW (VAT)
    const vat = subtotal3 * (settings.vatPercentage / 100);

    // Final amount including VAT
    const finalAmount = subtotal3 + vat;

    return {
      directCosts,
      abkMaterieelAmount,
      afkoopAmount,
      planuitwerkingAmount,
      nazorgServiceAmount,
      carPiDicAmount,
      bankgarantieAmount,
      subtotal1,
      algemeneKostenAmount,
      risicoAmount,
      winstAmount,
      subtotal2,
      planvoorbereidingAmount,
      huurdersbegeleidingAmount,
      customValue1Amount,
      customValue2Amount,
      subtotal3,
      vat,
      finalAmount,
    };
  };

  const breakdown = calculateBudgetBreakdown();

  // Toggle expanded view
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

          {isExpanded && breakdown && (
            <div className="budget__breakdown">
              <div className="budget__section">
                <div className="budget__line budget__line--main">
                  <span>Directe kosten</span>
                  <span>€ {formatCurrency(breakdown.directCosts)}</span>
                </div>

                <div className="budget__line">
                  <span>
                    ABK / materieel volgens begroting ({settings.abkMaterieel}%)
                  </span>
                  <span>€ {formatCurrency(breakdown.abkMaterieelAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>Afkoop ({settings.afkoop}%)</span>
                  <span>€ {formatCurrency(breakdown.afkoopAmount)}</span>
                </div>

                <div className="budget__line">
                  <span>
                    Kosten t.b.v. nadere planuitwerking (
                    {settings.kostenPlanuitwerking}%)
                  </span>
                  <span>
                    € {formatCurrency(breakdown.planuitwerkingAmount)}
                  </span>
                </div>

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

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal</span>
                  <span>€ {formatCurrency(breakdown.subtotal1)}</span>
                </div>
              </div>

              <div className="budget__section">
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
                  <span>Subtotaal</span>
                  <span>€ {formatCurrency(breakdown.subtotal2)}</span>
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

                {settings.customValue1 > 0 && (
                  <div className="budget__line">
                    <span>
                      {settings.customValue1Name || "Extra veld 1"} (
                      {settings.customValue1}%)
                    </span>
                    <span>
                      € {formatCurrency(breakdown.customValue1Amount)}
                    </span>
                  </div>
                )}

                {settings.customValue2 > 0 && (
                  <div className="budget__line">
                    <span>
                      {settings.customValue2Name || "Extra veld 2"} (
                      {settings.customValue2}%)
                    </span>
                    <span>
                      € {formatCurrency(breakdown.customValue2Amount)}
                    </span>
                  </div>
                )}

                <div className="budget__line budget__line--subtotal">
                  <span>Subtotaal excl. BTW</span>
                  <span>€ {formatCurrency(breakdown.subtotal3)}</span>
                </div>
              </div>

              <div className="budget__section">
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
          min-width:92px;
        }

        .budget__toggle-btn:hover {
          background: rgba(67, 97, 238, 0.1);
        }

        .budget__amount {
          display: flex;
          align-items: baseline;
          margin-bottom: 10px;
          justify-content:center;
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

        .budget__line {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .budget__line--main {
          font-weight: 600;
        } 

        .budget__line--subtotal {
          font-weight: 600;
          border-top: 1px dashed #eaeaea;
          padding-top: 8px;
          margin-top: 8px;
        }
        .budget__line--subtotal span{
          font-weight: 600;
        }

        .budget__line--final {
          font-weight: 700;
          font-size: 16px;
          border-top: 2px solid #eaeaea;
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
