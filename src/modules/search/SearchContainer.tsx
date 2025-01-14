"use client";
import { useState } from "react";
import SearchResults from "./SearchResults";
import SearchHandler from "./SearchHandler";
import { Plus } from "lucide-react";
import Button from "../Button";

type SearchableField = {
  label: string;
  value: string;
};
interface SearchCotnainerProps {
  type: string;
  onOpenDetail: (isNew: boolean, detailData: any) => void;
  //type specefic fields used for search
  searchableFields: SearchableField[];
  projection: any;
  query: any;
}

export default function SearchContainer({
  type,
  onOpenDetail,
  searchableFields,
  projection,
  query,
}: SearchCotnainerProps) {
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const handleFilterUpdate = (data: any[]) => {
    setFilteredData(data);
  };

  const handleDetailsToParent = (isNew: boolean, detailData: any) => {
    onOpenDetail(isNew, detailData);
  };

  return (
    <>
      <div className="search-container">
        <SearchHandler
          type={type}
          onFilter={handleFilterUpdate}
          projection={projection}
        />
        <Button icon={Plus} onClick={() => handleDetailsToParent(true, [])}>
          New
        </Button>
      </div>

      <SearchResults
        onOpenDetail={handleDetailsToParent}
        searchList={filteredData}
      />
    </>
  );
}
