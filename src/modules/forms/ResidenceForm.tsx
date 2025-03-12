import React from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { CheckboxField } from "../fields/CheckboxField";
import { ReferenceField } from "../fields/ReferenceField";

type Props = {
  item: any;
  isEditing: boolean;
  pendingChanges: Record<string, { newValue: any }>;
  onChange?: (path: string, oldValue: any, newValue: any) => void;
};

const ResidenceForm = ({
  item,
  isEditing,
  pendingChanges,
  onChange,
}: Props) => {
  if (!item) return null;

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  return (
    <div className="form residence-form">
      <div className="form__section">
        <h4 className="form__heading">Project informatie</h4>
        <div className="form__fields">
          <TextField
            label="Projectnummer"
            value={getValue(
              "projectInformation.projectNumber",
              item.projectInformation?.projectNumber
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.projectNumber",
                item.projectInformation?.projectNumber,
                next
              )
            }
          />
          <TextField
            label="Complexnaam/nr"
            value={getValue(
              "projectInformation.complexName",
              item.projectInformation?.complexName
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.complexName",
                item.projectInformation?.complexName,
                next
              )
            }
          />
          <TextField
            label="Aantal VHE"
            value={String(
              getValue(
                "projectInformation.aantalVHE",
                item.projectInformation?.aantalVHE
              )
            )}
            type="number"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.aantalVHE",
                item.projectInformation?.aantalVHE,
                Number(next)
              )
            }
          />
          <TextField
            label="Adres"
            value={getValue(
              "projectInformation.adres",
              item.projectInformation?.adres
            )}
            type="text"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.adres",
                item.projectInformation?.adres,
                next
              )
            }
          />
          <TextField
            label="Postcode"
            value={getValue(
              "projectInformation.postcode",
              item.projectInformation?.postcode
            )}
            type="text"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.postcode",
                item.projectInformation?.postcode,
                next
              )
            }
          />
          <TextField
            label="Plaats"
            value={getValue(
              "projectInformation.plaats",
              item.projectInformation?.plaats
            )}
            type="text"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.plaats",
                item.projectInformation?.plaats,
                next
              )
            }
          />
          <TextField
            label="Renovatiejaar"
            value={String(
              getValue(
                "projectInformation.renovatieJaar",
                item.projectInformation?.renovatieJaar
              )
            )}
            type="number"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.renovatieJaar",
                item.projectInformation?.renovatieJaar,
                Number(next)
              )
            }
          />
          <SelectField
            label="Bouwperiode"
            value={getValue(
              "projectInformation.bouwPeriode",
              item.projectInformation?.bouwPeriode
            )}
            options={["tot 1965","1965-1974","1975-1982","1983-1987","1988-1991"]}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "projectInformation.bouwPeriode",
                item.projectInformation?.bouwPeriode,
                next
              )
            }
          />
        </div>
      </div>
      <div className="form__section">
        <h4 className="form__heading">Energie details</h4>
        <div className="form__fields">
          <TextField
            label="Huidig label"
            value={getValue(
              "energyDetails.huidigLabel",
              item.energyDetails?.huidigLabel
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.huidigLabel",
                item.energyDetails?.huidigLabel,
                next
              )
            }
          />
          <TextField
            label="Huidig energie"
            value={String(
              getValue(
                "energyDetails.huidigEnergie",
                item.energyDetails?.huidigEnergie
              )
            )}
            type="number"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.huidigEnergie",
                item.energyDetails?.huidigEnergie,
                Number(next)
              )
            }
          />
          <SelectField
            label="Voorkosten scenario"
            value={getValue(
              "energyDetails.voorkostenScenario",
              item.energyDetails?.voorkostenScenario
            )}
            options={["Scenario A", "Scenario B", "Scenario C"]}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.voorkostenScenario",
                item.energyDetails?.voorkostenScenario,
                next
              )
            }
          />
          <TextField
            label="Nieuw label"
            value={getValue(
              "energyDetails.nieuwLabel",
              item.energyDetails?.nieuwLabel
            )}
            type="text"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.nieuwLabel",
                item.energyDetails?.nieuwLabel,
                next
              )
            }
          />
          <TextField
            label="Label stappen"
            value={getValue(
              "energyDetails.labelStappen",
              item.energyDetails?.labelStappen
            )}
            type="text"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.labelStappen",
                item.energyDetails?.labelStappen,
                next
              )
            }
          />
          <TextField
            label="Huidig verbruik"
            value={String(
              getValue(
                "energyDetails.huidigVerbruik",
                item.energyDetails?.huidigVerbruik
              )
            )}
            type="number"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.huidigVerbruik",
                item.energyDetails?.huidigVerbruik,
                Number(next)
              )
            }
          />
          <TextField
            label="Huidig energieprijs kWh"
            value={String(
              getValue(
                "energyDetails.huidigEnergiePrijs",
                item.energyDetails?.huidigEnergiePrijs
              )
            )}
            type="number"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.huidigEnergiePrijs",
                item.energyDetails?.huidigEnergiePrijs,
                Number(next)
              )
            }
          />
        </div>
      </div>
      <div className="form__section">
        <h4 className="form__heading">Afmetingen</h4>
        <div className="form__fields">
          <TextField
            label="Breed"
            value={String(getValue("dimensions.breed", item.dimensions?.breed))}
            type="text"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("dimensions.breed", item.dimensions?.breed, next)
            }
          />
          <TextField
            label="Diepte"
            value={String(
              getValue("dimensions.diepte", item.dimensions?.diepte)
            )}
            type="text"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("dimensions.diepte", item.dimensions?.diepte, next)
            }
          />
          <TextField
            label="Goothoogte"
            value={String(
              getValue("dimensions.goothoogte", item.dimensions?.goothoogte)
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "dimensions.goothoogte",
                item.dimensions?.goothoogte,
                next
              )
            }
          />
          <TextField
            label="Nokhoogte"
            value={String(
              getValue("dimensions.nokhoogte", item.dimensions?.nokhoogte)
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "dimensions.nokhoogte",
                item.dimensions?.nokhoogte,
                next
              )
            }
          />
          <TextField
            label="Aantal woningen"
            value={String(
              getValue(
                "dimensions.aantalwoningen",
                item.dimensions?.aantalwoningen
              )
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "dimensions.aantalwoningen",
                item.dimensions?.aantalwoningen,
                next
              )
            }
          />
          <TextField
            label="Aantal Kopgevels"
            value={String(
              getValue("dimensions.kopgevels", item.dimensions?.kopgevels)
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "dimensions.kopgevels",
                item.dimensions?.kopgevels,
                next
              )
            }
          />
          <TextField
            label="Totale breedte complex"
            value={String(
              getValue(
                "dimensions.breedtecomplex",
                item.dimensions?.breedtecomplex
              )
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "dimensions.breedtecomplex",
                item.dimensions?.breedtecomplex,
                next
              )
            }
          />
          <TextField
            label="Aantal portieken"
            value={String(
              getValue("dimensions.portieken", item.dimensions?.portieken)
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "dimensions.portieken",
                item.dimensions?.portieken,
                next
              )
            }
          />
          <TextField
            label="Bouwlagen"
            value={String(
              getValue("dimensions.bouwlagen", item.dimensions?.bouwlagen)
            )}
            type="text"
            required={true}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "dimensions.bouwlagen",
                item.dimensions?.bouwlagen,
                next
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ResidenceForm;
