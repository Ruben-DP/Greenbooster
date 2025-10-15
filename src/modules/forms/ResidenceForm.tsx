// Fixed ResidenceForm.tsx with consistent field naming
import React, { useEffect, useState } from "react";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { CheckboxField } from "../fields/CheckboxField";
import { ReferenceField } from "../fields/ReferenceField";
import ImageSelect from "../ImageSelect";
import { searchDocuments } from "@/app/actions/crudActions";
import { toast } from "sonner";
import { CustomField } from "@/types/settings";
import { X } from "lucide-react";

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
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

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

  // Set initial preview if image exists
  useEffect(() => {
    if (item.imagePath) {
      setPreviewUrl(item.imagePath);
    }
  }, [item.imagePath]);

  // Initialize custom fields from item
  useEffect(() => {
    if (item.customFields && Array.isArray(item.customFields)) {
      setCustomFields(item.customFields);
    }
  }, [item._id]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Bestand is te groot. Maximaal 5MB toegestaan.");
      return;
    }

    // Create preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-residence-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Clean up object URL and use the uploaded image path
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(result.data.imagePath);
        handleChange("imagePath", item.imagePath || "", result.data.imagePath);
        toast.success("Afbeelding succesvol geüpload");
      } else {
        // Revert preview on error
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(item.imagePath || null);
        toast.error(result.error || "Upload mislukt");
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Revert preview on error
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(item.imagePath || null);
      toast.error("Er is een fout opgetreden bij het uploaden");
    } finally {
      setIsUploading(false);
    }
  };

  // Custom field management functions
  const addCustomField = () => {
    const newField: CustomField = {
      id: `custom-${Date.now()}`,
      name: `Extra veld ${customFields.length + 1}`,
      value: 0,
      type: 'euro'
    };
    const updatedFields = [...customFields, newField];
    setCustomFields(updatedFields);
    handleChange("customFields", item.customFields || [], updatedFields);
  };

  const removeCustomField = (id: string) => {
    const updatedFields = customFields.filter(field => field.id !== id);
    setCustomFields(updatedFields);
    handleChange("customFields", item.customFields || [], updatedFields);
  };

  const updateCustomField = (id: string, fieldName: 'name' | 'value' | 'type', value: string | number) => {
    const updatedFields = customFields.map(field =>
      field.id === id
        ? { ...field, [fieldName]: value }
        : field
    );
    setCustomFields(updatedFields);
    handleChange("customFields", item.customFields || [], updatedFields);
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
      
      <div className="form__section">
        <h4 className="form__heading">Energie details</h4>
        <div className="form__fields">
          {/* <TextField
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
          /> */}
          {/* <TextField
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
          /> */}
          {/* <TextField
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
          /> */}
          {/* FIXED: Changed field name to match ProjectForm */}
          <TextField
            label="Huidig energieverbruik"
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
          {/* FIXED: Changed field name to be consistent with ProjectForm */}
          <TextField
            label="Huidige energieprijs"
            value={String(
              getValue(
                "energyDetails.huidigEnergieprijs",
                item.energyDetails?.huidigEnergieprijs
              )
            )}
            type="number"
            isEditing={isEditing}
            onChange={(next) =>
              handleChange(
                "energyDetails.huidigEnergieprijs",
                item.energyDetails?.huidigEnergieprijs,
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

      <div className="form__section">
        <h4 className="form__heading">Afbeelding</h4>
        <div className="form__fields">
          {isEditing ? (
            <div className="form-field">
              <label className="field-label" htmlFor="residence-image">
                Upload afbeelding (max 5MB)
              </label>
              <input
                id="residence-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="file-input"
              />
              {isUploading && <span className="upload-status">Uploaden...</span>}
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
              )}
            </div>
          ) : (
            <div className="form-field">
              <label className="field-label">Afbeelding</label>
              {item.imagePath ? (
                <div className="image-preview">
                  <img src={item.imagePath} alt="Woning afbeelding" className="preview-image" />
                </div>
              ) : (
                <div className="input-read-only">
                  <span className="empty-reference">Geen afbeelding</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form__section">
        <div className="form__heading-row">
          <h4 className="form__heading">Extra velden</h4>
          {isEditing && (
            <button
              type="button"
              onClick={addCustomField}
              className="add-field-button"
              title="Voeg nieuw veld toe"
            >
              <span className="plus-icon">+</span>
              Nieuw veld
            </button>
          )}
        </div>
        <div className="form__fields">
          {customFields.length > 0 ? (
            customFields.map((field, index) => (
              <div key={field.id} className="custom-field-group">
                <div className="custom-field-header">
                  <span className="field-number">Veld {index + 1}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeCustomField(field.id)}
                      className="remove-field-button"
                      title="Verwijder veld"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label">Naam</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                      placeholder="Naam van het veld"
                      className="text-input"
                    />
                  ) : (
                    <div className="input-read-only">{field.name}</div>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label">Type</label>
                  {isEditing ? (
                    <select
                      value={field.type || 'euro'}
                      onChange={(e) => updateCustomField(field.id, 'type', e.target.value as 'percentage' | 'euro')}
                      className="select-input"
                    >
                      <option value="euro">Euro (€)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  ) : (
                    <div className="input-read-only">
                      {field.type === 'percentage' ? 'Percentage (%)' : 'Euro (€)'}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label className="field-label">Waarde</label>
                  {isEditing ? (
                    <div className="input-with-symbol">
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, 'value', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="number-input"
                      />
                      <span className="input-symbol">
                        {field.type === 'percentage' ? '%' : '€'}
                      </span>
                    </div>
                  ) : (
                    <div className="input-read-only">
                      {field.value} {field.type === 'percentage' ? '%' : '€'}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-custom-fields">
              <p>Geen extra velden toegevoegd</p>
              {isEditing && (
                <button
                  type="button"
                  onClick={addCustomField}
                  className="add-first-field-button"
                >
                  <span className="plus-icon">+</span>
                  Voeg eerste veld toe
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidenceForm;