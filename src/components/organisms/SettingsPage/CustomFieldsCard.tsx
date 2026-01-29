import { X } from "lucide-react";
import { CustomField } from "@/types/settings";

interface CustomFieldsCardProps {
  customFields: CustomField[];
  isEditing: boolean;
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onUpdateField: (id: string, fieldName: "name" | "value", value: string | number) => void;
}

export function CustomFieldsCard({
  customFields,
  isEditing,
  onAddField,
  onRemoveField,
  onUpdateField,
}: CustomFieldsCardProps) {
  return (
    <div className="settings-card">
      <div className="settings-header">
        <h2>Extra velden eindblad</h2>
        {isEditing && (
          <button
            type="button"
            onClick={onAddField}
            className="add-field-button"
            title="Voeg nieuw veld toe"
          >
            <span className="plus-icon">+</span>
            Nieuw veld
          </button>
        )}
      </div>

      <div className="settings-form">
        {customFields.map((field, index) => (
          <div key={field.id} className="custom-field-group">
            <div className="custom-field-header">
              <span className="field-number">Veld {index + 1}</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => onRemoveField(field.id)}
                  className="remove-field-button"
                  title="Verwijder veld"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor={`customField-${field.id}-name`}>Naam</label>
              {isEditing ? (
                <input
                  type="text"
                  id={`customField-${field.id}-name`}
                  value={field.name}
                  onChange={(e) => onUpdateField(field.id, "name", e.target.value)}
                  placeholder="Naam van het veld"
                />
              ) : (
                <div className="settings-value">{field.name}</div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor={`customField-${field.id}-value`}>Bedrag (€)</label>
              {isEditing ? (
                <div className="input-with-symbol">
                  <input
                    type="number"
                    id={`customField-${field.id}-value`}
                    value={field.value}
                    onChange={(e) =>
                      onUpdateField(field.id, "value", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              ) : (
                <div className="settings-value">{field.value}</div>
              )}
            </div>
          </div>
        ))}

        {customFields.length === 0 && (
          <div className="no-custom-fields">
            <p>Geen extra velden toegevoegd</p>
            {isEditing && (
              <button
                type="button"
                onClick={onAddField}
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
  );
}
