import Footer from "@/modules/footer/Footer";
import CostForm from "@/modules/frontend/CostForm";
import Hero from "@/modules/frontend/Hero";
import Step from "@/modules/frontend/Step";
import { Toaster } from "sonner";

export default function Page() {
  return (
    <>
      <div className="page-wrapper" style={{ width: "100%", height: "100%" }}>
        <Hero title="Kosten berekening" imageUrl="/images/portiekwoning.webp" />
        <Step step={2} />
        <CostForm />
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
        />
        <Footer/>
      </div>
    </>
  );
}
