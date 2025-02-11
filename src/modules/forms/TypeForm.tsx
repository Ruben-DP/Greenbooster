import React from "react";
import { TextField } from "../fields/TextField";

type BuildingType = {
  name: string;
  defaultValues: {
    breed: string;
    diepte: string;
    goothoogte: string;
    zadeldak: string;
    hoogte: number;
    defaultRamen: {
      woonkamer: {
        raam1: { breedte: number; hoogte: number; };
        raam2: { breedte: number; hoogte: number; };
        raam3: { breedte: number; hoogte: number; };
      };
      woonkamer2: {
        raam1: { breedte: number; hoogte: number; };
        raam2: { breedte: number; hoogte: number; };
        raam3: { breedte: number; hoogte: number; };
      };
      slaapkamer1: {
        raam1: { breedte: number; hoogte: number; };
        raam2: { breedte: number; hoogte: number; };
      };
      slaapkamer2: {
        raam1: { breedte: number; hoogte: number; };
        raam2: { breedte: number; hoogte: number; };
      };
      slaapkamer1_2: {
        raam1: { breedte: number; hoogte: number; };
      };
      toilet: { breedte: number; hoogte: number; };
    };
    defaultDeuren: {
      voordeur: { breedte: number; hoogte: number; };
      achterdeur: { breedte: number; hoogte: number; };
    };
    defaultKamers: {
      woonkamer: { breedte: number; lengte: number; };
      keuken: { breedte: number; lengte: number; };
      badkamer: { breedte: number; lengte: number; };
      hal: { breedte: number; lengte: number; };
      toilet: { breedte: number; lengte: number; };
    };
  };
}

type Props = {
  item: Partial<BuildingType>;
  isEditing: boolean;
  pendingChanges: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

const RaamInputs = ({ basePath, label, raam, isEditing, getValue, handleChange }: { 
  basePath: string;
  label: string;
  raam: any;
  isEditing: boolean;
  getValue: (path: string, original: any) => any;
  handleChange: (path: string, old: any, next: any) => void;
}) => (
  <div className="form__group">
    <h5>{label}</h5>
    <TextField
      label="Breedte"
      value={String(getValue(`${basePath}.breedte`, raam?.breedte))}
      type="number"
      isEditing={isEditing}
      onChange={(next) => handleChange(
        `${basePath}.breedte`,
        raam?.breedte,
        Number(next)
      )}
    />
    <TextField
      label="Hoogte"
      value={String(getValue(`${basePath}.hoogte`, raam?.hoogte))}
      type="number"
      isEditing={isEditing}
      onChange={(next) => handleChange(
        `${basePath}.hoogte`,
        raam?.hoogte,
        Number(next)
      )}
    />
  </div>
);

const TypeForm = ({ item, isEditing, pendingChanges, onChange }: Props) => {
  if (!item) return null;

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  const defaultValues = item.defaultValues || {};

  return (
    <div className="type-form">
      <div className="form__section">
        <h4 className="form__heading">Type Informatie</h4>
        <div className="form__fields">
          <TextField
            label="Naam"
            value={getValue("name", item.name)}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) => handleChange("name", item.name, next)}
          />
        </div>

        <h4 className="form__heading">Basis Afmetingen</h4>
        <div className="form__fields">
          <TextField
            label="Breed"
            value={getValue("defaultValues.breed", defaultValues.breed)}
            type="text"
            isEditing={isEditing}
            onChange={(next) => handleChange("defaultValues.breed", defaultValues.breed, next)}
          />
          <TextField
            label="Diepte"
            value={getValue("defaultValues.diepte", defaultValues.diepte)}
            type="text"
            isEditing={isEditing}
            onChange={(next) => handleChange("defaultValues.diepte", defaultValues.diepte, next)}
          />
          <TextField
            label="Goothoogte"
            value={getValue("defaultValues.goothoogte", defaultValues.goothoogte)}
            type="text"
            isEditing={isEditing}
            onChange={(next) => handleChange("defaultValues.goothoogte", defaultValues.goothoogte, next)}
          />
          <TextField
            label="Zadeldak"
            value={getValue("defaultValues.zadeldak", defaultValues.zadeldak)}
            type="text"
            isEditing={isEditing}
            onChange={(next) => handleChange("defaultValues.zadeldak", defaultValues.zadeldak, next)}
          />
          <TextField
            label="Hoogte"
            value={String(getValue("defaultValues.hoogte", defaultValues.hoogte))}
            type="number"
            isEditing={isEditing}
            onChange={(next) => handleChange("defaultValues.hoogte", defaultValues.hoogte, Number(next))}
          />
        </div>

        <h4 className="form__heading">Deuren</h4>
        <div className="form__fields">
          <RaamInputs
            basePath="defaultValues.defaultDeuren.voordeur"
            label="Voordeur"
            raam={defaultValues.defaultDeuren?.voordeur}
            isEditing={isEditing}
            getValue={getValue}
            handleChange={handleChange}
          />
          <RaamInputs
            basePath="defaultValues.defaultDeuren.achterdeur"
            label="Achterdeur"
            raam={defaultValues.defaultDeuren?.achterdeur}
            isEditing={isEditing}
            getValue={getValue}
            handleChange={handleChange}
          />
        </div>

        <h4 className="form__heading">Ramen</h4>
        <div className="form__fields">
          <h5>Woonkamer</h5>
          {['raam1', 'raam2', 'raam3'].map((raam) => (
            <RaamInputs
              key={raam}
              basePath={`defaultValues.defaultRamen.woonkamer.${raam}`}
              label={`Raam ${raam.slice(-1)}`}
              raam={defaultValues.defaultRamen?.woonkamer?.[raam]}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
          ))}

          <h5>Woonkamer (2)</h5>
          {['raam1', 'raam2', 'raam3'].map((raam) => (
            <RaamInputs
              key={raam}
              basePath={`defaultValues.defaultRamen.woonkamer2.${raam}`}
              label={`Raam ${raam.slice(-1)}`}
              raam={defaultValues.defaultRamen?.woonkamer2?.[raam]}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
          ))}

          <h5>Slaapkamer 1</h5>
          {['raam1', 'raam2'].map((raam) => (
            <RaamInputs
              key={raam}
              basePath={`defaultValues.defaultRamen.slaapkamer1.${raam}`}
              label={`Raam ${raam.slice(-1)}`}
              raam={defaultValues.defaultRamen?.slaapkamer1?.[raam]}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
          ))}

          <h5>Slaapkamer 2</h5>
          {['raam1', 'raam2'].map((raam) => (
            <RaamInputs
              key={raam}
              basePath={`defaultValues.defaultRamen.slaapkamer2.${raam}`}
              label={`Raam ${raam.slice(-1)}`}
              raam={defaultValues.defaultRamen?.slaapkamer2?.[raam]}
              isEditing={isEditing}
              getValue={getValue}
              handleChange={handleChange}
            />
          ))}

          <h5>Slaapkamer 1 (2)</h5>
          <RaamInputs
            basePath="defaultValues.defaultRamen.slaapkamer1_2.raam1"
            label="Raam 1"
            raam={defaultValues.defaultRamen?.slaapkamer1_2?.raam1}
            isEditing={isEditing}
            getValue={getValue}
            handleChange={handleChange}
          />

          <RaamInputs
            basePath="defaultValues.defaultRamen.toilet"
            label="Toilet"
            raam={defaultValues.defaultRamen?.toilet}
            isEditing={isEditing}
            getValue={getValue}
            handleChange={handleChange}
          />
        </div>

        <h4 className="form__heading">Kamers</h4>
        <div className="form__fields">
          {['woonkamer', 'keuken', 'badkamer', 'hal', 'toilet'].map((kamer) => (
            <div key={kamer} className="form__group">
              <h5>{kamer}</h5>
              <TextField
                label="Breedte"
                value={String(getValue(`defaultValues.defaultKamers.${kamer}.breedte`, 
                  defaultValues.defaultKamers?.[kamer]?.breedte))}
                type="number"
                isEditing={isEditing}
                onChange={(next) => handleChange(
                  `defaultValues.defaultKamers.${kamer}.breedte`,
                  defaultValues.defaultKamers?.[kamer]?.breedte,
                  Number(next)
                )}
              />
              <TextField
                label="Lengte"
                value={String(getValue(`defaultValues.defaultKamers.${kamer}.lengte`, 
                  defaultValues.defaultKamers?.[kamer]?.lengte))}
                type="number"
                isEditing={isEditing}
                onChange={(next) => handleChange(
                  `defaultValues.defaultKamers.${kamer}.lengte`,
                  defaultValues.defaultKamers?.[kamer]?.lengte,
                  Number(next)
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeForm;