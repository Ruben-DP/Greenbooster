import CalculationForm from "@/modules/frontend/CalculationForm";
import Hero from "@/modules/frontend/Hero";
import ProjectForm from "@/modules/frontend/Projectform";
import Step from "@/modules/frontend/Step";
import { Toaster } from "sonner";

export default function Page() {
  return (
    <>
      <div className="page-wrapper" style={{ width: "100%", height: "100%" }}>
        <Hero title="Kosten berekening" imageUrl="/images/portiekwoning.webp" />
        <Step step={2} />
        <CalculationForm />
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
        />
      </div>
    </>
  );
}
