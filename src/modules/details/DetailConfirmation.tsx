import React from "react";
import { ChangeRecord } from "@/types/types";

interface DetailConfirmationProps {
  changes?: Record<string, ChangeRecord>;
  title?: string;
  message?: string;
  confirm?: string;
  cancel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DetailConfirmation({
  changes,
  title = "Confirm changes",
  message,
  confirm = "Save changes",
  cancel = "Cancel",
  onConfirm,
  onCancel,
}: DetailConfirmationProps) {
  // Prevent clicks inside the dialog from bubbling up
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="detail-confirmation" onClick={onCancel}>
      <div className="confirmation-dialog" onClick={handleDialogClick}>
        <h2 className="confirmation-title">{title}</h2>

        {message && <p className="confirmation-message">{message}</p>}

        {changes && (
          <div className="changes-list">
            {Object.values(changes).map((change) => (
              <div key={change.fieldId} className="change-item">
                <p className="change-label">{change.label}</p>
                <p className="change-old">
                  {typeof change.oldValue === "object"
                    ? JSON.stringify(change.oldValue)
                    : change.oldValue || "Empty"}
                </p>
                <p className="change-new">
                  {typeof change.newValue === "object"
                    ? JSON.stringify(change.newValue)
                    : change.newValue || "Empty"}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="confirmation-actions">
          <button
            type="button"
            onClick={onCancel}
            className="button button-secondary"
          >
            {cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="button button-danger"
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
