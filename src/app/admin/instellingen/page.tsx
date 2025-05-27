"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/app/actions/settingsActions";
import { Settings } from "@/types/settings";

export default function SettingsPage() {
  // Default values to handle the initial state before data is loaded
  const defaultSettings: Settings = {
    hourlyLaborCost: 51,
    vatPercentage: 21,
    inflationPercentage: 1,
    cornerHouseCorrection: -10,
    abkMaterieel: 5,
    afkoop: 2,
    kostenPlanuitwerking: 3,
    nazorgService: 1.5,
    carPiDicVerzekering: 1,
    bankgarantie: 0.5,
    algemeneKosten: 8,
    risico: 2,
    winst: 5,
    planvoorbereiding: 3,
    huurdersbegeleiding: 2,
    // Add default values for custom fields with string conversion for safety
    customValue1Name: "Custom field 1",
    customValue1: 0,
    customValue2Name: "Custom field 2",
    customValue2: 0
  };
  
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const result = await getSettings();
        if (result.success && result.data) {
          // Create a merged settings object with defaults for any missing values
          const mergedSettings = {...defaultSettings};
          
          // Only copy values that are valid (not undefined, not null, not NaN)
          Object.keys(result.data).forEach(key => {
            if (result.data[key] !== undefined && result.data[key] !== null && 
                (typeof result.data[key] !== 'number' || !isNaN(result.data[key]))) {
              mergedSettings[key] = result.data[key];
            }
          });
          
          setSettings(mergedSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Kon instellingen niet laden");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Check if it's a numeric field or a text field
    if (name === 'customValue1Name' || name === 'customValue2Name') {
      // Handle text fields
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // Handle numeric fields
      // Only update if value is not empty
      if (value !== '') {
        setSettings((prev) => ({
          ...prev,
          [name]: parseFloat(value),
        }));
      }
    }
  };

  const handleSave = async () => {
    try {
      // Log the settings we're trying to save
      console.log("Saving settings:", settings);
      
      // Get the existing settings from the server
      const existingResult = await getSettings();
      
      if (existingResult.success && existingResult.data) {
        // Only update the fields that already exist in the backend data
        const safeSettings = {};
        
        // Only include fields that already exist in the backend response
        Object.keys(existingResult.data).forEach(key => {
          if (settings[key] !== undefined) {
            safeSettings[key] = settings[key];
          }
        });
        
        // Add custom fields - these might be new so they may not exist in backend yet
        const customFields = [
          'customValue1', 'customValue1Name', 
          'customValue2', 'customValue2Name'
        ];
        
        customFields.forEach(field => {
          if (settings[field] !== undefined) {
            safeSettings[field] = settings[field];
          }
        });
        
        console.log("Safe settings to save:", safeSettings);
        
        // Update with only the fields that existed in the original response
        const result = await updateSettings(safeSettings);
        if (result.success) {
          toast.success("Instellingen succesvol opgeslagen");
          setIsEditing(false);
          
          // Refresh settings from server
          const refreshResult = await getSettings();
          if (refreshResult.success && refreshResult.data) {
            setSettings({
              ...defaultSettings,
              ...refreshResult.data
            });
          }
        } else {
          console.error("Error details:", result.error);
          toast.error(result.error || "Kon instellingen niet opslaan");
        }
      } else {
        toast.error("Kon bestaande instellingen niet ophalen");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Er is een fout opgetreden bij het opslaan");
    }
  };

  if (isLoading) {
    return <div className="loading">Instellingen laden...</div>;
  }


  return (
    <div className="settings-page">
      <h1 className="settings-title">Algemene Instellingen</h1>

      <div className="settings-actions-main">
        {isEditing ? (
          <>
            <button
              className="button button-secondary"
              onClick={() => setIsEditing(false)}
            >
              Annuleren
            </button>
            <button className="button button-primary" onClick={handleSave}>
              Opslaan
            </button>
          </>
        ) : (
          <button
            className="button button-primary"
            onClick={() => setIsEditing(true)}
          >
            Bewerken
          </button>
        )}
      </div>

      <div className="settings-container">
        {/* First card - Basic settings */}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
            {/*             
            <div className="settings-field">
              <label htmlFor="cornerHouseCorrection">Hoekhuis correctie (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="cornerHouseCorrection"
                    name="cornerHouseCorrection"
                    value={settings.cornerHouseCorrection}
                    onChange={handleChange}
                    step="0.1"
                    min="-100"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.cornerHouseCorrection}%</div>
              )}
              <div className="settings-description">
                Het correctiepercentage toegepast op hoekhuizen. Een negatieve waarde betekent een reductie in kosten.
              </div>
            </div> */}
          </div>
        </div>

        {/* Second card - Percentage settings */}
        <div className="settings-card">
          <div className="settings-header">
            <h2>Eindblad berekening</h2>
          </div>

          <div className="settings-form">
            <div className="settings-field">
              <label htmlFor="abkMaterieel">
                ABK / materieel volgens begroting (%)
              </label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="abkMaterieel"
                    name="abkMaterieel"
                    value={settings.abkMaterieel}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.abkMaterieel}%</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="afkoop">Afkoop (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="afkoop"
                    name="afkoop"
                    value={settings.afkoop}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.afkoop}%</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="kostenPlanuitwerking">
                Kosten t.b.v. nadere planuitwerking (%)
              </label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="kostenPlanuitwerking"
                    name="kostenPlanuitwerking"
                    value={settings.kostenPlanuitwerking}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">
                  {settings.kostenPlanuitwerking}%
                </div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="nazorgService">Nazorg / Service (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="nazorgService"
                    name="nazorgService"
                    value={settings.nazorgService}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.nazorgService}%</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="carPiDicVerzekering">
                CAR / PI / DIC verzekering (%)
              </label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="carPiDicVerzekering"
                    name="carPiDicVerzekering"
                    value={settings.carPiDicVerzekering}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">
                  {settings.carPiDicVerzekering}%
                </div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="bankgarantie">Bankgarantie (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="bankgarantie"
                    name="bankgarantie"
                    value={settings.bankgarantie}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.bankgarantie}%</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="algemeneKosten">Algemene kosten (AK) (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="algemeneKosten"
                    name="algemeneKosten"
                    value={settings.algemeneKosten}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.algemeneKosten}%</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="risico">Risico (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="risico"
                    name="risico"
                    value={settings.risico}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.risico}%</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="winst">Winst (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="winst"
                    name="winst"
                    value={settings.winst}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">{settings.winst}%</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="planvoorbereiding">Planvoorbereiding (%)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="planvoorbereiding"
                    name="planvoorbereiding"
                    value={settings.planvoorbereiding}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">
                  {settings.planvoorbereiding}%
                </div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="huurdersbegeleiding">
                Huurdersbegeleiding (%)
              </label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id="huurdersbegeleiding"
                    name="huurdersbegeleiding"
                    value={settings.huurdersbegeleiding}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="input-symbol">%</span>
                </div>
              ) : (
                <div className="settings-value">
                  {settings.huurdersbegeleiding}%
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Third card - Custom fields */}
        <div className="settings-card">
          <div className="settings-header">
            <h2>Extra velden eindblad</h2>
          </div>

          <div className="settings-form">
            {/* Custom Field 1 */}
            <div className="custom-field-group">
              <div className="settings-field">
                <label htmlFor="customValue1Name">Veld 1 Naam</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="customValue1Name"
                    name="customValue1Name"
                    value={settings.customValue1Name}
                    onChange={handleChange}
                    placeholder="Naam van aangepast veld 1"
                  />
                ) : (
                  <div className="settings-value">
                    {settings.customValue1Name}
                  </div>
                )}
              </div>

              <div className="settings-field">
                <label htmlFor="customValue1">Bedrag (€)</label>
                {isEditing ? (
                  <div className="input-with-symbol">
                    <input
                      type="number"
                      id="customValue1"
                      name="customValue1"
                      value={settings.customValue1}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <div className="settings-value">{settings.customValue1}</div>
                )}
              </div>
            </div>

            {/* Custom Field 2 */}
            <div className="custom-field-group">
              <div className="settings-field">
                <label htmlFor="customValue2Name">Veld 2 Naam</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="customValue2Name"
                    name="customValue2Name"
                    value={settings.customValue2Name}
                    onChange={handleChange}
                    placeholder="Naam van aangepast veld 2"
                  />
                ) : (
                  <div className="settings-value">
                    {settings.customValue2Name}
                  </div>
                )}
              </div>

              <div className="settings-field">
                <label htmlFor="customValue2">Bedrag (€)</label>
                {isEditing ? (
                  <div className="input-with-symbol">
                    <input
                      type="number"
                      id="customValue2"
                      name="customValue2"
                      value={settings.customValue2}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <div className="settings-value">{settings.customValue2}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          padding: 20px;
          max-width: 1600px;
          height:100vh;
          overflow-y:scroll;
        }

        .settings-title {
          margin-bottom: 24px;
          font-size: 24px;
          font-weight: 600;
        }

        .settings-actions-main {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 16px;
        }

        .settings-container {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }

        .settings-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 24px;
          margin-bottom: 24px;
          flex: 1;
          min-width: 350px;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eaeaea;
        }

        .settings-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .settings-note {
          font-size: 14px;
          color: #666;
          font-style: italic;
        }

        .settings-actions {
          display: flex;
          gap: 8px;
        }

        .button {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: background-color 0.2s;
        }

        .button-primary {
          background-color: var(--accent-color, #4361ee);
          color: white;
        }

        .button-secondary {
          background-color: #e0e0e0;
          color: #333;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-field label {
          font-weight: 500;
          color: #333;
        }

        .settings-value {
          font-size: 16px;
          padding: 8px 0;
        }

        .settings-description {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }

        .input-with-symbol {
          display: flex;
          align-items: center;
          position: relative;
        }

        .input-with-symbol input {
          width: 100%;
          padding: 8px 12px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .input-with-symbol .input-symbol {
          position: absolute;
          right: 10px;
          color: #666;
        }

        .input-with-symbol input {
          padding-right: 25px;
          padding-left: 12px;
        }

        .input-with-symbol:first-child .input-symbol {
          left: 10px;
          right: unset;
        }

        .input-with-symbol:first-child input {
          padding-left: 25px;
          padding-right: 12px;
        }

        input[type="text"] {
          width: 100%;
          padding: 8px 12px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .custom-field-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 18px;
          color: #666;
        }

        @media (max-width: 768px) {
          .settings-container {
            flex-direction: column;
          }

          .settings-card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
