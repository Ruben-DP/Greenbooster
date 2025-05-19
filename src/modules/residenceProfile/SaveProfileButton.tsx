"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { saveProfile } from "./saveProfile";

interface SaveProfileButtonProps {
  woningId: string;
  typeId: string;
  measures: Array<{
    _id?: string;
    id?: string;
    name: string;
    group?: string;
    price?: number;
    heatDemandValue?: number;
maintenanceCostPerYear?: number;
    [key: string]: any;
  }>;
  totalBudget: number;
  totalHeatDemand: number;
  isDisabled?: boolean;
}

const SaveProfileButton = ({
  woningId,
  typeId,
  measures,
  totalBudget,
  totalHeatDemand,
  isDisabled = false,
}: SaveProfileButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profileName.trim()) {
      toast.error("Geef een naam op voor dit profiel");
      return;
    }

    setIsSaving(true);

    try {
      // Format measures to include only the necessary data
      const formattedMeasures = measures.map(measure => ({
        id: measure._id || measure.id || "",
        name: measure.name,
        group: measure.group,
        price: measure.price,
        heatDemandValue: measure.heatDemandValue,
        maintenanceCostPerYear: measure.maintenanceCostPerYear
      }));

      const result = await saveProfile({
        woningId,
        typeId,
        measures: formattedMeasures,
        totalBudget,
        totalHeatDemand,
        name: profileName
      });

      if (result.success) {
        // Gebruik toast.success zoals eerder
        toast.success(result.message || "Profiel succesvol opgeslagen");
        
        // Trigger een custom event voor de Step component om op te reageren
        const successEvent = new CustomEvent('toastSuccess', {
          detail: { message: result.message || 'Profiel succesvol opgeslagen' }
        });
        document.dispatchEvent(successEvent);
        
        // Reset de state
        setIsOpen(false);
        setProfileName("");
      } else {
        toast.error(result.message || "Kon profiel niet opslaan");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
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
        Profiel opslaan
      </button>

      {isOpen && (
        <div className="modal-backdrop">
          <div className="save-profile-modal">
            <h3>Profiel opslaan</h3>
            <p>Geef een naam aan dit profiel om later te vergelijken</p>
            
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="profile-name">Profielnaam</label>
                <input
                  type="text"
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Bijvoorbeeld: 'Portiekwoning Scenario A'"
                  autoFocus
                />
              </div>

              <div className="summary">
                <p><strong>Woning:</strong> ID: {woningId}</p>
                <p><strong>Aantal maatregelen:</strong> {measures.length}</p>
                <p><strong>Totale kosten:</strong> €{totalBudget.toFixed(2)}</p>
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
                disabled={isSaving || !profileName.trim()}
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

export default SaveProfileButton;