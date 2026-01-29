"use client";

import { SearchBar, SearchResults, Button, DetailHandler, DetailConfirmation } from "@/components";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AdminCRUDProps {
  selectedItem: any;
  selectItem: (item: any, isNew?: boolean) => void;
  items: any[];
  isLoading: boolean;
  isEditing: boolean;
  pendingChanges: any;
  searchItems: (query?: string) => void;
  createItem: (item: any) => Promise<any>;
  updateItem: (item: any) => Promise<any>;
  setIsEditing: (value: boolean) => void;
  setPendingChanges: (value: any) => void;
  displayField: string;
  groupBy?: string;
  formType: "variables" | "measures" | "types" | "woningen";
  newButtonLabel?: string;
}

export function AdminCRUD({
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
  displayField,
  groupBy = "",
  formType,
  newButtonLabel = "Nieuw",
}: AdminCRUDProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <div className="search-area">
        <div className="search-container">
          <SearchBar onSearch={searchItems} isLoading={isLoading} />
          <Button icon={Plus} onClick={() => selectItem({}, true)}>
            {newButtonLabel}
          </Button>
        </div>
        <SearchResults
          items={items}
          onSelect={selectItem}
          displayField={displayField}
          groupBy={groupBy}
        />
      </div>

      {selectedItem && (
        <DetailHandler
          key={selectedItem._id}
          isNew={!selectedItem._id}
          item={selectedItem}
          formType={formType}
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
