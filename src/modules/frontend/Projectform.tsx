"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createWoning } from "@/app/actions/woningActions";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { searchDocuments } from "@/app/actions/crudActions";

interface BuildingType {
  _id: string;
  name: string;
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
            <div className="project-form__field">
              <label htmlFor="projectNumber">Projectnummer</label>
              <input
                type="text"
                id="projectNumber"
                name="projectNumber"
                required
              />
            </div>
            <div className="project-form__field">
              <label htmlFor="complexName">Complexnaam/nr</label>
              <input type="text" id="complexName" name="complexName" required />
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalVHE">Aantal VHE</label>
              <input type="number" id="aantalVHE" name="aantalVHE" />
            </div>
            <div className="project-form__field">
              <label htmlFor="adres">Adres</label>
              <input type="text" id="adres" name="adres" />
            </div>
            <div className="project-form__field">
              <label htmlFor="postcode">Postcode</label>
              <input type="text" id="postcode" name="postcode" />
            </div>
            <div className="project-form__field">
              <label htmlFor="plaats">Plaats</label>
              <input type="text" id="plaats" name="plaats" />
            </div>
            <div className="project-form__field">
              <label htmlFor="renovatieJaar">Renovatiejaar</label>
              <input type="number" id="renovatieJaar" name="renovatieJaar" />
            </div>
            <div className="project-form__field">
              <label htmlFor="bouwPeriode">Bouwperiode</label>
              <select id="bouwPeriode" name="bouwPeriode">
                <option value="">Select bouwperiode</option>
              </select>
            </div>
          </div>
        </div>

        <div className="project-form__col2">
          <h2>Energie details</h2>
          <div className="project-form__fields">
            <div className="project-form__field">
              <label htmlFor="huidigLabel">Huidig label</label>
              <input type="text" id="huidigLabel" name="huidigLabel" required />
            </div>
            <div className="project-form__field">
              <label htmlFor="huidigEnergie">Huidig energie</label>
              <input type="number" id="huidigEnergie" name="huidigEnergie" />
            </div>
            <div className="project-form__field">
              <label htmlFor="voorkostenScenario">Voorkosten scenario</label>
              <select id="voorkostenScenario" name="voorkostenScenario">
                <option value="">Select scenario</option>
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
            <div className="project-form__field">
              <label htmlFor="huidigVerbruik">Huidig verbruik</label>
              <input type="number" id="huidigVerbruik" name="huidigVerbruik" />
            </div>
            <div className="project-form__field">
              <label htmlFor="huidigEnergieprijs">
                Huidig energieprijs kWh
              </label>
              <input
                type="number"
                id="huidigEnergieprijs"
                name="huidigEnergieprijs"
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
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="project-form__field project-form__field--checkbox">
              <label>
                <input type="checkbox" name="grondgebonden" value="true" />
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
          </div>
        </div>

        <div className="project-form__submit">
          <button className="project-form__button project-form__button--secondary">
            <ArrowLeft size={20} />
            Terug
          </button>
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
