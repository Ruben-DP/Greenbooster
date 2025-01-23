"use client";
import { useState } from "react";
import DetailContainer from "@/modules/details/DetailContainer_old";
import DetailConfirmation from "@/modules/details/DetailConfirmation";
import {
  useVariableData,
  VariableProvider,
} from "@/contexts/DataContext";
import SearchBar from "@/modules/search/SearchBar";
import SearchResults from "@/modules/search/SearchResults";
import { Plus } from "lucide-react";
import Button from "@/modules/Button";

const emptyVariable = {
  _id: "",
  variableName: "",
};

function PageContent() {
  const {
    selectedItem,
    pendingChanges,
    selectItem,
    items,
    isLoading,
    searchItems,
  } = useVariableData();
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <div className="search-area">
        <div className="search-container">
          <SearchBar onSearch={searchItems} isLoading={isLoading} />
          <Button icon={Plus} onClick={() => selectItem(emptyVariable, true)}>
            Nieuw
          </Button>
        </div>
        <SearchResults
          items={items}
          onSelect={selectItem}
          displayField="variableName"
        />
      </div>

      {/* {selectedItem && (
        <DetailContainer
          key={selectedItem._id}
          isNew={!selectedItem._id}
          measure={selectedItem}
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
            selectItem(null);
          }}
        />
      )} */}
    </>
  );
}

export default function Page() {
  return (
    <VariableProvider>
      <PageContent />
    </VariableProvider>
  );
}
