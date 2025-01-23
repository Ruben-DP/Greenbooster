"use client";
import { useState, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import { searchData } from "@/app/actions/search";

interface SearchHandlerProps {
  type: string;
  onFilter: (results: any[]) => void;
  projection: any;
}

export default function SearchHandler({
  type,
  onFilter,
  projection,
}: SearchHandlerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!initialFetchDone.current) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const result = await searchData(type, projection, "");
          if (result.success && result.results) {
            onFilter(result.results);
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialData();
      initialFetchDone.current = true;
    }
  }, [type, projection]);

  const handleSearch = async (searchTerm: string) => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {

        const result = await searchData(type, projection, searchTerm.trim());
        
        if (result.success && result.results) {
          onFilter(result.results);
          console.log(
            "Searched type:",
            type,
            "search term:",
            searchTerm,
            result
          );
        } else {
          console.error("Search failed:", result.error);
        }
      } catch (error) {
        console.error("Error during search:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="search-panel">
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
    </div>
  );
}
