import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

export default function ProjectForm() {
  return (
    <section className="project-form">
      <form>
      <div className="project-form__submit">
          <button className="project-form__button project-form__button--secondary">
            <ArrowLeft size={20} />
            Terug
          </button>
          <div className="group" style={{display:"flex", gap:"8px"}}>
            <button type="submit" className="project-form__button">
              Volgende
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="project-form__col1">
          <h2>Project informatie</h2>
          <div className="project-form__fields">
            <div className="project-form__field">
              <label htmlFor="projectNumber">Projectnummer</label>
              <input type="text" id="projectNumber" />
            </div>
            <div className="project-form__field">
              <label htmlFor="complexName">Complexnaam/nr</label>
              <input type="text" id="complexName" />
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalVHE">Aantal VHE</label>
              <input type="number" id="aantalVHE" />
            </div>
            <div className="project-form__field">
              <label htmlFor="adres">Adres</label>
              <input type="text" id="adres" />
            </div>
            <div className="project-form__field">
              <label htmlFor="postcode">Postcode</label>
              <input type="text" id="postcode" />
            </div>
            <div className="project-form__field">
              <label htmlFor="plaats">Plaats</label>
              <input type="text" id="plaats" />
            </div>
            <div className="project-form__field">
              <label htmlFor="renovatieJaar">Renovatiejaar</label>
              <input type="number" id="renovatieJaar" />
            </div>
            <div className="project-form__field">
              <label htmlFor="bouwPeriode">Bouwperiode</label>
              <select id="bouwPeriode">
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
              <input type="text" id="huidigLabel" />
            </div>
            <div className="project-form__field">
              <label htmlFor="huidigEnergie"></label>
              <input type="number" id="huidigEnergie" />
            </div>
            <div className="project-form__field">
              <label htmlFor="voorkostenScenario">Voorkosten scenario</label>
              <select id="voorkostenScenario">
                <option value="">Select scenario</option>
              </select>
            </div>
            <div className="project-form__field">
              <label htmlFor="nieuwLabel">Nieuw label</label>
              <input type="text" id="nieuwLabel" readOnly value="-" />
            </div>
            <div className="project-form__field">
              <label htmlFor="labelStappen">Label stappen</label>
              <input type="text" id="labelStappen" readOnly value="-" />
            </div>
            <div className="project-form__field">
              <label htmlFor="huidigVerbruik">Huidig verbruik</label>
              <input type="number" id="huidigVerbruik" />
            </div>
            <div className="project-form__field">
              <label htmlFor="huidigEnergieprijs">
                Huidig energieprijs kWh
              </label>
              <input type="number" id="huidigEnergieprijs" />
            </div>
          </div>
        </div>

        <div className="project-form__col3">
          <h2>Type & afmetingen</h2>
          <div className="project-form__fields">
            <div className="project-form__field project-form__field--checkbox">
              <label>
                <input type="checkbox" name="grondgebonden" />
                Grondgebonden
              </label>
            </div>
            <div className="project-form__field project-form__field--checkbox">
              <label>
                <input type="checkbox" name="portiekflat" />
                Portiekflat
              </label>
            </div>
            <div className="project-form__field project-form__field--checkbox">
              <label>
                <input type="checkbox" name="galerieflat" />
                Galerieflat
              </label>
            </div>
            <div className="project-form__field">
              <label htmlFor="typeFlat">Type flat/woning</label>
              <input type="text" id="typeFlat" />
            </div>
            <div className="project-form__field">
              <label htmlFor="breed">Breed</label>
              <input type="text" id="breed" />
            </div>
            <div className="project-form__field">
              <label htmlFor="diepte">Diepte</label>
              <input type="text" id="diepte" />
            </div>
            {/* <div className="project-form__field">
              <label htmlFor="goothoogte">Goothoogte</label>
              <input type="text" id="goothoogte" />
            </div>
            <div className="project-form__field">
              <label htmlFor="zadeldak">Zadeldak</label>
              <input type="text" id="zadeldak" />
            </div>
            <div className="project-form__field">
              <label htmlFor="nokshoogte">Nokshoogte</label>
              <input type="text" id="nokshoogte" />
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalWoningen">Aantal woningen</label>
              <input type="number" id="aantalWoningen" />
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalKopgevels">Aantal kopgevels</label>
              <input type="number" id="aantalKopgevels" />
            </div>
            <div className="project-form__field">
              <label htmlFor="totaleBreedte">Totale breedte copr</label>
              <input type="text" id="totaleBreedte" />
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalPortieken">Aantal portieken</label>
              <input type="number" id="aantalPortieken" />
            </div>
            <div className="project-form__field">
              <label htmlFor="aantalBouwlagen">Aantal bouwlagen</label>
              <input type="number" id="aantalBouwlagen" />
            </div> */}
          </div>
        </div>
      </form>
    </section>
  );
}
