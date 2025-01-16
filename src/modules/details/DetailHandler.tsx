"use client";

import { useState } from "react";
import DetailForm from "./DetailForm";
import DetailControls from "./DetailControls";
import DetailConfirmation from "./DetailConfirmation";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { Measure } from "@/types/measures";
import { ChangeRecord } from "@/types/types";
import { set, get } from "lodash";

interface DetailHandlerProps {
  isNew: boolean;
  measure: Measure;
}

export default function DetailHandler({ isNew, measure }: DetailHandlerProps) {
  const { state, updateMeasure, createMeasure, setEditing, setPendingChanges } =
    useData();
  const { isEditing, pendingChanges } = state.measures;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMeasure, setCurrentMeasure] = useState<Measure>(measure);

  const handleChange = (path: string, oldValue: any, newValue: any) => {
    // Create a new change record
    const changeRecord: ChangeRecord = {
      fieldId: path,
      label: path.split(".").pop() || path,
      oldValue: String(oldValue),
      newValue: String(newValue),
    };

    const newPendingChanges = {
      ...pendingChanges,
      [path]: changeRecord,
    };

    // If the new value is the same as the original value, remove it from pending changes
    if (oldValue === newValue) {
      delete newPendingChanges[path];
    }

    // Update the current measure
    const updatedMeasure = { ...currentMeasure };
    set(updatedMeasure, path, newValue);
    setCurrentMeasure(updatedMeasure);

    // Update pending changes in context
    setPendingChanges(newPendingChanges);
  };

  const handleSaveRequest = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    const success = isNew
      ? await createMeasure(currentMeasure)
      : await updateMeasure(currentMeasure);

    if (success) {
      console.log("succesfully updated!");
      setEditing(false);
      setPendingChanges({});
      setShowConfirmation(false);
      toast.success("Changes saved successfully");
    }
  };

  const handleDiscard = () => {
    setCurrentMeasure(measure); // Reset to original measure
    setEditing(false);
    setPendingChanges({});
    toast.info("Changes discarded");
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const toggleEditing = () => {
    !isEditing ? setEditing(true) : setEditing(false);
  };

  return (
    <div className="details-panel">
      <DetailForm
        measure={currentMeasure}
        isEditing={isEditing}
        onChange={handleChange}
      />
      <DetailControls
        isNew={isNew}
        isBulkEditing={isEditing}
        hasChanges={Object.keys(pendingChanges).length > 0}
        onEdit={toggleEditing}
        onSave={handleSaveRequest}
        onDiscard={handleDiscard}
      />
      {showConfirmation && (
        <DetailConfirmation
          changes={pendingChanges}
          title={isNew ? "Confirm Creation" : "Confirm Changes"}
          message={
            isNew
              ? "Are you sure you want to create this new entry?"
              : "Please review the following changes before saving:"
          }
          confirm={isNew ? "Create" : "Save changes"}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelConfirmation}
        />
      )}
    </div>
  );
}
