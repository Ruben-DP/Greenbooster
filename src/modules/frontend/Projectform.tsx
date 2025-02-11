"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createWoning } from "@/app/actions/woningActions";
import { toast } from "sonner";

export default function ProjectForm() {
  const { pending } = useFormStatus();

  async function handleSubmit(formData: FormData) {
    const result = await createWoning(formData);

    console.log("here is the result:", result);
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
              <label htmlFor="huidigEnergieprijs">Huidig energieprijs kWh</label>
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
              <label htmlFor="typeFlat">Type flat/woning</label>
              <select id="typeFlat" name="typeFlat">
                <option value="">Kies woning type</option>
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
            <h2>Afmetingen</h2>

            <div className="project-form__field">
              <label htmlFor="breed">Breed</label>
              <input type="text" id="breed" name="breed" />
            </div>
            <div className="project-form__field">
              <label htmlFor="diepte">Diepte</label>
              <input type="text" id="diepte" name="diepte" />
            </div>
            <div className="project-form__field">
              <label htmlFor="goothoogte">Goothoogte</label>
              <input type="text" id="goothoogte" name="goothoogte" />
            </div>
            <div className="project-form__field">
              <label htmlFor="zadeldak">Zadeldak</label>
              <input type="text" id="zadeldak" name="zadeldak" />
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalWoningen">Aantal woningen</label>
              <input type="text" id="aantalWoningen" name="aantalWoningen" />
            </div>
          </div>
        </div>

        <div className="project-form__col4">
          <h2>Raam afmetingen</h2>
          <div className="project-form__fields">
            <div className="project-form__field">
              <label htmlFor="voordeur">Voordeur</label>
              <input type="number" id="voordeur" name="voordeur" defaultValue="1.00" />
              <input type="number" name="voordeur_2" defaultValue="1.04" />
            </div>

            <div className="project-form__field">
              <label htmlFor="toilet">Toilet</label>
              <input type="number" id="toilet" name="toilet" defaultValue="" />
              <input type="number" name="toilet_2" defaultValue="" />
            </div>

            <div className="project-form__field">
              <label>Woonkamer</label>
              <div className="project-form__subfield">
                <label htmlFor="woonkamer_raam1">- raam 1</label>
                <input type="number" id="woonkamer_raam1" name="woonkamer_raam1" defaultValue="2.00" />
                <input type="number" name="woonkamer_raam1_2" defaultValue="2.00" />
              </div>
              <div className="project-form__subfield">
                <label htmlFor="woonkamer_raam2">- raam 2</label>
                <input type="number" id="woonkamer_raam2" name="woonkamer_raam2" defaultValue="1.00" />
                <input type="number" name="woonkamer_raam2_2" defaultValue="0.96" />
              </div>
              <div className="project-form__subfield">
                <label htmlFor="woonkamer_raam3">- raam 3</label>
                <input type="number" id="woonkamer_raam3" name="woonkamer_raam3" defaultValue="2.00" />
                <input type="number" name="woonkamer_raam3_2" defaultValue="1.33" />
              </div>
            </div>

            <div className="project-form__field">
              <label>Slaapkamer 1</label>
              <div className="project-form__subfield">
                <label htmlFor="slaapkamer1_raam1">- raam 1</label>
                <input type="number" id="slaapkamer1_raam1" name="slaapkamer1_raam1" defaultValue="1.00" />
                <input type="number" name="slaapkamer1_raam1_2" defaultValue="1.00" />
              </div>
              <div className="project-form__subfield">
                <label htmlFor="slaapkamer1_raam2">- raam 2</label>
                <input type="number" id="slaapkamer1_raam2" name="slaapkamer1_raam2" defaultValue="1.00" />
                <input type="number" name="slaapkamer1_raam2_2" defaultValue="0.36" />
              </div>
            </div>

            <div className="project-form__field">
              <label>Slaapkamer 2</label>
              <div className="project-form__subfield">
                <label htmlFor="slaapkamer2_raam1">- raam 1</label>
                <input type="number" id="slaapkamer2_raam1" name="slaapkamer2_raam1" defaultValue="1.00" />
                <input type="number" name="slaapkamer2_raam1_2" defaultValue="2.00" />
              </div>
              <div className="project-form__subfield">
                <label htmlFor="slaapkamer2_raam2">- raam 2</label>
                <input type="number" id="slaapkamer2_raam2" name="slaapkamer2_raam2" defaultValue="0.50" />
                <input type="number" name="slaapkamer2_raam2_2" defaultValue="0.50" />
              </div>
            </div>

            <div className="project-form__field">
              <label htmlFor="achterdeur">Achterdeur</label>
              <input type="number" id="achterdeur" name="achterdeur" defaultValue="1.00" />
              <input type="number" name="achterdeur_2" defaultValue="1.25" />
            </div>

            <div className="project-form__field">
              <label>Woonkamer (2)</label>
              <div className="project-form__subfield">
                <label htmlFor="woonkamer2_raam1">- raam 1</label>
                <input type="number" id="woonkamer2_raam1" name="woonkamer2_raam1" defaultValue="2.00" />
                <input type="number" name="woonkamer2_raam1_2" defaultValue="1.86" />
              </div>
              <div className="project-form__subfield">
                <label htmlFor="woonkamer2_raam2">- raam 2</label>
                <input type="number" id="woonkamer2_raam2" name="woonkamer2_raam2" defaultValue="1.00" />
                <input type="number" name="woonkamer2_raam2_2" defaultValue="0.72" />
              </div>
              <div className="project-form__subfield">
                <label htmlFor="woonkamer2_raam3">- raam 3</label>
                <input type="number" id="woonkamer2_raam3" name="woonkamer2_raam3" defaultValue="1.00" />
                <input type="number" name="woonkamer2_raam3_2" defaultValue="1.83" />
              </div>
            </div>

            <div className="project-form__field">
              <label>Slaapkamer 1 (2)</label>
              <div className="project-form__subfield">
                <label htmlFor="slaapkamer1_2_raam1">- raam 1</label>
                <input type="number" id="slaapkamer1_2_raam1" name="slaapkamer1_2_raam1" defaultValue="1.50" />
                <input type="number" name="slaapkamer1_2_raam1_2" defaultValue="1.50" />
              </div>
            </div>

            <div className="project-form__field">
              <label>Hoogte</label>
              <input type="number" id="hoogte" name="hoogte" defaultValue="2.70" />
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