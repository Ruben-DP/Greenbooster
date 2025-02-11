import React from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";

type Props = {
  item: any;
  isEditing: boolean;
  pendingChanges: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

const ResidenceForm = ({ item, isEditing, pendingChanges, onChange }: Props) => {
  if (!item) return null;

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  return (
    <div className="form">
      <div className="form__section">
        <h4 className="form__heading">Project informatie</h4>
        <div className="form__fields">
          <TextField
            label="Projectnummer"
            value={getValue("projectInformation.projectNumber", item.projectInformation?.projectNumber)}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "projectInformation.projectNumber",
              item.projectInformation?.projectNumber,
              next
            )}
          />
          <TextField
            label="Complexnaam/nr"
            value={getValue("projectInformation.complexName", item.projectInformation?.complexName)}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "projectInformation.complexName",
              item.projectInformation?.complexName,
              next
            )}
          />
          <TextField
            label="Aantal VHE"
            value={String(getValue("projectInformation.aantalVHE", item.projectInformation?.aantalVHE))}
            type="number"
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "projectInformation.aantalVHE",
              item.projectInformation?.aantalVHE,
              Number(next)
            )}
          />
          <TextField
            label="Adres"
            value={getValue("projectInformation.adres", item.projectInformation?.adres)}
            type="text"
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "projectInformation.adres",
              item.projectInformation?.adres,
              next
            )}
          />
        </div>

        <h4 className="form__heading">Energie details</h4>
        <div className="form__fields">
          <TextField
            label="Huidig label"
            value={getValue("energyDetails.huidigLabel", item.energyDetails?.huidigLabel)}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "energyDetails.huidigLabel",
              item.energyDetails?.huidigLabel,
              next
            )}
          />
          <TextField
            label="Huidig energie"
            value={String(getValue("energyDetails.huidigEnergie", item.energyDetails?.huidigEnergie))}
            type="number"
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "energyDetails.huidigEnergie",
              item.energyDetails?.huidigEnergie,
              Number(next)
            )}
          />
          <SelectField
            label="Voorkosten scenario"
            value={getValue("energyDetails.voorkostenScenario", item.energyDetails?.voorkostenScenario)}
            options={["Scenario A", "Scenario B", "Scenario C"]} // Add your actual scenarios
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "energyDetails.voorkostenScenario",
              item.energyDetails?.voorkostenScenario,
              next
            )}
          />
        </div>

        <h4 className="form__heading">Type & Afmetingen</h4>
        <div className="form__fields">
          <SelectField
            label="Type flat/woning"
            value={getValue("measurementDetails.typeFlat", item.measurementDetails?.typeFlat)}
            options={["Type A", "Type B", "Type C"]} // Add your actual types
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "measurementDetails.typeFlat",
              item.measurementDetails?.typeFlat,
              next
            )}
          />
          <TextField
            label="Breed"
            value={getValue("measurementDetails.breed", item.measurementDetails?.breed)}
            type="text"
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "measurementDetails.breed",
              item.measurementDetails?.breed,
              next
            )}
          />
          <TextField
            label="Diepte"
            value={getValue("measurementDetails.diepte", item.measurementDetails?.diepte)}
            type="text"
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "measurementDetails.diepte",
              item.measurementDetails?.diepte,
              next
            )}
          />
          <TextField
            label="Hoogte"
            value={String(getValue("measurementDetails.hoogte", item.measurementDetails?.hoogte))}
            type="number"
            isEditing={isEditing}
            onChange={(next) => handleChange(
              "measurementDetails.hoogte",
              item.measurementDetails?.hoogte,
              Number(next)
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ResidenceForm;