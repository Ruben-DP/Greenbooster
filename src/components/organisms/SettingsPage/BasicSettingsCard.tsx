import { Settings } from "@/types/settings";

interface BasicSettingsCardProps {
  settings: Settings;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BasicSettingsCard({
  settings,
  isEditing,
  onChange,
}: BasicSettingsCardProps) {
  return (
    <div className="settings-card">
      <div className="settings-header">
        <h2>Instellingen</h2>
      </div>

      <div className="settings-form">
        <div className="settings-field">
          <label htmlFor="hourlyLaborCost">Uurloon kostprijs (€)</label>
          {isEditing ? (
            <div className="input-with-symbol">
              <span className="input-symbol">€</span>
              <input
                type="number"
                id="hourlyLaborCost"
                name="hourlyLaborCost"
                value={settings.hourlyLaborCost}
                onChange={onChange}
                step="0.01"
                min="0"
              />
            </div>
          ) : (
            <div className="settings-value">
              € {settings.hourlyLaborCost.toFixed(2)}
            </div>
          )}
          <div className="settings-description">
            Het standaard uurloon dat gebruikt wordt voor het berekenen van
            arbeidskosten.
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="vatPercentage">BTW percentage (%)</label>
          {isEditing ? (
            <div className="input-with-symbol">
              <input
                type="number"
                id="vatPercentage"
                name="vatPercentage"
                value={settings.vatPercentage}
                onChange={onChange}
                step="0.1"
                min="0"
                max="100"
              />
              <span className="input-symbol">%</span>
            </div>
          ) : (
            <div className="settings-value">{settings.vatPercentage}%</div>
          )}
          <div className="settings-description">
            Het standaard BTW percentage dat wordt toegepast op alle
            berekeningen.
          </div>
        </div>

        <div className="settings-field">
          <label htmlFor="inflationPercentage">
            Jaarlijks inflatie percentage (%)
          </label>
          {isEditing ? (
            <div className="input-with-symbol">
              <input
                type="number"
                id="inflationPercentage"
                name="inflationPercentage"
                value={settings.inflationPercentage}
                onChange={onChange}
                step="0.1"
                min="0"
                max="10"
              />
              <span className="input-symbol">%</span>
            </div>
          ) : (
            <div className="settings-value">
              {settings.inflationPercentage}%
            </div>
          )}
          <div className="settings-description">
            Het jaarlijkse inflatiepercentage voor de onderhoudskosten over
            lange termijn.
          </div>
        </div>
      </div>
    </div>
  );
}
