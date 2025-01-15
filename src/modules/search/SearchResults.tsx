"use client";

import { Copy } from "lucide-react";
import { Measure } from "@/types/measures";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";

interface SearchResultProps {
  searchList: Measure[];
}

export default function SearchResults({ searchList }: SearchResultProps) {
  const { selectMeasure } = useData();
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  if (!searchList || searchList.length === 0) {
    return <div className="search-results__empty">No results found</div>;
  }

  const groupedMeasures = searchList.reduce(
    (groups: { [key: string]: Measure[] }, measure) => {
      const group = measure.group || "Other";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(measure);
      return groups;
    },
    {}
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <div className="search-results">
      {Object.entries(groupedMeasures).map(([group, measures]) => (
        <div key={group} className="search-results__group">
          <div
            className="search-results__group-header"
            onClick={() => toggleGroup(group)}
          >
            {expandedGroups[group] ? <ChevronUp /> : <ChevronDown />}
            <span>
              {group} ({measures.length})
            </span>
          </div>
          {expandedGroups[group] && (
            <div className="search-results__items">
              {measures.map((measure) => (
                <div
                  key={measure._id}
                  onClick={() => selectMeasure(measure)}
                  className="search-results__item"
                >
                  <span>{measure.name}</span>
                  {/* copy disabled */}
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectMeasure({ ...measure, _id: '' });
                    }}
                    className="copy-button"
                  >
                    <Copy size={16} />
                  </button> */}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
