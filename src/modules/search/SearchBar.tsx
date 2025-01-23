"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    onSearch("");
  }, []);

  const handleSearch = () => {
    onSearch(searchTerm.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-group">
      <div className="search-bar">
        <Search className="search-bar__icon" size={20} strokeWidth={1.5} />
        <input
          type="text"
          className="search-bar__input"
          placeholder="Zoek op naam"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
