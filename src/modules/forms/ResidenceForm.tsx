import React, { useEffect, useState } from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { CheckboxField } from "../fields/CheckboxField";
import { ReferenceField } from "../fields/ReferenceField";
import ImageSelect from "../ImageSelect";
import { searchDocuments } from "@/app/actions/crudActions";

type BuildingType = {
  _id: string;
  naam: string;
};

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
  
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>(item.typeId || "");

  useEffect(() => {
    const fetchBuildingTypes = async () => {
      try {
        const types = await searchDocuments("types");
        setBuildingTypes(types);
      } catch (error) {
        console.error("Failed to fetch building types:", error);
      }
    };

    fetchBuildingTypes();
  }, []);

  // Build image options for the selector
  const buildingTypeOptions = buildingTypes.map((type) => {
    // Determine the image source for each type
    let imageSrc = null;
    const typeName = type.naam.toLowerCase();

    // Map type names to corresponding images
    if (typeName.includes("bbm") || typeName === "bbm") {
      imageSrc = "/images/Bbm.jpg";
    } else if (typeName.includes("bitcoin")) {
      imageSrc = "/images/Bitcoin.jpg";
    } else if (typeName.includes("bouwvliet")) {
      imageSrc = "/images/Bouwvliet.jpg";
    } else if (typeName.includes("coignet")) {
      imageSrc = "/images/Coignet.jpg";
    } else if (typeName === "eba" || typeName.includes("eba ")) {
      imageSrc = "/images/Eba.jpg";
    } else if (typeName.includes("ebo ii") || typeName.includes("ebo-ii")) {
      imageSrc = "/images/Ebo II.jpg";
    } else if (typeName.includes("elementum")) {
      imageSrc = "/images/Elementum.jpg";
    } else if (typeName.includes("era")) {
      imageSrc = "/images/Era.jpg";
    } else if (typeName.includes("gba")) {
      imageSrc = "/images/Gba.jpg";
    } else if (typeName.includes("grondgebonden")) {
      imageSrc = "/images/Grondgebonden.jpg";
    } else if (typeName.includes("heykamp")) {
      imageSrc = "/images/Heykamp.jpg";
    } else if (typeName.includes("intervam")) {
      imageSrc = "/images/Intervam.jpg";
    } else if (typeName.includes("korrelbeton")) {
      imageSrc = "/images/Korrelbeton.jpg";
    } else if (typeName.includes("lisman")) {
      imageSrc = "/images/Lisman.jpg";
    } else if (typeName.includes("muwi")) {
      imageSrc = "/images/Muwi.jpg";
    } else if (typeName.includes("pronto")) {
      imageSrc = "/images/Pronto.jpg";
    } else if (typeName === "rbm" || typeName.includes("rbm ")) {
      imageSrc = "/images/Rbm.jpg";
    } else if (typeName.includes("rottinghuis")) {
      imageSrc = "/images/Rottinghuis.jpg";
    } else if (typeName.includes("sanders")) {
      imageSrc = "/images/Sanders.jpg";
    } else if (typeName.includes("schokbeton")) {
      imageSrc = "/images/Schokbeton.jpg";
    } else if (typeName.includes("vaneg")) {
      imageSrc = "/images/Vaneg.jpg";
    } else if (typeName.includes("wilma ii") || typeName.includes("wilma-ii")) {
      imageSrc = "/images/Wilma II.jpg";
    } else if (typeName.includes("woning model brabant")) {
      imageSrc = "/images/Woning model brabant.jpg";
    } else if (typeName.includes("portiek")) {
      imageSrc = "/images/portiekwoning.webp";
    }

    return {
      value: type._id,
      label: type.naam,
      imageSrc: imageSrc,
    };
  });

  const getValue = (path: string, original: any) =>
    pendingChanges[path]?.newValue ?? original;

  const handleChange = (path: string, old: any, next: any) =>
    onChange?.(path, old, next);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTypeId = e.target.value;
    setSelectedTypeId(newTypeId);
    handleChange("typeId", item.typeId || "", newTypeId);
  };

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
      
      {/* Type selection section */}

      
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
      <div className="form__section">
        <h4 className="form__heading">Type woning</h4>
        <div className="form__fields">
          {isEditing ? (
            <div className="image-select-container">
              <ImageSelect
                id="typeId"
                name="typeId"
                value={getValue("typeId", item.typeId || "")}
                onChange={handleTypeChange}
                options={buildingTypeOptions}
                label="Type flat/woning"
              />
            </div>
          ) : (
            <div className="form-field">
              <label className="field-label">Type woning</label>
              <div className="input-read-only">
                {buildingTypes.find(type => type._id === item.typeId)?.naam || 
                  <span className="empty-reference">Geen type geselecteerd</span>}
              </div>
            </div>
          )}
          
          <CheckboxField
            label="Grondgebonden"
            value={getValue("isGrondgebonden", item.isGrondgebonden || false)}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("isGrondgebonden", item.isGrondgebonden || false, next)
            }
          />
          <CheckboxField
            label="Portiekflat"
            value={getValue("isPortiekflat", item.isPortiekflat || false)}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("isPortiekflat", item.isPortiekflat || false, next)
            }
          />
          <CheckboxField
            label="Galerijflat"
            value={getValue("isGalerieflat", item.isGalerieflat || false)}
            isEditing={isEditing}
            onChange={(next) =>
              handleChange("isGalerieflat", item.isGalerieflat || false, next)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ResidenceForm;