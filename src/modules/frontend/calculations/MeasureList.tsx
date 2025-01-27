"use client";

import { useMeasureData } from "@/contexts/DataContext";
import { useEffect } from "react";

interface Measure {
  name: string;
  group?: string;
  [key: string]: any;
}
interface GroupedMeasures {
  [key: string]: Measure[];
}

export default function MeasureList() {
  const { searchItems, items, isLoading, error } = useMeasureData();

  useEffect(() => {
    searchItems("");
  }, [searchItems]);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!items) {
    return <div>No measures found</div>;
  }

  const groupedItems = items.reduce<GroupedMeasures>((groups, item) => {
    const groupName = (item as Measure).group || "Ungrouped";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item as Measure);
    return groups;
  }, {});

  return (
    <div className="measure-list">
      {items.length > 0 ? (
        Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <div key={groupName} className="measure-group ">
            <h2 className="measure-group-title">{groupName}</h2>
            <div className="measure">
              {/* measure */}
              {groupItems.map((measure, index) => (
                <div key={index} className="measure__name">
                  {measure.name}
                </div>
              ))}
              {/* end measure */}
            </div>
          </div>
        ))
      ) : (
        <div>No measures found</div>
      )}
    </div>
  );
}
