"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import Budget from "./calculations/Budget";

import MeasureList from "./calculations/MeasureList";
import { MeasureProvider } from "@/contexts/DataContext";
import SelectedMeasures from "./calculations/SelectedMeasure";

function PageContent() {
  const [selectedMeasures, setSelectedMeasures] = useState();


  return (
    <section className="calculation-form">
      <Budget/>
      <SelectedMeasures/>
      <MeasureList/>
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
