"use client";
import {
  ScenariosProvider,
  useScenariosData,
} from "@/contexts/DataContext";
import SearchBar from "@/modules/search/SearchBar";
import SearchResults from "@/modules/search/SearchResults";
import { Plus } from "lucide-react";
import Button from "@/modules/Button";
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
  } = useScenariosData();

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
          displayField="naam"
        />
      </div>

      {/* DetailHandler will be added later */}
    </>
  );
}

export default function Page() {
  return (
    <ScenariosProvider>
      <PageContent />
    </ScenariosProvider>
  );
}
