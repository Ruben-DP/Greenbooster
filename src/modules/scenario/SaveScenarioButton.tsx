"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { saveScenario } from "./saveScenario";

interface SaveScenarioButtonProps {
  measures: Array<{
    _id?: string;
    id?: string;
    name: string;
    [key: string]: any;
  }>;
  woningId?: string;
  isDisabled?: boolean;
}

const SaveScenarioButton = ({
  measures,
  woningId,
  isDisabled = false,
}: SaveScenarioButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!scenarioName.trim()) {
      toast.error("Geef een naam op voor dit scenario");
      return;
    }

    setIsSaving(true);

    try {
      // Extract only measure IDs
      const measureIds = measures
        .map(measure => measure._id || measure.id)
        .filter(id => id) as string[];

      const result = await saveScenario({
        name: scenarioName,
        measureIds,
        woningId: woningId || undefined,
      });

      if (result.success) {
        toast.success(result.message || "Scenario succesvol opgeslagen");
        setIsOpen(false);
        setScenarioName("");

        // Dispatch custom event to notify ScenarioSelector
        window.dispatchEvent(new Event('scenarioSaved'));
      } else {
        toast.error(result.message || "Kon scenario niet opslaan");
      }
    } catch (error) {
      console.error("Error saving scenario:", error);
      toast.error("Er is een fout opgetreden bij het opslaan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="save-profile-btn"
        disabled={isDisabled || measures.length === 0}
      >
        <Save size={16} />
        Scenario opslaan
      </button>

      {isOpen && (
        <div className="modal-backdrop">
          <div className="save-profile-modal">
            <h3>Scenario opslaan</h3>
            <p>Geef een naam aan dit scenario om later te gebruiken</p>

            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="scenario-name">Scenarionaam</label>
                <input
                  type="text"
                  id="scenario-name"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Bijvoorbeeld: 'Basis renovatie'"
                  autoFocus
                />
              </div>

              <div className="summary">
                <p><strong>Aantal maatregelen:</strong> {measures.length}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
              >
                Annuleren
              </button>
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={isSaving || !scenarioName.trim()}
              >
                {isSaving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .save-profile-modal {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .save-profile-modal h3 {
          margin-top: 0;
          font-size: 20px;
        }

        .modal-form {
          margin: 20px 0;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }

        .summary {
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          margin-top: 16px;
          font-size: 14px;
        }

        .summary p {
          margin: 6px 0;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-btn, .save-btn {
          padding: 10px 16px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          border: none;
        }

        .cancel-btn {
          background-color: #e0e0e0;
        }

        .save-btn {
          background-color: #0f5da8;
          color: white;
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default SaveScenarioButton;
