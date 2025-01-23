import Hero from "@/modules/frontend/Hero";
import ProjectForm from "@/modules/frontend/Projectform";
import Step from "@/modules/frontend/Step";
import { Toaster } from "sonner";

export default function Page() {
  return (
    <>
      <div className="page-wrapper" style={{ width: "100%", height: "100%" }}>
        <Hero title="Woning gegevens" imageUrl="/images/portiekwoning.webp" />
        <Step step={1} />
        <ProjectForm />
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
