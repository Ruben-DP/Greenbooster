"use client";

import { useState } from "react";
import Budget from "./calculations/Budget";

import MeasureList from "./calculations/MeasureList";
import { MeasureProvider } from "@/contexts/DataContext";
import Actions from "./calculations/Actions";
import Stats from "./calculations/Stats";
import Residence from "./calculations/Residence";

function PageContent() {
  const [residenceData, setResidenceData] = useState(null);

  return (
    <section className="calculation-form">
      <div className="inner-content container">
        <Budget />
        <Residence selectedResidence={setResidenceData} />
        <Stats />
        <Actions />
      </div>
      <div className="container">
        <MeasureList residenceData={residenceData} />
      </div>
    </section>
  );
}

export default function CalculationForm() {
  return (
    <MeasureProvider>
      <PageContent />
    </MeasureProvider>
  );
}
