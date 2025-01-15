"use client";

import { useData } from "@/contexts/DataContext";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import { Plus } from "lucide-react";
import Button from "../Button";

export default function SearchContainer() {
  const { state, searchMeasures, selectMeasure } = useData();
  const { list, isLoading } = state.measures;

  const emptyMeasure = {
    _id: "",
    name: "",
    group: "",
    heat_demand: {
      grongebonden: [
        { period: "tot 1965", value: 0 },
        { period: "1965-1974", value: 0 },
        { period: "1975-1982", value: 0 },
        { period: "1983-1987", value: 0 },
        { period: "1988-1991", value: 0 }
      ],
      portiek: [
        { period: "tot 1965", value: 0 },
        { period: "1965-1974",  value: 0 },
        { period: "1975-1982",  value: 0 },
        { period: "1983-1987",  value: 0 },
        { period: "1988-1991",  value: 0 }
      ],
      gallerij: [
        { period: "tot 1965", value: 0 },
        { period: "1965-1974",  value: 0 },
        { period: "1975-1982",  value: 0 },
        { period: "1983-1987",  value: 0 },
        { period: "1988-1991",  value: 0 }
      ],
    },
    measure_prices: {
      geisoleerde_dakplaat: {
        name: "",
        aantal: {
          type: "",
          value: 0,
          unit: "",
        },
      },
      extra_oppervlakte: {
        name: "",
        aantal: {
          type: "",
          value: 0,
          unit: "",
        },
      },
    },
    additional_components: [],
  };

  return (
    <>
      <div className="search-container">
        <SearchBar onSearch={searchMeasures} isLoading={isLoading} />
        <Button
          icon={Plus}
          onClick={() =>
            selectMeasure(emptyMeasure, true)
          }
        >
          New
        </Button>
      </div>
      <SearchResults searchList={list} />
    </>
  );
}
