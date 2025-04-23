"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createWoning } from "@/app/actions/woningActions";
import { createDocument } from "@/app/actions/crudActions";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { searchDocuments } from "@/app/actions/crudActions";
import TypeForm from "@/modules/forms/TypeForm";
import ImageSelect from "../ImageSelect";

interface BuildingType {
  _id: string;
  naam: string;
}

interface WindowDimensions {
  breedte: number | null;
  hoogte: number | null;
}

interface TypeFormData {
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
    slaapkamer: {
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
    slaapkamer1: {
      raam1: WindowDimensions;
    };
    slaapkamer2: {
      raam1: WindowDimensions;
      raam2: WindowDimensions;
    };
  };
  ruimten: {
    woonkamer: WindowDimensions;
    achterkamer: WindowDimensions;
    slaapkamer: WindowDimensions;
    slaapkamer2: WindowDimensions;
    keuken: WindowDimensions;
    badkamer: WindowDimensions;
    hal: WindowDimensions;
    toilet: WindowDimensions;
    hoogte: number | null;
  };
}

export default function ProjectForm() {
  const { pending } = useFormStatus();
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [selectedType, setSelectedType] = useState<BuildingType | null>(null);
  const [createNewType, setCreateNewType] = useState<boolean>(false);
  const [newTypeData, setNewTypeData] = useState<TypeFormData>({
    naam: "",
    type: "grondgebonden",
    voorgevelKozijnen: {
      voordeur: { breedte: null, hoogte: null },
      toilet: { breedte: null, hoogte: null },
      woonkamer: {
        raam1: { breedte: null, hoogte: null },
        raam2: { breedte: null, hoogte: null },
        raam3: { breedte: null, hoogte: null },
      },
      slaapkamer: {
        raam1: { breedte: null, hoogte: null },
        raam2: { breedte: null, hoogte: null },
      },
    },
    achtergevelKozijnen: {
      achterdeur: { breedte: null, hoogte: null },
      keuken: { breedte: null, hoogte: null },
      woonkamer: {
        raam1: { breedte: null, hoogte: null },
        raam2: { breedte: null, hoogte: null },
        raam3: { breedte: null, hoogte: null },
      },
      slaapkamer1: {
        raam1: { breedte: null, hoogte: null },
      },
      slaapkamer2: {
        raam1: { breedte: null, hoogte: null },
        raam2: { breedte: null, hoogte: null },
      },
    },
    ruimten: {
      woonkamer: { breedte: null, hoogte: null },
      achterkamer: { breedte: null, hoogte: null },
      slaapkamer: { breedte: null, hoogte: null },
      slaapkamer2: { breedte: null, hoogte: null },
      keuken: { breedte: null, hoogte: null },
      badkamer: { breedte: null, hoogte: null },
      hal: { breedte: null, hoogte: null },
      toilet: { breedte: null, hoogte: null },
      hoogte: null,
    },
  });

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypeId = e.target.value;
    const typeData = buildingTypes.find((type) => type._id === selectedTypeId);
    setSelectedType(typeData || null);
    setCreateNewType(false); // Disable new type creation when selecting an existing type
  };

  const handleCreateTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateNewType(e.target.checked);
    if (e.target.checked) {
      setSelectedType(null); // Clear selected type when creating new
    }
  };

  const handleNewTypeDataChange = (path: string, value: any) => {
    // Deep copy of the state
    const updatedTypeData = JSON.parse(JSON.stringify(newTypeData));

    // Split the path into segments (e.g., "voorgevelKozijnen.voordeur.breedte")
    const pathSegments = path.split(".");

    // Navigate to the right property and update it
    let current = updatedTypeData;
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]];
    }

    // Set the new value
    current[pathSegments[pathSegments.length - 1]] = value;

    // Update state
    setNewTypeData(updatedTypeData);
  };

  async function handleSubmit(formData: FormData) {
    try {
      // If creating a new type, first save it to the database
      let typeId = selectedType?._id;

      if (createNewType) {
        // Validate required fields for new type
        if (!newTypeData.naam) {
          toast.error("Naam van woningtype is vereist");
          return;
        }

        // Create new type
        const typeResponse = await createDocument("types", newTypeData);
        if (!typeResponse.success) {
          toast.error(
            "Failed to create new type: " + (typeResponse.error || "")
          );
          return;
        }
        typeId = typeResponse.data?._id;
        toast.success("Nieuw woningtype succesvol aangemaakt");
      }

      // Attach the type ID to the form data
      if (typeId) {
        formData.append("typeId", typeId);
      }

      // Create woning with the type ID (existing or newly created)
      const result = await createWoning(formData);
      if (result.success) {
        toast.success("Woning succesvol opgeslagen");
        window.location.href = "/kosten-berekening";
      } else {
        toast.error(result.error || "Er is iets misgegaan");
      }
    } catch (error) {
      console.error("Error creating woning:", error);
      toast.error("Er is een fout opgetreden bij het opslaan");
    }
  }

  return (
    <section className="project-form">
      <form action={handleSubmit}>
        <div className="project-form__col1">
          <h2 className="tile-title">Project informatie</h2>
          <div className="project-form__fields">
            <div className="grouped">
              <div className="project-form__field half">
                <label htmlFor="projectNumber">Projectnummer</label>
                <input
                  type="text"
                  id="projectNumber"
                  name="projectNumber"
                  required
                />
              </div>
              <div className="project-form__field half">
                <label htmlFor="complexName">Complexnaam/nr</label>
                <input
                  type="text"
                  id="complexName"
                  name="complexName"
                  required
                />
              </div>
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalVHE">Aantal VHE</label>
              <input type="number" id="aantalVHE" name="aantalVHE" />
            </div>
            <div className="project-form__field">
              <label htmlFor="adres">Adres</label>
              <input type="text" id="adres" name="adres" />
            </div>
            <div className="grouped">
              <div className="project-form__field">
                <label htmlFor="postcode">Postcode</label>
                <input type="text" id="postcode" name="postcode" />
              </div>
              <div className="project-form__field">
                <label htmlFor="plaats">Plaats</label>
                <input type="text" id="plaats" name="plaats" />
              </div>
            </div>

            <div className="project-form__field">
              <label htmlFor="renovatieJaar">Renovatiejaar</label>
              <input type="number" id="renovatieJaar" name="renovatieJaar" />
            </div>
            <div className="project-form__field">
              <label htmlFor="bouwPeriode">Bouwperiode</label>
              <select id="bouwPeriode" name="bouwPeriode">
                <option value="">Selecteer een periode</option>
                <option value="tot 1965">tot 1965</option>
                <option value="1965-1974">1965-1974</option>
                <option value="1975-1982">1975-1982</option>
                <option value="1983-1987">1983-1987</option>
                <option value="1988-1991">1988-1991</option>
              </select>
            </div>
          </div>
        </div>

        <div className="project-form__col2">
          <h2 className="tile-title">Type</h2>
          <div className="project-form__field">
            <label htmlFor="typeId">Type flat/woning</label>
            {/* Replace the standard select with ImageSelect */}
            <ImageSelect
              id="typeId"
              name="typeId"
              value={selectedType?._id || ""}
              onChange={handleTypeChange}
              options={buildingTypeOptions}
              disabled={createNewType}
              label="" // Empty label since we already have one above
            />
          </div>
          <div className="project-form__field type-creation-toggle">
            <input
              type="checkbox"
              id="createTypeToggle"
              checked={createNewType}
              onChange={handleCreateTypeChange}
            />
            <label htmlFor="createTypeToggle">Nieuw woningtype aanmaken</label>
          </div>
          <h2 className=" mt-64 tile-title">Energie details</h2>
          {/* <div className="project-form__field">
              <label htmlFor="huidigLabel">Huidig label</label>
              <select type="text" id="huidigLabel" name="huidigLabel" required>
                <option value="">Selecteer energielabel</option>
                <option value="A++++">A++++</option>
                <option value="A+++">A+++</option>
                <option value="A++">A++</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div> */}
          <div className="project-form__field">
            <label htmlFor="huidigEnergieVerbruik">
              Huidig energieverbruik
            </label>
            <div className="flex-field">
              <input
                type="text"
                id="huidigEnergieVerbruik"
                name="huidigEnergieVerbruik"
              />
              <span>kWh/m2</span>
            </div>
          </div>

          <div className="project-form__field">
            <label htmlFor="huidigEnergieprijs">Huidige energieprijs</label>
            <div className="flex-field">
              <input
                type="text"
                id="huidigEnergieprijs"
                name="huidigEnergieprijs"
              />
              <span>€/kWh</span>
            </div>
          </div>

          {/* <div className="project-form__field">
              <label htmlFor="voorkostenScenario">Voorkosten scenario</label>
              <select id="voorkostenScenario" name="voorkostenScenario">
                <option value="">Selecteer scenario</option>
                <option value="label_b">Label B</option>
                <option value="label_a">Label A</option>
                <option value="gasloos">Gasloos</option>
                <option value="30kw">&#60;30kW/m2</option>
                <option value="schone_woning">
                  Schone woning / Gezond wonen
                </option>
                <option value="bio_circulair">Bio-circulair</option>
                <option value="isolatie_2030">
                  Voldoet aan isolatiestandaard 2030
                </option>
                <option value="schil_isolatie">
                  Schil isolatie - besparing energie (SV/gas)
                </option>
                <option value="arnhem">Arnhem</option>
                <option value="leeg">LEEG</option>
              </select>
            </div> */}
          {/* <div className="project-form__field">
              <label htmlFor="nieuwLabel">Nieuw label</label>
              <input
                type="text"
                id="nieuwLabel"
                name="nieuwLabel"
                readOnly
                value="-"
              />
            </div> */}
          {/* <div className="project-form__field">
              <label htmlFor="labelStappen">Label stappen</label>
              <input
                type="text"
                id="labelStappen"
                name="labelStappen"
                readOnly
                value="-"
              />
            </div> */}
        </div>

        <div className="project-form__col3">
          <h2 className="tile-title">Afmetingen</h2>
          <div className="project-form__fields">
            <div className="grouped">
              <div className="project-form__field">
                <label htmlFor="breed">Breed</label>
                <div className="flex-field">
                  <input type="text" id="breed" name="breed" />
                  <span>m1</span>
                </div>
              </div>
              <div className="project-form__field">
                <label htmlFor="diepte">Diepte</label>
                <div className="flex-field">
                  <input type="text" id="diepte" name="diepte" />
                  <span>m1</span>
                </div>
              </div>
            </div>
            <div className="grouped">
              <div className="project-form__field">
                <label htmlFor="goothoogte">Goothoogte</label>
                <div className="flex-field">
                  <input
                    type="text"
                    id="goothoogte"
                    name="goothoogte"
                    required
                  />
                  <span>m1</span>
                </div>
              </div>
              <div className="project-form__field">
                <label htmlFor="nokhoogte">Nokhoogte</label>
                <div className="flex-field">
                  <input type="text" id="nokhoogte" name="nokhoogte" required />
                  <span>m1</span>
                </div>
              </div>
            </div>
            <div className="grouped">
              <div className="project-form__field">
                <label htmlFor="aantalwoningen">Aantal woningen</label>
                <div className="flex-field">
                  <input
                    type="text"
                    id="aantalwoningen"
                    name="aantalwoningen"
                    required
                  />
                  <span>st</span>
                </div>
              </div>
              <div className="project-form__field">
                <label htmlFor="kopgevels">Aantal Kopgevels</label>
                <div className="flex-field">
                  <input type="text" id="kopgevels" name="kopgevels" required />
                  <span>st</span>
                </div>
              </div>
            </div>

            <div className="project-form__field">
              <label htmlFor="breedtecomplex">Totale breedte complex</label>
              <div className="flex-field">
                <input
                  type="text"
                  id="breedtecomplex"
                  name="breedtecomplex"
                  required
                />
                <span>m1</span>
              </div>
            </div>
            <div className="project-form__field">
              <label htmlFor="portieken">Aantal portieken</label>
              <div className="flex-field">
                <input type="text" id="portieken" name="portieken" required />
                <span>st</span>
              </div>
            </div>
            <div className="project-form__field">
              <label htmlFor="bouwlagen">Bouwlagen</label>
              <div className="flex-field">
                <input type="text" id="bouwlagen" name="bouwlagen" required />
                <span>st</span>
              </div>
            </div>
            <div className="grouped">
              <div className="project-form__field">
                <label htmlFor="aantalHoekWoningen">Aantal hoekwoningen</label>
                <div className="flex-field">
                  <input
                    type="text"
                    id="aantalHoekWoningen"
                    name="aantalHoekWoningen"
                  />
                  <span>st</span>
                </div>
              </div>
              <div className="project-form__field">
                <label htmlFor="reductiePerHoekwoning">
                  Reductie per hoekwoning
                </label>
                <div className="flex-field">
                  <input
                    type="number"
                    id="reductiePerHoekwoning"
                    name="reductiePerHoekwoning"
                    required
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {createNewType && (
          <div className="project-form__col4">
            <h2 className="tile-title">Nieuw Woningtype</h2>
            <TypeForm
              item={newTypeData}
              isEditing={true}
              onValueChange={handleNewTypeDataChange}
              containerClassName="project-form__fields"
              compact={true}
            />
          </div>
        )}

        <div className="project-form__submit">
          <button
            type="submit"
            className="project-form__button"
            disabled={pending}
          >
            {pending ? "Bezig met opslaan..." : "Opslaan"}
            <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </section>
  );
}
