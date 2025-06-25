import React from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";

type WindowDimensions = {
  breedte: number;
  hoogte: number;
};

type BuildingType = {
  naam: string;
  type: string;
  voorgevelKozijnen: {
    voordeur: WindowDimensions;
    toilet: WindowDimensions;
    woonkamer: {
      raam1: WindowDimensions;
      raam2: WindowDimensions;
      raam3: WindowDimensions;
    };
    slaapkamer1: {
      raam1: WindowDimensions;
      raam2: WindowDimensions;
    };
    slaapkamer2: {
      raam1: WindowDimensions;
      raam2: WindowDimensions;
    };
  };
  achtergevelKozijnen: {
    achterdeur: WindowDimensions;
    keuken: WindowDimensions;
    woonkamer: {
      raam1: WindowDimensions;
      raam2: WindowDimensions;
      raam3: WindowDimensions;
    };
    slaapkamer3: {
      raam1: WindowDimensions;
      raam2: WindowDimensions;
    };
    slaapkamer4: {
      raam1: WindowDimensions;
      raam2: WindowDimensions;
    };
  };
  ruimten: {
    woonkamer: WindowDimensions;
    achterkamer: WindowDimensions;
    slaapkamer1: WindowDimensions;
    slaapkamer2: WindowDimensions;
    slaapkamer3: WindowDimensions;
    slaapkamer4: WindowDimensions;
    keuken: WindowDimensions;
    badkamer: WindowDimensions;
    hal: WindowDimensions;
    toilet: WindowDimensions;
    hoogte: number;
  };
};

type Props = {
  item: Partial<BuildingType>;
  isEditing: boolean;
  pendingChanges?: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
  onValueChange?: (path: string, value: any) => void;
  containerClassName?: string;
  compact?: boolean;
  // New prop to indicate if this is for creating a new type
  isCreatingNewType?: boolean;
};

const WindowInputs = ({
  basePath,
  label,
  dimensions,
  isEditing,
  getValue,
  handleChange,
}: {
  basePath: string;
  label: string;
  dimensions: WindowDimensions;
  isEditing: boolean;
  getValue: (path: string, original: any) => any;
  handleChange: (path: string, old: any, next: any) => void;
}) => (
  <div className="form__group">
    <h5>{label}</h5>
    <TextField
      label="Breedte"
      value={String(getValue(`${basePath}.breedte`, dimensions?.breedte))}
      type="number"
      isEditing={isEditing}
      onChange={(next) =>
        handleChange(`${basePath}.breedte`, dimensions?.breedte, Number(next))
      }
    />
    <TextField
      label="Lengte"
      value={String(getValue(`${basePath}.hoogte`, dimensions?.hoogte))}
      type="number"
      isEditing={isEditing}
      onChange={(next) =>
        handleChange(`${basePath}.hoogte`, dimensions?.hoogte, Number(next))
      }
    />
  </div>
);

const TypeForm = ({ 
  item, 
  isEditing, 
  pendingChanges = {}, 
  onChange,
  onValueChange,
  containerClassName = "",
  compact = false,
  isCreatingNewType = false
}: Props) => {
  if (!item) return null;

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) => {
    if (onChange) {
      onChange(path, old, next);
    } else if (onValueChange) {
      onValueChange(path, next);
    }
  };

  const buildingTypes = [
    { label: "Grondgebonden", value: "grondgebonden" },
    { label: "Portiekflat", value: "portiekflat" },
    { label: "Galerijflat", value: "galerijflat" },
  ];

  return (
    <div className={`${containerClassName} ${compact ? "type-form--compact" : ""}`}>
      <div className="type-title">
        <div className="title-fields-container" style={{ display: "flex", gap: "20px" }}>
          <TextField
            label="Naam"
            value={getValue("naam", item.naam) || ""}
            type="text"
            required={isCreatingNewType}
            isEditing={isEditing}
            onChange={(next) => handleChange("naam", item.naam, next)}
          />
          <SelectField
            label="Type"
            value={getValue("type", item.type) || ""}
            options={buildingTypes}
            required={isCreatingNewType}
            isEditing={isEditing}
            onChange={(next) => handleChange("type", item.type, next)}
          />
        </div>
      </div>
      <div className="type-form">
        <div className="form__section">
          <h4 className="form__heading">Voorgevel Kozijnen</h4>
          <div className="form__fields">
            <WindowInputs
              basePath="voorgevelKozijnen.voordeur"
              label="Voordeur"
              dimensions={item.voorgevelKozijnen?.voordeur}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
            <WindowInputs
              basePath="voorgevelKozijnen.toilet"
              label="Toilet"
              dimensions={item.voorgevelKozijnen?.toilet}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
            <div className="form__group">
              <h5>Woonkamer</h5>
              {["raam1", "raam2", "raam3"].map((raam) => (
                <WindowInputs
                  key={raam}
                  basePath={`voorgevelKozijnen.woonkamer.${raam}`}
                  label={`Raam ${raam.slice(-1)}`}
                  dimensions={item.voorgevelKozijnen?.woonkamer?.[raam]}
                  isEditing={isEditing}
                  getValue={getValue}
                  handleChange={handleChange}
                />
              ))}
            </div>
            <div className="form__group">
              <h5>Slaapkamer 1</h5>
              {["raam1", "raam2"].map((raam) => (
                <WindowInputs
                  key={raam}
                  basePath={`voorgevelKozijnen.slaapkamer1.${raam}`}
                  label={`Raam ${raam.slice(-1)}`}
                  dimensions={item.voorgevelKozijnen?.slaapkamer1?.[raam]}
                  isEditing={isEditing}
                  getValue={getValue}
                  handleChange={handleChange}
                />
              ))}
            </div>
            <div className="form__group">
              <h5>Slaapkamer 2</h5>
              {["raam1", "raam2"].map((raam) => (
                <WindowInputs
                  key={raam}
                  basePath={`voorgevelKozijnen.slaapkamer2.${raam}`}
                  label={`Raam ${raam.slice(-1)}`}
                  dimensions={item.voorgevelKozijnen?.slaapkamer2?.[raam]}
                  isEditing={isEditing}
                  getValue={getValue}
                  handleChange={handleChange}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="form__section">
          <h4 className="form__heading">Achtergevel Kozijnen</h4>
          <div className="form__fields">
            <WindowInputs
              basePath="achtergevelKozijnen.achterdeur"
              label="Achterdeur"
              dimensions={item.achtergevelKozijnen?.achterdeur}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
            <WindowInputs
              basePath="achtergevelKozijnen.keuken"
              label="Keuken"
              dimensions={item.achtergevelKozijnen?.keuken}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
            <div className="form__group">
              <h5>Woonkamer</h5>
              {["raam1", "raam2", "raam3"].map((raam) => (
                <WindowInputs
                  key={raam}
                  basePath={`achtergevelKozijnen.woonkamer.${raam}`}
                  label={`Raam ${raam.slice(-1)}`}
                  dimensions={item.achtergevelKozijnen?.woonkamer?.[raam]}
                  isEditing={isEditing}
                  getValue={getValue}
                  handleChange={handleChange}
                />
              ))}
            </div>
            <div className="form__group">
              <h5>Slaapkamer 3</h5>
              {["raam1", "raam2"].map((raam) => (
                <WindowInputs
                  key={raam}
                  basePath={`achtergevelKozijnen.slaapkamer3.${raam}`}
                  label={`Raam ${raam.slice(-1)}`}
                  dimensions={item.achtergevelKozijnen?.slaapkamer3?.[raam]}
                  isEditing={isEditing}
                  getValue={getValue}
                  handleChange={handleChange}
                />
              ))}
            </div>
            <div className="form__group">
              <h5>Slaapkamer 4</h5>
              {["raam1", "raam2"].map((raam) => (
                <WindowInputs
                  key={raam}
                  basePath={`achtergevelKozijnen.slaapkamer4.${raam}`}
                  label={`Raam ${raam.slice(-1)}`}
                  dimensions={item.achtergevelKozijnen?.slaapkamer4?.[raam]}
                  isEditing={isEditing}
                  getValue={getValue}
                  handleChange={handleChange}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="form__section">
          <h4 className="form__heading">Ruimten</h4>
          <div className="form__fields">
            {[
              "woonkamer",
              "achterkamer",
              "slaapkamer1",
              "slaapkamer2",
              "slaapkamer3",
              "slaapkamer4",
              "keuken",
              "badkamer",
              "toilet",
            ].map((ruimte) => (
              <WindowInputs
                key={ruimte}
                basePath={`ruimten.${ruimte}`}
                label={ruimte.charAt(0).toUpperCase() + ruimte.slice(1)}
                dimensions={item.ruimten?.[ruimte]}
                isEditing={isEditing}
                getValue={getValue}
                handleChange={handleChange}
              />
            ))}

            <TextField
              label="Hoogte"
              value={String(getValue("ruimten.hoogte", item.ruimten?.hoogte))}
              type="number"
              isEditing={isEditing}
              onChange={(next) =>
                handleChange(
                  "ruimten.hoogte",
                  item.ruimten?.hoogte,
                  Number(next)
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeForm;