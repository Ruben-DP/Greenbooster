import { Copy } from "lucide-react";
import { Measure } from "@/lib/measures";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SearchResultProps {
  searchList: Measure[];
  onOpenDetail: (isNew: boolean, dataDetails: any) => void;
}

interface GroupedMeasures {
  [key: string]: Measure[];
}

export default function SearchResults({
  searchList,
  onOpenDetail,
}: SearchResultProps) {
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  if (!searchList || searchList.length === 0) {
    return <div className="search-results__empty">No results found</div>;
  }

  const groupedMeasures = searchList.reduce(
    (groups: GroupedMeasures, measure) => {
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
            <div className="search-results__group-title">
              {expandedGroups[group] ? (
                <ChevronUp className="search-results__group-icon" />
              ) : (
                <ChevronDown className="search-results__group-icon" />
              )}
              <span className="search-results__group-text">
                {group} ({measures.length} measures)
              </span>
            </div>
          </div>

          {expandedGroups[group] && (
            <ul className="search-results__list">
              {measures.map((measure) => (
                <li
                  key={measure._id}
                  className="search-results__item"
                  onClick={() => onOpenDetail(false, measure)}
                >
                  <span className="search-results__item-name">{measure.name}</span>
                  <button
                    className="search-results__copy-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(true, measure);
                    }}
                  >
                    <Copy className="search-results__copy-icon" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}