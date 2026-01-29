import { Settings } from "@/types/settings";

interface CalculationSettingsCardProps {
  settings: Settings;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CalculationSettingsCard({
  settings,
  isEditing,
  onChange,
}: CalculationSettingsCardProps) {
  const fields = [
    {
      id: "abkMaterieel",
      label: "ABK / materieel volgens begroting (%)",
      value: settings.abkMaterieel,
    },
    { id: "afkoop", label: "Afkoop (%)", value: settings.afkoop },
    {
      id: "kostenPlanuitwerking",
      label: "Kosten t.b.v. nadere planuitwerking (%)",
      value: settings.kostenPlanuitwerking,
    },
    {
      id: "nazorgService",
      label: "Nazorg / Service (%)",
      value: settings.nazorgService,
    },
    {
      id: "carPiDicVerzekering",
      label: "CAR / PI / DIC verzekering (%)",
      value: settings.carPiDicVerzekering,
    },
    {
      id: "bankgarantie",
      label: "Bankgarantie (%)",
      value: settings.bankgarantie,
    },
    {
      id: "algemeneKosten",
      label: "Algemene kosten (AK) (%)",
      value: settings.algemeneKosten,
    },
    { id: "risico", label: "Risico (%)", value: settings.risico },
    { id: "winst", label: "Winst (%)", value: settings.winst },
    {
      id: "planvoorbereiding",
      label: "Planvoorbereiding (%)",
      value: settings.planvoorbereiding,
    },
    {
      id: "huurdersbegeleiding",
      label: "Huurdersbegeleiding (%)",
      value: settings.huurdersbegeleiding,
    },
  ];

  return (
    <div className="settings-card">
      <div className="settings-header">
        <h2>Eindblad berekening</h2>
      </div>

      <div className="settings-form">
        {fields.map((field) => (
          <div key={field.id} className="settings-field">
            <label htmlFor={field.id}>{field.label}</label>
            {isEditing ? (
              <div className="input-with-symbol">
                <input
                  type="number"
                  id={field.id}
                  name={field.id}
                  value={field.value}
                  onChange={onChange}
                  step="0.1"
                  min="0"
                  max="100"
                />
                <span className="input-symbol">%</span>
              </div>
            ) : (
              <div className="settings-value">{field.value}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
