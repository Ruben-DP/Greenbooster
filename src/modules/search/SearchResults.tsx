import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

type NestedKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ?
        | `${Prefix}${string & K}`
        | `${Prefix}${string & K}.${NestedKeys<T[K], "">}`
    : `${Prefix}${string & K}`;
}[keyof T];

interface SearchResultProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  displayField: NestedKeys<T>;
  groupBy?: keyof T;
}

const getNestedValue = <T extends object>(obj: T, path: string): any => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

export default function SearchResults<T extends object>({
  items,
  onSelect,
  displayField,
  groupBy,
}: SearchResultProps<T>) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!items || !groupBy) return;

    const groups = items.reduce((acc: Record<string, boolean>, item) => {
      const groupValue = String(item[groupBy]) || "Geen groep";
      acc[groupValue] = true;
      return acc;
    }, {});

    setExpandedGroups(groups);
  }, [items, groupBy]);

  if (!items || items.length === 0) {
    return <div className="search-results__empty">Geen zoekresultaten</div>;
  }

  if (!groupBy) {
    return (
      <div className="search-results">
        <div className="search-results__items">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelect(item)}
              className="search-results__item"
            >
              <span>{String(getNestedValue(item, displayField))}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const groupedItems = items.reduce((groups: Record<string, T[]>, item) => {
    const groupValue = String(item[groupBy]) || "Geen groep";
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    groups[groupValue].push(item);
    return groups;
  }, {});

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <div className="search-results">
      {Object.entries(groupedItems).map(([group, groupItems]) => (
        <div key={group} className="search-results__group">
          <div
            className="search-results__group-header"
            onClick={() => toggleGroup(group)}
          >
            {expandedGroups[group] ? <ChevronUp /> : <ChevronDown />}
            <span className="search-results__group-name">
              {group} ({groupItems.length})
            </span>
          </div>
          {expandedGroups[group] && (
            <div className="search-results__items">
              {groupItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => onSelect(item)}
                  className="search-results__item"
                >
                  <span>{String(getNestedValue(item, displayField))}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}