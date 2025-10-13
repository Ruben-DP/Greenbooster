/**
 * Rekenblad Service
 * Contains all derived calculation logic for woningen
 */

// Helper functies
const berekenOppervlakte = (breedte: number, hoogte: number) => breedte * hoogte;
const berekenOmtrek = (breedte: number, hoogte: number) => 2 * (breedte + hoogte);

export class RekenBladService {
  /**
   * Calculate all derived values for a woning
   */
  berekenAfgeleideWaarden(data: any) {
    // Gevel berekeningen
    const gevelBerekeningen = {
      brutoGevelOppervlakVoor: data.measurementDetails.breed * data.measurementDetails.hoogte,
      brutoGevelOppervlakAchter: data.measurementDetails.breed * data.measurementDetails.hoogte,
      brutoGevelOppervlakTotaal: data.measurementDetails.breed * data.measurementDetails.hoogte * 2,
      brutoGevelKopgevelPerStuk: data.measurementDetails.diepte * data.measurementDetails.hoogte,
      brutoGevelOppervlakTotaalMetKopgevels: (data.measurementDetails.breed * data.measurementDetails.hoogte * 2) +
        (data.measurementDetails.diepte * data.measurementDetails.hoogte * 2),
    };

    // Raam oppervlaktes berekenen
    const ramenVoor = [
      berekenOppervlakte(data.measurementDetails.voordeur_breedte || 0, data.measurementDetails.voordeur_hoogte || 0),
      berekenOppervlakte(data.measurementDetails.woonkamer_raam1_breedte || 0, data.measurementDetails.woonkamer_raam1_hoogte || 0),
      berekenOppervlakte(data.measurementDetails.woonkamer_raam2_breedte || 0, data.measurementDetails.woonkamer_raam2_hoogte || 0),
      berekenOppervlakte(data.measurementDetails.woonkamer_raam3_breedte || 0, data.measurementDetails.woonkamer_raam3_hoogte || 0),
    ].reduce((sum, area) => sum + area, 0);

    const ramenAchter = [
      berekenOppervlakte(data.measurementDetails.achterdeur_breedte || 0, data.measurementDetails.achterdeur_hoogte || 0),
      berekenOppervlakte(data.measurementDetails.woonkamer2_raam1_breedte || 0, data.measurementDetails.woonkamer2_raam1_hoogte || 0),
      berekenOppervlakte(data.measurementDetails.woonkamer2_raam2_breedte || 0, data.measurementDetails.woonkamer2_raam2_hoogte || 0),
      berekenOppervlakte(data.measurementDetails.woonkamer2_raam3_breedte || 0, data.measurementDetails.woonkamer2_raam3_hoogte || 0),
    ].reduce((sum, area) => sum + area, 0);

    const kozijnenBerekeningen = {
      kozijnOppervlakteVoor: ramenVoor,
      kozijnOppervlakteAchter: ramenAchter,
      kozijnOppervlakteWoning: ramenVoor + ramenAchter,
    };

    // Dak berekeningen
    const dakBerekeningen = {
      dakOppervlak: data.measurementDetails.breed * data.measurementDetails.diepte,
      nadenDakvlak: 2 * (data.measurementDetails.breed + data.measurementDetails.diepte),
      lengteDakvlak: Math.sqrt(Math.pow(data.measurementDetails.diepte/2, 2) + Math.pow(data.measurementDetails.hoogte, 2)),
    };

    // Netto gevel berekening
    const nettoGevelBerekeningen = {
      nettoGevelOppervlakTotaal: gevelBerekeningen.brutoGevelOppervlakTotaalMetKopgevels - kozijnenBerekeningen.kozijnOppervlakteWoning,
    };

    // Kozijn categorieën berekenen
    const alleKozijnen = [
      ...Object.entries(data.measurementDetails)
        .filter(([key]) => key.includes('_breedte'))
        .map(([key, breedte]) => {
          const hoogteKey = key.replace('_breedte', '_hoogte');
          const hoogte = data.measurementDetails[hoogteKey];
          return berekenOppervlakte(Number(breedte) || 0, Number(hoogte) || 0);
        })
    ].filter(opp => opp > 0);

    const kozijnCategorieën = {
      kozijn05: alleKozijnen.filter(opp => opp > 0.5 && opp <= 1.0).reduce((sum, opp) => sum + opp, 0),
      kozijn10: alleKozijnen.filter(opp => opp > 1.0 && opp <= 1.5).reduce((sum, opp) => sum + opp, 0),
      kozijn15: alleKozijnen.filter(opp => opp > 1.5 && opp <= 2.0).reduce((sum, opp) => sum + opp, 0),
      kozijn20: alleKozijnen.filter(opp => opp > 2.0 && opp <= 2.5).reduce((sum, opp) => sum + opp, 0),
      kozijn25: alleKozijnen.filter(opp => opp > 2.5 && opp <= 3.0).reduce((sum, opp) => sum + opp, 0),
      kozijn30: alleKozijnen.filter(opp => opp > 3.0 && opp <= 3.5).reduce((sum, opp) => sum + opp, 0),
      kozijn35: alleKozijnen.filter(opp => opp > 3.5 && opp <= 4.0).reduce((sum, opp) => sum + opp, 0),
      kozijn40: alleKozijnen.filter(opp => opp > 4.0).reduce((sum, opp) => sum + opp, 0),
    };

    // Omtrek berekeningen
    const omtrekBerekeningen = {
      omtrekVoordeur: berekenOmtrek(data.measurementDetails.voordeur_breedte, data.measurementDetails.voordeur_hoogte),
      omtrekAchterdeur: berekenOmtrek(data.measurementDetails.achterdeur_breedte, data.measurementDetails.achterdeur_hoogte),
      omtrekKozijnenTotaal: Object.entries(data.measurementDetails)
        .filter(([key]) => key.includes('_breedte'))
        .reduce((sum, [key, breedte]) => {
          const hoogteKey = key.replace('_breedte', '_hoogte');
          const hoogte = data.measurementDetails[hoogteKey];
          return sum + berekenOmtrek(Number(breedte) || 0, Number(hoogte) || 0);
        }, 0),
    };

    // Vloer en ruimte berekeningen
    const vloerBerekeningen = {
      vloerOppervlakteBeganeGrond: data.measurementDetails.breed * data.measurementDetails.diepte,
      aantalSlaapkamers: Object.keys(data.measurementDetails)
        .filter(key => key.startsWith('slaapkamer') && key.endsWith('_breedte'))
        .length,
      omtrekSandwichElementen: 2 * (data.measurementDetails.breed + data.measurementDetails.diepte),
    };

    return {
      rekenwaarden: {
        ...gevelBerekeningen,
        ...kozijnenBerekeningen,
        ...dakBerekeningen,
        ...nettoGevelBerekeningen,
        ...kozijnCategorieën,
        ...omtrekBerekeningen,
        ...vloerBerekeningen,
      }
    };
  }
}

// Export a singleton instance for backward compatibility with the old export
export const berekenAfgeleideWaarden = (data: any) => {
  const service = new RekenBladService();
  return service.berekenAfgeleideWaarden(data);
};
