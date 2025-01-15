"use client";

import { Measure } from "@/types/measures";
import DetailHandler from "./DetailHandler";

interface DetailContainerProps {
  isNew: boolean;
  measure: Measure;
}

export default function DetailContainer({
  isNew,
  measure
}: DetailContainerProps) {
  return (
    <DetailHandler
      isNew={isNew}
      measure={measure}
    />
  );
}