"use client";
import { useVariableData, VariableProvider } from "@/contexts/DataContext";
import SearchBar from "@/modules/search/SearchBar";
import SearchResults from "@/modules/search/SearchResults";
import { Plus } from "lucide-react";
import Button from "@/modules/Button";
import DetailHandler from "@/modules/details/DetailHandler";
import DetailConfirmation from "@/modules/details/DetailConfirmation";
import { useState } from "react";

function PageContent() {
  const {
    selectedItem,
    selectItem,
    items,
    isLoading,
    isEditing,
    pendingChanges,
    searchItems,
    createItem,
    updateItem,
    setIsEditing,
    setPendingChanges,
  } = useVariableData();
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <div className="search-area">
        <div className="search-container">
          <SearchBar onSearch={searchItems} isLoading={isLoading} />
          <Button icon={Plus} onClick={() => selectItem({}, true)}>
            Nieuw
          </Button>
        </div>
        <SearchResults
          items={items}
          onSelect={selectItem}
          displayField="variableName"
          groupBy=""
        />
      </div>

      {selectedItem && (
        <DetailHandler
          key={selectedItem._id}
          isNew={!selectedItem._id}
          item={selectedItem}
          formType="variables"
          isEditing={isEditing}
          pendingChanges={pendingChanges}
          onEdit={setIsEditing}
          onUpdate={updateItem}
          onCreate={createItem}
          onChanges={setPendingChanges}
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
      )}
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
