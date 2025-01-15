"use client";
import { useState } from "react";
import DetailContainer from "@/modules/details/DetailContainer";
import SearchContainer from "@/modules/search/SearchContainer";
import DetailConfirmation from "@/modules/details/DetailConfirmation";
import { useData } from "@/contexts/DataContext";

export default function MeasuresPage() {
  const { state, selectMeasure } = useData();
  const { selected: measure, pendingChanges } = state.measures;
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <div className="search-area">
        <SearchContainer />
      </div>

      {measure && (
        <DetailContainer
          key={measure._id}
          isNew={!measure._id}
          measure={measure}
        />
      )}

      {showConfirmation && (
        <DetailConfirmation
          title="Unsaved Changes"
          message="You have unsaved changes. Would you like to save them before continuing?"
          confirm="Save and Continue"
          cancel="Discard Changes"
          changes={pendingChanges}
          onConfirm={async () => {
            setShowConfirmation(false);
          }}
          onCancel={() => {
            setShowConfirmation(false);
            selectMeasure(null);
          }}
        />
      )}
    </>
  );
}