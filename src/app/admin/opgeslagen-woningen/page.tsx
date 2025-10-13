"use client";
import {
  useMeasureData,
  useWoningenData,
  WoningenProvider,
} from "@/contexts/DataContext";
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
  } = useWoningenData();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Store selected residence ID in localStorage for cross-page navigation
  const handleSelectItem = (item: any, startEditing?: boolean) => {
    selectItem(item, startEditing);
    if (item?._id) {
      localStorage.setItem('selectedResidenceId', item._id);
      // Dispatch custom event to notify Header of the change
      window.dispatchEvent(new Event('residenceSelected'));
    } else {
      localStorage.removeItem('selectedResidenceId');
      window.dispatchEvent(new Event('residenceSelected'));
    }
  };

  return (
    <>
      <div className="search-area">
        <div className="search-container">
          <SearchBar onSearch={searchItems} isLoading={isLoading} />
          <Button icon={Plus} onClick={() => handleSelectItem({}, true)}>
            Nieuw
          </Button>
        </div>
        <SearchResults
          items={items}
          onSelect={handleSelectItem}
          displayField="projectInformation.adres"
          groupBy=""
        />
      </div>

      {selectedItem && (
        <DetailHandler
          key={selectedItem._id}
          isNew={!selectedItem._id}
          item={selectedItem}
          isEditing={isEditing}
          formType="woningen"
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
    <WoningenProvider>
      <PageContent />
    </WoningenProvider>
  );
}
