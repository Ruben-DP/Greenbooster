"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from "@react-pdf/renderer";

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf'
// });

interface ModernPdfDownloadButtonProps {
  selectedResidence: any;
  selectedMeasures: any[];
  totalBudget: number;
  totalHeatDemand: number;
  settings: any;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#1d70b8",
  },
  logoContainer: {
    flexDirection: "row",
    gap: 15,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: "contain",
  },
  energyLabelImage: {
    width: 75,
    height: 38,
    objectFit: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1d70b8",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1d70b8",
  },
  residenceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    width: 120,
  },
  value: {
    flex: 1,
  },
  measureItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#1d70b8",
  },
  measureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  measureName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  measurePrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1d70b8",
  },
  measureDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    fontSize: 9,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingLeft: 10,
  },
  breakdownFormula: {
    fontSize: 8,
    color: "#666",
    marginTop: 2,
  },
  costBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingVertical: 2,
  },
  costBreakdownLabel: {
    flex: 1,
  },
  costBreakdownValue: {
    width: 100,
    textAlign: "right",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    fontWeight: "bold",
  },
  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    paddingVertical: 4,
    borderTopWidth: 2,
    borderTopColor: "#1d70b8",
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#e8f0f7",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footerLogos: {
    flexDirection: "row",
    gap: 10,
  },
  footerLogo: {
    width: 75,
    height: 38,
    objectFit: "contain",
  },
  disclaimer: {
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    flex: 1,
  },
  groupContainer: {
    marginBottom: 15,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    backgroundColor: "#e8f0f7",
    padding: 5,
  },
  maintenanceSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  maintenanceTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#666",
  },
});

const ModernPdfDownloadButton = ({
  selectedResidence,
  selectedMeasures,
  totalBudget,
  totalHeatDemand,
  settings,
}: ModernPdfDownloadButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return price.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const determineEnergyLabel = (originalEnergy: number, heatDemandReduction: number) => {
    if (!originalEnergy) return "?";

    const newEnergy = originalEnergy - heatDemandReduction;
    const labels = {
      "A++++": 0, "A+++": 50, "A++": 75, "A+": 105, "A": 160,
      "B": 190, "C": 250, "D": 290, "E": 335, "F": 380, "G": 1000,
    };

    const sortedLabels = Object.entries(labels).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < sortedLabels.length - 1; i++) {
      if (newEnergy < sortedLabels[i + 1][1]) {
        return sortedLabels[i][0];
      }
    }
    return "G";
  };

  const calculateBudgetBreakdown = () => {
    if (!settings) return null;

    const directCosts = Math.max(0, totalBudget);

    // Calculate global custom fields amounts
    const globalCustomFieldsAmounts = settings.customFields?.map((field: any) => ({
      name: field.name,
      amount: directCosts > 0 ? field.value || 0 : 0,
      type: field.type || 'euro'
    })) || [];

    // Calculate residence-specific custom fields amounts
    const residenceCustomFieldsAmounts = (selectedResidence?.customFields || []).map((field: any) => {
      const fieldType = field.type || 'euro';
      let amount = 0;

      if (directCosts > 0) {
        if (fieldType === 'percentage') {
          amount = directCosts * ((field.value || 0) / 100);
        } else {
          amount = field.value || 0;
        }
      }

      return {
        name: field.name,
        amount,
        type: fieldType
      };
    });

    // Legacy support
    const legacyCustomValue1Amount = directCosts > 0 ? settings.customValue1 || 0 : 0;
    const legacyCustomValue2Amount = directCosts > 0 ? settings.customValue2 || 0 : 0;

    const totalCustomFieldsAmount =
      globalCustomFieldsAmounts.reduce((sum: number, field: any) => sum + field.amount, 0) +
      residenceCustomFieldsAmounts.reduce((sum: number, field: any) => sum + field.amount, 0) +
      legacyCustomValue1Amount +
      legacyCustomValue2Amount;

    const subtotalDirectAndCustom = directCosts + totalCustomFieldsAmount;
    const abkMaterieelAmount = subtotalDirectAndCustom * ((settings.abkMaterieel || 0) / 100);
    const subtotalAfterABK = subtotalDirectAndCustom + abkMaterieelAmount;
    const afkoopAmount = subtotalDirectAndCustom * ((settings.afkoop || 0) / 100);
    const subtotalDirectABKAfkoop = subtotalAfterABK + afkoopAmount;
    const planuitwerkingAmount = subtotalDirectAndCustom * ((settings.kostenPlanuitwerking || 0) / 100);
    const subtotalAfterPlanuitwerking = subtotalDirectABKAfkoop + planuitwerkingAmount;
    const nazorgServiceAmount = subtotalDirectAndCustom * ((settings.nazorgService || 0) / 100);
    const carPiDicAmount = subtotalDirectAndCustom * ((settings.carPiDicVerzekering || 0) / 100);
    const bankgarantieAmount = subtotalDirectAndCustom * ((settings.bankgarantie || 0) / 100);
    const algemeneKostenAmount = subtotalDirectAndCustom * ((settings.algemeneKosten || 0) / 100);
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
    const planvoorbereidingAmount = subtotalDirectAndCustom * ((settings.planvoorbereiding || 0) / 100);
    const huurdersbegeleidingAmount = subtotalDirectAndCustom * ((settings.huurdersbegeleiding || 0) / 100);
    const subtotalAfterBijkomendeKosten = subtotalBouwkosten + planvoorbereidingAmount + huurdersbegeleidingAmount;
    const totalExclVAT = subtotalAfterBijkomendeKosten;
    const vat = totalExclVAT * (settings.vatPercentage / 100);
    const finalAmount = totalExclVAT + vat;

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
    };
  };

  // Group measures by their group property
  const groupedMeasures = selectedMeasures.reduce<{[key: string]: any[]}>((groups, measure) => {
    if (!measure) return groups;
    const groupName = measure.group || "Overig";
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(measure);
    return groups;
  }, {});

  const MyDocument = () => {
    const projectInfo = selectedResidence?.projectInformation || {};
    const energyInfo = selectedResidence?.energyDetails || {};
    const currentEnergyUsage = energyInfo.huidigVerbruik || 0;
    // Calculate current label from energy usage, just like EnergyLabel component
    const currentLabel = currentEnergyUsage ? determineEnergyLabel(currentEnergyUsage, 0) : "?";
    const newLabel = determineEnergyLabel(currentEnergyUsage, totalHeatDemand);
    const breakdown = calculateBudgetBreakdown();

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header with logos */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image src="/images/alphaLogo.png" style={styles.logo} />
              <Image src="/images/giesbersLogo.png" style={styles.logo} />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                Nieuw label: {newLabel}
              </Text>
            </View>
          </View>

          {/* Residence Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Woninginformatie</Text>
            <View style={styles.residenceInfo}>
              <View style={styles.infoColumn}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Adres:</Text>
                  <Text style={styles.value}>{projectInfo.adres || "-"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Postcode:</Text>
                  <Text style={styles.value}>{projectInfo.postcode || "-"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Plaats:</Text>
                  <Text style={styles.value}>{projectInfo.plaats || "-"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Bouwperiode:</Text>
                  <Text style={styles.value}>{projectInfo.bouwPeriode || "-"}</Text>
                </View>
              </View>
              <View style={styles.infoColumn}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Huidig label:</Text>
                  <Text style={styles.value}>{currentLabel}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nieuw label:</Text>
                  <Text style={styles.value}>{newLabel}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Warmtebehoefte:</Text>
                  <Text style={styles.value}>{totalHeatDemand.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Measures */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geselecteerde Maatregelen</Text>
            {Object.entries(groupedMeasures).map(([groupName, groupMeasures]) => (
              <View key={groupName} style={styles.groupContainer}>
                <Text style={styles.groupTitle}>{groupName}</Text>
                {groupMeasures.map((measure, index) => (
                  <View key={`${measure.name}-${index}`} style={styles.measureItem}>
                    <View style={styles.measureHeader}>
                      <Text style={styles.measureName}>{measure.name}</Text>
                      <Text style={styles.measurePrice}>
                        € {formatPrice(measure.price || 0)}
                      </Text>
                    </View>

                    {/* Additional info */}
                    {(measure.nuisance || measure.heatDemandValue) && (
                      <View style={{ marginBottom: 6 }}>
                        {measure.nuisance && (
                          <View style={styles.measureDetail}>
                            <Text>Hinder indicator:</Text>
                            <Text>{measure.nuisance}</Text>
                          </View>
                        )}
                        {measure.heatDemandValue && (
                          <View style={styles.measureDetail}>
                            <Text>Warmtebehoefte:</Text>
                            <Text>{measure.heatDemandValue}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Price calculations breakdown */}
                    {measure.priceCalculations && measure.priceCalculations.length > 0 && (
                      <View style={{ marginTop: 6 }}>
                        <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
                          Prijsberekening:
                        </Text>
                        {measure.priceCalculations.map((calc: any, idx: number) => (
                          <View key={`calc-${idx}`} style={styles.breakdownItem}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 9 }}>{calc.name || `Berekening ${idx + 1}`}</Text>
                              {calc.steps && calc.steps.length > 0 && (
                                <Text style={styles.breakdownFormula}>
                                  ({calc.steps.map((step: any, stepIdx: number) => {
                                    const operationPart = stepIdx > 0 ? ` ${step.operation} ` : '';
                                    const valuePart = step.value.toFixed(2);
                                    const unitPart = (step.variable === 'aantalWoningen' || step.variable === 'AantalWoningen') ? ' woningen' : '';
                                    return `${operationPart}${valuePart}${unitPart}`;
                                  }).join('')} = {calc.quantity.toFixed(2)} {calc.unit} × €{calc.unitPrice.toFixed(2)})
                                </Text>
                              )}
                              {(!calc.steps || calc.steps.length === 0) && (
                                <Text style={styles.breakdownFormula}>
                                  ({calc.quantity.toFixed(2)} {calc.unit} × €{calc.unitPrice.toFixed(2)})
                                </Text>
                              )}
                            </View>
                            <Text style={{ fontSize: 9 }}>€ {formatPrice(calc.totalPrice)}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Maintenance costs */}
                    {measure.maintenanceCalculations && measure.maintenanceCalculations.length > 0 && (
                      <View style={styles.maintenanceSection}>
                        <Text style={styles.maintenanceTitle}>Onderhoudskosten:</Text>
                        {measure.maintenanceCalculations.map((calc: any, idx: number) => {
                          const mjob = measure.mjob_prices?.find((j: any) => j.name === calc.name);
                          let yearlyJobCost = 0;
                          if (mjob && mjob.cycle && mjob.cycle > 0) {
                            yearlyJobCost = calc.totalPrice / mjob.cycle;
                          }

                          return (
                            <View key={`maint-${idx}`} style={styles.breakdownItem}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 9 }}>{calc.name || `Onderhoud ${idx + 1}`}</Text>
                                {calc.steps && calc.steps.length > 0 && (
                                  <Text style={styles.breakdownFormula}>
                                    ({calc.steps.map((step: any, stepIdx: number) => {
                                      const operationPart = stepIdx > 0 ? ` ${step.operation} ` : '';
                                      const valuePart = step.value.toFixed(2);
                                      const unitPart = (step.variable === 'aantalWoningen' || step.variable === 'AantalWoningen') ? ' woningen' : '';
                                      return `${operationPart}${valuePart}${unitPart}`;
                                    }).join('')} = {calc.quantity.toFixed(2)} {calc.unit} × €{calc.unitPrice.toFixed(2)})
                                  </Text>
                                )}
                                {(!calc.steps || calc.steps.length === 0) && (
                                  <Text style={styles.breakdownFormula}>
                                    ({calc.quantity.toFixed(2)} {calc.unit} × €{calc.unitPrice.toFixed(2)})
                                  </Text>
                                )}
                                {mjob && (
                                  <Text style={styles.breakdownFormula}>
                                    € {formatPrice(calc.totalPrice)} elke {mjob.cycle} jaar
                                  </Text>
                                )}
                              </View>
                              <Text style={{ fontSize: 9 }}>€ {formatPrice(yearlyJobCost)} p.j.</Text>
                            </View>
                          );
                        })}
                        {measure.maintenanceCostPerYear && (
                          <View style={styles.breakdownItem}>
                            <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                              Gemiddelde onderhoudskosten per jaar:
                            </Text>
                            <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                              € {formatPrice(measure.maintenanceCostPerYear)} p.j.
                            </Text>
                          </View>
                        )}
                        {measure.maintenanceCost40Years && (
                          <View style={styles.breakdownItem}>
                            <Text style={{ fontSize: 9 }}>Totaal over 40 jaar:</Text>
                            <Text style={{ fontSize: 9 }}>
                              € {formatPrice(measure.maintenanceCost40Years)}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Cost Breakdown */}
          {breakdown && settings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kosten Breakdown</Text>

              {/* Direct costs section */}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.costBreakdownRow}>
                  <Text style={[styles.costBreakdownLabel, { fontWeight: "bold" }]}>
                    Directe kosten
                  </Text>
                  <Text style={[styles.costBreakdownValue, { fontWeight: "bold" }]}>
                    € {formatPrice(breakdown.directCosts)}
                  </Text>
                </View>

                {/* Global custom fields */}
                {breakdown.globalCustomFieldsAmounts.map((field: any, index: number) => (
                  field.amount > 0 && (
                    <View key={`global-${index}`} style={styles.costBreakdownRow}>
                      <Text style={styles.costBreakdownLabel}>{field.name}</Text>
                      <Text style={styles.costBreakdownValue}>
                        € {formatPrice(field.amount)}
                      </Text>
                    </View>
                  )
                ))}

                {/* Residence custom fields */}
                {breakdown.residenceCustomFieldsAmounts.map((field: any, index: number) => (
                  field.amount > 0 && (
                    <View key={`residence-${index}`} style={styles.costBreakdownRow}>
                      <Text style={styles.costBreakdownLabel}>{field.name}</Text>
                      <Text style={styles.costBreakdownValue}>
                        € {formatPrice(field.amount)}
                      </Text>
                    </View>
                  )
                ))}

                <View style={styles.subtotalRow}>
                  <Text style={styles.costBreakdownLabel}>Subtotaal</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.subtotalDirectAndCustom)}
                  </Text>
                </View>
              </View>

              {/* ABK section */}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    ABK / materieel volgens begroting ({settings.abkMaterieel}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.abkMaterieelAmount)}
                  </Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.costBreakdownLabel}>Subtotaal na ABK</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.subtotalAfterABK)}
                  </Text>
                </View>
              </View>

              {/* Afkoop section */}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>Afkoop ({settings.afkoop}%)</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.afkoopAmount)}
                  </Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.costBreakdownLabel}>Directe kosten + ABK + Afkoop</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.subtotalDirectABKAfkoop)}
                  </Text>
                </View>
              </View>

              {/* Planuitwerking section */}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    Kosten t.b.v. nadere planuitwerking ({settings.kostenPlanuitwerking}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.planuitwerkingAmount)}
                  </Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.costBreakdownLabel}>Subtotaal na planuitwerking</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.subtotalAfterPlanuitwerking)}
                  </Text>
                </View>
              </View>

              {/* Other costs section */}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    Nazorg / Service ({settings.nazorgService}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.nazorgServiceAmount)}
                  </Text>
                </View>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    CAR / PI / DIC verzekering ({settings.carPiDicVerzekering}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.carPiDicAmount)}
                  </Text>
                </View>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    Bankgarantie ({settings.bankgarantie}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.bankgarantieAmount)}
                  </Text>
                </View>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    Algemene kosten (AK) ({settings.algemeneKosten}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.algemeneKostenAmount)}
                  </Text>
                </View>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>Risico ({settings.risico}%)</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.risicoAmount)}
                  </Text>
                </View>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>Winst ({settings.winst}%)</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.winstAmount)}
                  </Text>
                </View>
                <View style={styles.subtotalRow}>
                  <Text style={styles.costBreakdownLabel}>Bouwkosten</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.subtotalBouwkosten)}
                  </Text>
                </View>
              </View>

              {/* Additional costs */}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    Planvoorbereiding ({settings.planvoorbereiding}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.planvoorbereidingAmount)}
                  </Text>
                </View>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>
                    Huurdersbegeleiding ({settings.huurdersbegeleiding}%)
                  </Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.huurdersbegeleidingAmount)}
                  </Text>
                </View>
              </View>

              {/* Final totals */}
              <View style={{ marginTop: 10 }}>
                <View style={styles.subtotalRow}>
                  <Text style={styles.costBreakdownLabel}>Totale aanbieding excl. BTW</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.totalExclVAT)}
                  </Text>
                </View>
                <View style={styles.costBreakdownRow}>
                  <Text style={styles.costBreakdownLabel}>BTW ({settings.vatPercentage}%)</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.vat)}
                  </Text>
                </View>
                <View style={styles.finalTotalRow}>
                  <Text style={styles.costBreakdownLabel}>Totaal incl. BTW</Text>
                  <Text style={styles.costBreakdownValue}>
                    € {formatPrice(breakdown.finalAmount)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Footer with logos and disclaimer */}
          <View style={styles.footer}>
            <View style={styles.footerLogos}>
              <Image src="/images/alphaLogo.png" style={styles.footerLogo} />
              <Image src="/images/giesbersLogo.png" style={styles.footerLogo} />
            </View>
            <Text style={styles.disclaimer}>
              Disclaimer - uitkomsten zijn een benadering - er kunnen geen rechten aan ontleent worden
            </Text>
          </View>
        </Page>
      </Document>
    );
  };

  const handleDownload = async () => {
    if (!selectedResidence || selectedMeasures.length === 0) {
      alert("Selecteer eerst een woning en maatregelen voordat je een PDF genereert.");
      return;
    }

    setIsLoading(true);

    try {
      const blob = await pdf(<MyDocument />).toBlob();
      saveAs(blob, "kostencalculator-modern.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Er is een fout opgetreden bij het genereren van de PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="pdf-download-btn modern"
      disabled={isLoading}
      style={{
        padding: "8px 16px",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        width: "100%"
      }}
    >
      {isLoading ? "Modern PDF wordt gegenereerd..." : "Download Modern PDF"}
    </button>
  );
};

export default ModernPdfDownloadButton;
