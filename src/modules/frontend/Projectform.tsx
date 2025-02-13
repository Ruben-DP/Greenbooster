"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createWoning } from "@/app/actions/woningActions";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { searchDocuments } from "@/app/actions/crudActions";

interface BuildingType {
  _id: string;
  naam: string;
}

export default function ProjectForm() {
  const { pending } = useFormStatus();
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [selectedType, setSelectedType] = useState<BuildingType | null>(null);

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypeId = e.target.value;
    const typeData = buildingTypes.find((type) => type._id === selectedTypeId);
    setSelectedType(typeData || null);
  };

  async function handleSubmit(formData: FormData) {
    if (selectedType) {
      formData.append("typeId", selectedType._id);
    }

    const result = await createWoning(formData);
    if (result.success) {
      toast.success("Woning succesvol opgeslagen");
      window.location.href = "/kosten-berekening";
    } else {
      toast.error(result.error || "Er is iets misgegaan");
    }
  }

  return (
    <section className="project-form">
      <form action={handleSubmit}>
        <div className="project-form__col1">
          <h2>Project informatie</h2>
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
                <option value="1965">tot 1965</option>
                <option value="1965-1974">1965-1974</option>
                <option value="1975-1982">1975-1982</option>
                <option value="1983-1987">1983-1987</option>
                <option value="1988-1991">1988-1991</option>
              </select>
            </div>
          </div>
        </div>

        <div className="project-form__col2">
          <h2>Energie details</h2>
          <div className="project-form__fields">
            <div className="project-form__field">
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
            </div>
            <div className="project-form__field">
              <label htmlFor="huidigEnergieVerbruik">
                Huidig energieverbruik
              </label>
              <div className="flex-field">
                <input
                  type="number"
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
            <div className="project-form__field">
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
            </div>
            <div className="project-form__field">
              <label htmlFor="nieuwLabel">Nieuw label</label>
              <input
                type="text"
                id="nieuwLabel"
                name="nieuwLabel"
                readOnly
                value="-"
              />
            </div>
            <div className="project-form__field">
              <label htmlFor="labelStappen">Label stappen</label>
              <input
                type="text"
                id="labelStappen"
                name="labelStappen"
                readOnly
                value="-"
              />
            </div>
          </div>
        </div>

        <div className="project-form__col3">
          <h2>Type</h2>
          <div className="project-form__fields">
            <div className="project-form__field">
              <label htmlFor="typeId">Type flat/woning</label>
              <select id="typeId" name="typeId" onChange={handleTypeChange}>
                <option value="">Kies woning type</option>
                {buildingTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.naam}
                  </option>
                ))}
              </select>
            </div>

            <div className="project-form__field project-form__field--checkbox">
              <label>
                <input type="checkbox" name="grondgebonden" />
                Grondgebonden
              </label>
            </div>
            <div className="project-form__field project-form__field--checkbox">
              <label>
                <input type="checkbox" name="portiekflat" value="true" />
                Portiekflat
              </label>
            </div>
            <div className="project-form__field project-form__field--checkbox">
              <label>
                <input type="checkbox" name="galerieflat" value="true" />
                Galerieflat
              </label>
            </div>
            <h2>Afmetingen</h2>

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
          </div>
        </div>

        <div className="project-form__submit">
          {/* <button className="project-form__button project-form__button--secondary">
            <ArrowLeft size={20} />
            Terug
          </button> */}
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
