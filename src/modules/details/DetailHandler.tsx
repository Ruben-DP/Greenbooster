"use client";

import { useState } from "react";
import DetailForm from "./DetailForm";
import DetailControls from "./DetailControls";
import DetailConfirmation from "./DetailConfirmation";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { Measure } from "@/types/measures";
import { ChangeRecord } from "@/types/types";
import { set } from "lodash";

interface DetailHandlerProps {
  isNew: boolean;
  measure: Measure;
}

export default function DetailHandler({ isNew, measure }: DetailHandlerProps) {
  const { 
    updateMeasure, 
    createMeasure, 
    setIsEditing, 
    setPendingChanges,
    isEditing,
    pendingChanges 
  } = useData();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMeasure, setCurrentMeasure] = useState<Measure>(measure);

  const handleChange = (path: string, oldValue: any, newValue: any) => {
    const changeRecord: ChangeRecord = {
      fieldId: path,
      label: path.split(".").pop() || path,
      oldValue: String(oldValue),
      newValue: String(newValue),
    };

    const newPendingChanges = { ...pendingChanges };
    
    if (oldValue === newValue) {
      delete newPendingChanges[path];
    } else {
      newPendingChanges[path] = changeRecord;
    }

    const updatedMeasure = { ...currentMeasure };
    set(updatedMeasure, path, newValue);
    setCurrentMeasure(updatedMeasure);
    setPendingChanges(newPendingChanges);
  };

  const handleSaveRequest = () => setShowConfirmation(true);

  const handleConfirmSave = async () => {
    const success = isNew
      ? await createMeasure(currentMeasure)
      : await updateMeasure(currentMeasure);

    if (success) {
      setIsEditing(false);
      setPendingChanges({});
      setShowConfirmation(false);
      toast.success("Wijzigingen succesvol opgeslagen");
    }
  };

  const handleDiscard = () => {
    setCurrentMeasure(measure);
    setIsEditing(false);
    setPendingChanges({});
    toast.info("Wijzigingen ongedaan gemaakt");
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
        onEdit={() => setIsEditing(!isEditing)}
        onSave={handleSaveRequest}
        onDiscard={handleDiscard}
      />
      {showConfirmation && (
        <DetailConfirmation
          changes={pendingChanges}
          title={isNew ? "Bevestig aanmaken" : "Bevestig wijzigingen"}
          message={isNew 
            ? "Weet je zeker dat je deze nieuwe invoer wilt aanmaken?" 
            : "Controleer de volgende wijzigingen voordat je opslaat:"}
          confirm={isNew ? "Aanmaken" : "Wijzigingen opslaan"}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}