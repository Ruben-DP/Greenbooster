import CompareProfiles from "@/modules/ComparePorfiles";
import Footer from "@/modules/footer/Footer";
import Hero from "@/modules/frontend/Hero";
import Step from "@/modules/frontend/Step";
import { Toaster } from "sonner";

export default function ComparePage() {
  return (
    <>
      <div className="page-wrapper" style={{ width: "100%", height: "100%" }}>
        <Hero
          title="Profielen vergelijken"
          imageUrl="/images/portiekwoning.webp"
        />
        <Step step={3} />
        <CompareProfiles />
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
        />
        <Footer />
      </div>
    </>
  );
}
