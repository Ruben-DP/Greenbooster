"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import styles from "./SearchResults.module.scss";

type NestedKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ?
        | `${Prefix}${string & K}`
        | `${Prefix}${string & K}.${NestedKeys<T[K], "">}`
    : `${Prefix}${string & K}`;
}[keyof T];

export interface SearchResultsProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  displayField: NestedKeys<T>;
  groupBy?: keyof T;
}

const getNestedValue = <T extends object>(obj: T, path: string): any => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

export function SearchResults<T extends object>({
  items,
  onSelect,
  displayField,
  groupBy,
}: SearchResultsProps<T>) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

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
    return <div className={styles["search-results__empty"]}>Geen zoekresultaten</div>;
  }

  if (!groupBy) {
    return (
      <div className={styles["search-results"]}>
        <div className={styles["search-results__items"]}>
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelect(item)}
              className={styles["search-results__item"]}
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
    <div className={styles["search-results"]}>
      {Object.entries(groupedItems).map(([group, groupItems]) => (
        <div key={group} className={styles["search-results__group"]}>
          <div
            className={styles["search-results__group-header"]}
            onClick={() => toggleGroup(group)}
          >
            {expandedGroups[group] ? <ChevronUp /> : <ChevronDown />}
            <span className={styles["search-results__group-name"]}>
              {group} ({groupItems.length})
            </span>
          </div>
          {expandedGroups[group] && (
            <div className={styles["search-results__items"]}>
              {[...groupItems]
                .sort((a, b) => {
                  const valueA = String(getNestedValue(a, displayField));
                  const valueB = String(getNestedValue(b, displayField));
                  return valueA.localeCompare(valueB);
                })
                .map((item, index) => (
                  <div
                    key={index}
                    onClick={() => onSelect(item)}
                    className={styles["search-results__item"]}
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
