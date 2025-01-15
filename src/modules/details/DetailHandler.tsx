"use client";

import { useState } from "react";
import DetailForm from "./DetailForm";
import DetailControls from "./DetailControls";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { Measure } from "@/types/measures";

interface DetailHandlerProps {
  isNew: boolean;
  measure: Measure;
}

export default function DetailHandler({ isNew, measure }: DetailHandlerProps) {
  const { state, updateMeasure, createMeasure, setEditing, setPendingChanges } =
    useData();
  const { isEditing, pendingChanges } = state.measures;

  const handleSave = async () => {
    const success = isNew
      ? await createMeasure(measure)
      : await updateMeasure(measure);

    if (success) {
      setEditing(false);
      setPendingChanges({});
      toast.success("Changes saved successfully");
    }
  };

  const handleDiscard = () => {
    setEditing(false);
    setPendingChanges({});
    toast.info("Changes discarded");
  };

  const toggleEditing = () => {
    !isEditing ? setEditing(true) : setEditing(false);
  };

  return (
    <div className="details-panel">
      <DetailControls
        isNew={isNew}
        isBulkEditing={isEditing}
        hasChanges={Object.keys(pendingChanges).length > 0}
        onEdit={toggleEditing}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
      <DetailForm measure={measure} isEditing={isEditing} />
    </div>
  );
}
