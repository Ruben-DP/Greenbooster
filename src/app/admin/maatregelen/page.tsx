"use client";
import { useState } from "react";
import DetailContainer from "@/modules/details/DetailContainer";
import SearchContainer from "@/modules/search/SearchContainer";
import DetailConfirmation from "@/modules/details/DetailConfirmation";
import { useData } from "@/contexts/DataContext";
import Header from "@/modules/header/Header";
import { Toaster } from "sonner";

export default function Page() {
  const { selectedMeasure, pendingChanges, selectMeasure } = useData();
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <div className="search-area">
        <SearchContainer />
      </div>

      {selectedMeasure && (
        <DetailContainer
          key={selectedMeasure._id}
          isNew={!selectedMeasure._id}
          measure={selectedMeasure}
        />
      )}

      {showConfirmation && (
        <DetailConfirmation
          title="Niet-opgeslagen wijzigingen"
          message="Er zijn niet-opgeslagen wijzigingen. Wil je deze opslaan voordat je verdergaat?"
          confirm="Opslaan en doorgaan"
          cancel="Wijzigingen negeren"
          changes={pendingChanges}
          onConfirm={async () => setShowConfirmation(false)}
          onCancel={() => {
            setShowConfirmation(false);
            selectMeasure(null);
          }}
        />
      )}
    </>
  );
}
