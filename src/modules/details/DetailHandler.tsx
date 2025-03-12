"use client";

import { useState } from "react";
import DetailForm from "../forms/MeasureForm";
import DetailControls from "./DetailControls";
import DetailConfirmation from "./DetailConfirmation";
import { toast } from "sonner";
import { set } from "lodash";
import MeasureForm from "../forms/MeasureForm";
import VariableForm from "../forms/VariableForm";
import ResidenceForm from "../forms/ResidenceForm";
import TypeForm from "../forms/TypeForm";

interface DetailHandlerProps {
  isNew: boolean;
  item: any;
  isEditing: boolean;
  pendingChanges: Record<string, any>;
  formType: "measures" | "variables" | "woningen" | "types";
  onEdit: (isEditing: boolean) => void;
  onUpdate: (item: any) => Promise<boolean>;
  onCreate: (item: any) => Promise<boolean>;
  onChanges: (changes: Record<string, any>) => void;
}

export default function DetailHandler({
  isNew,
  item,
  isEditing,
  pendingChanges,
  formType,
  onEdit,
  onUpdate,
  onCreate,
  onChanges,
}: DetailHandlerProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentItem, setCurrentItem] = useState(item);

  const handleChange = (path: string, oldValue: any, newValue: any) => {
    const changeRecord = {
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

    const updatedItem = { ...currentItem };
    set(updatedItem, path, newValue);
    setCurrentItem(updatedItem);
    onChanges(newPendingChanges);
  };
  const handleSaveRequest = () => setShowConfirmation(true);

  const handleConfirmSave = async () => {
    const success = isNew
      ? await onCreate(currentItem)
      : await onUpdate(currentItem);

    if (success) {
      onEdit(false);
      onChanges({});
      setShowConfirmation(false);
      toast.success("Wijzigingen succesvol opgeslagen");
    }
  };
  const handleDiscard = () => {
    setCurrentItem(item);
    onEdit(false);
    onChanges({});
    toast.info("Wijzigingen ongedaan gemaakt");
  };

  return (
    <div className="details-panel">
          <DetailControls
        isNew={isNew}
        isEditing={isEditing}
        hasChanges={Object.keys(pendingChanges).length > 0}
        onEdit={() => onEdit(!isEditing)}
        onSave={handleSaveRequest}
        onDiscard={handleDiscard}
      />
      {formType == "measures" && (
        <MeasureForm
          item={currentItem}
          isEditing={isEditing}
          onChange={handleChange}
          pendingChanges={pendingChanges}
        />
      )}
      {formType == "variables" && (
        <VariableForm
          item={currentItem}
          isEditing={isEditing}
          onChange={handleChange}
          pendingChanges={pendingChanges}
        />
      )}
      {formType == "woningen" && (
        <ResidenceForm
          item={currentItem}
          isEditing={isEditing}
          onChange={handleChange}
          pendingChanges={pendingChanges}
        />
      )}
      {formType === "types" && (
        <TypeForm
          item={currentItem}
          isEditing={isEditing}
          onChange={handleChange}
          pendingChanges={pendingChanges}
        />
      )}
  

      {showConfirmation && (
        <DetailConfirmation
          changes={pendingChanges}
          title={isNew ? "Bevestig aanmaken" : "Bevestig wijzigingen"}
          message={
            isNew
              ? "Weet je zeker dat je deze nieuwe invoer wilt aanmaken?"
              : "Controleer de volgende wijzigingen voordat je opslaat:"
          }
          confirm={isNew ? "Aanmaken" : "Wijzigingen opslaan"}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}
