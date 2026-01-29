import { Footer, Hero, Step } from "@/components";
import { Toaster } from "sonner";

interface FrontendPageLayoutProps {
  title: string;
  imageUrl?: string;
  step?: number;
  children: React.ReactNode;
}

export function FrontendPageLayout({
  title,
  imageUrl = "/images/portiekwoning.webp",
  step,
  children,
}: FrontendPageLayoutProps) {
  return (
    <div className="page-wrapper" style={{ width: "100%", height: "100%" }}>
      <Hero title={title} imageUrl={imageUrl} />
      {step && <Step step={step} />}
      {children}
      <Toaster
        position="bottom-right"
        expand={false}
        richColors
        closeButton
      />
      <Footer />
    </div>
  );
}
