"use client";
import React, { useState, useEffect } from "react";
import { TextField } from "../fields/TextField";
import { SearchSelect } from "../fields/SearchSelect";
import { Trash2, ExternalLink, Plus } from "lucide-react";
import { getMeasuresByIds, searchDocuments } from "@/app/actions/crudActions";
import SearchBar from "../search/SearchBar";
import SearchResults from "../search/SearchResults";

type FormData = {
  naam: string;
  measureIds: string[];
  woningId?: string;
};

type Props = {
  item: Partial<FormData>;
  isEditing: boolean;
  pendingChanges: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

type CalculationItem = {
  type: "variable" | "operator";
  value: string;
  id?: string;
};

type PriceItem = {
  name: string;
  calculation: CalculationItem[];
  price?: number;
  pricesPerType?: any;
};

type Measure = {
  _id: string;
  name: string;
  measure_prices?: PriceItem[];
  mjob_prices?: PriceItem[];
  splitPrices?: boolean;
};

const ScenarioForm = ({ item, isEditing, pendingChanges, onChange }: Props) => {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [searchMeasures, setSearchMeasures] = useState<Measure[]>([]);
  const [isLoadingMeasures, setIsLoadingMeasures] = useState(false);

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  const data: FormData = {
    naam: item.naam || "",
    measureIds: item.measureIds || [],
    woningId: item.woningId || "",
  };

  // Fetch measures when measureIds change
  useEffect(() => {
    const fetchMeasures = async () => {
      const currentMeasureIds = getValue("measureIds", data.measureIds);
      if (currentMeasureIds && currentMeasureIds.length > 0) {
        setIsLoadingMeasures(true);
        const fetchedMeasures = await getMeasuresByIds(currentMeasureIds);
        setMeasures(fetchedMeasures);
        setIsLoadingMeasures(false);
      } else {
        setMeasures([]);
      }
    };
    fetchMeasures();
  }, [item.measureIds, pendingChanges["measureIds"]]);

  // Format calculation formula as a string
  const formatCalculation = (calculation: CalculationItem[]) => {
    if (!calculation || calculation.length === 0) return "Geen formule";

    return calculation.map((item) => item.value).join(" ");
  };

  // Get formulas for begroting (measure_prices)
  const getBegrotingFormulas = (measure: Measure) => {
    if (!measure.measure_prices || measure.measure_prices.length === 0) {
      return ["Geen begroting formules"];
    }
    return measure.measure_prices.map(
      (priceItem) => `${priceItem.name || "Onbekend"}: ${formatCalculation(priceItem.calculation)}`
    );
  };

  // Get formulas for onderhoudskosten (mjob_prices)
  const getOnderhoudsFormulas = (measure: Measure) => {
    if (!measure.mjob_prices || measure.mjob_prices.length === 0) {
      return ["Geen onderhoudskosten formules"];
    }
    return measure.mjob_prices.map(
      (priceItem) => `${priceItem.name || "Onbekend"}: ${formatCalculation(priceItem.calculation)}`
    );
  };

  // Handle removing a measure from the list
  const handleRemoveMeasure = (measureId: string) => {
    const currentMeasureIds = getValue("measureIds", data.measureIds);
    const updatedMeasureIds = currentMeasureIds.filter((id: string) => id !== measureId);
    handleChange("measureIds", currentMeasureIds, updatedMeasureIds);
  };

  // Handle adding a measure to the list
  const handleAddMeasure = (measure: Measure) => {
    const currentMeasureIds = getValue("measureIds", data.measureIds);
    if (!currentMeasureIds.includes(measure._id)) {
      const updatedMeasureIds = [...currentMeasureIds, measure._id];
      handleChange("measureIds", currentMeasureIds, updatedMeasureIds);
    }
  };

  // Search for measures
  const handleSearchMeasures = async (searchTerm: string) => {
    setIsLoadingMeasures(true);
    try {
      const results = await searchDocuments<Measure>("retrofittingMeasures", searchTerm, "name");
      setSearchMeasures(results);
    } catch (error) {
      console.error("Error searching measures:", error);
    } finally {
      setIsLoadingMeasures(false);
    }
  };

  // Navigate to measure detail page
  const handleNavigateToMeasure = (measureId: string) => {
    window.open(`/admin/maatregelen?measure=${measureId}`, "_blank");
  };

  return (
    <div className="form">
      <div className="form__section">
        <TextField
          label="Naam"
          value={getValue("naam", data.naam)}
          type="text"
          required={true}
          isEditing={isEditing}
          onChange={(next) =>
            handleChange("naam", getValue("naam", data.naam), next)
          }
        />

        <SearchSelect
          label="Woning"
          value={getValue("woningId", data.woningId || "")}
          dynamicOptions={{
            collection: "woningen",
            displayField: "projectInformation.adres",
          }}
          placeholder="Kies woning"
          required={false}
          isEditing={isEditing}
          onChange={(next) =>
            handleChange("woningId", data.woningId || "", next)
          }
        />

        <h4 className="form__heading">Maatregelen</h4>

        <div className="scenario-form__container">
          {/* List of measures */}
          <div className="scenario-form__measures-list">
            {isLoadingMeasures && <div>Laden...</div>}
            {!isLoadingMeasures && measures.length === 0 && (
              <div className="scenario-form__empty">Geen maatregelen geselecteerd</div>
            )}
            {!isLoadingMeasures && measures.length > 0 && (
              <div className="scenario-form__measures">
                {measures.map((measure) => (
                  <div key={measure._id} className="form__card">
                    <div className="scenario-form__measure-header">
                      <h5>{measure.name}</h5>
                      <div className="scenario-form__measure-actions">
                        <button
                          type="button"
                          className="button button--icon"
                          onClick={() => handleNavigateToMeasure(measure._id)}
                          title="Open maatregel"
                        >
                          <ExternalLink size={18} />
                        </button>
                        {isEditing && (
                          <button
                            type="button"
                            className="button button--icon button--remove"
                            onClick={() => handleRemoveMeasure(measure._id)}
                            title="Verwijderen"
                          >
                            <Trash2 size={18} color="red" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="scenario-form__measure-details">
                      <div className="scenario-form__measure-field">
                        <label>Begroting:</label>
                        <div className="scenario-form__formulas">
                          {getBegrotingFormulas(measure).map((formula, idx) => (
                            <span key={idx}>{formula}</span>
                          ))}
                        </div>
                      </div>
                      <div className="scenario-form__measure-field">
                        <label>Onderhoudskosten:</label>
                        <div className="scenario-form__formulas">
                          {getOnderhoudsFormulas(measure).map((formula, idx) => (
                            <span key={idx}>{formula}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search area at bottom to add measures */}
          {isEditing && (
            <div className="scenario-form__search-area">
              <h5>Maatregel toevoegen</h5>
              <SearchBar
                onSearch={handleSearchMeasures}
                isLoading={isLoadingMeasures}
              />
              <SearchResults
                items={searchMeasures}
                onSelect={handleAddMeasure}
                displayField="name"
                groupBy="group"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioForm;
