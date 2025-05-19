"use client";
import { useEffect, useRef } from "react";

const PdfDownloadButton = () => {
  const scriptRef = useRef(null);

  useEffect(() => {
    // Load html2pdf script
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
    script.async = true;
    document.head.appendChild(script);

    scriptRef.current = script;

    // Cleanup on unmount
    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, []);

  const handleDownload = () => {
    // Check if html2pdf is loaded
    if (typeof window !== "undefined" && !window.html2pdf) {
      alert(
        "PDF bibliotheek wordt geladen, probeer het over enkele seconden opnieuw."
      );
      return;
    }

    // Target the entire page-wrapper element
    const pageContent = document.querySelector(".page-wrapper");
    if (!pageContent) {
      alert("Kan page-wrapper element niet vinden.");
      return;
    }

    // Store original display values and hide sections
    const heroSection = document.querySelector("section.hero") as HTMLElement;
    const stepSection = document.querySelector("section.step") as HTMLElement;
    const measureList = document.querySelector(".measure-list") as HTMLElement;
    const downloadButton = document.querySelector(
      ".download-button"
    ) as HTMLElement;
    const originalHeroDisplay = heroSection?.style.display;
    const originalStepDisplay = stepSection?.style.display;
    const originalMeasureListDisplay = measureList?.style.display;
    const originalDownloadButtonDisplay = downloadButton?.style.display;

    if (heroSection) heroSection.style.display = "none";
    if (stepSection) stepSection.style.display = "none";
    if (measureList) measureList.style.display = "none";
    if (downloadButton) downloadButton.style.display = "none";

    // Options for html2pdf
    const options = {
      margin: 10,
      filename: "kostencalculator.pdf",
      image: { type: "png", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowWidth: 3840,
        windowHeight: 2160,
        logging: true,
        letterRendering: true,
        imageTimeout: 0,
        backgroundColor: "#FFFFFF",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "landscape",
        compress: false,
        hotfixes: ["px_scaling"],
      },
    };

    // Generate the PDF directly from the page content
    window
      .html2pdf()
      .from(pageContent)
      .set(options)
      .save()
      .then(() => {
        // Restore original display values
        if (heroSection) heroSection.style.display = originalHeroDisplay || "";
        if (stepSection) stepSection.style.display = originalStepDisplay || "";
        if (measureList)
          measureList.style.display = originalMeasureListDisplay || "";
        if (downloadButton)
          downloadButton.style.display = originalDownloadButtonDisplay || "";
      })
      .catch((error: Error) => {
        console.error("Fout bij het genereren van PDF:", error);
        alert("Er is een fout opgetreden bij het genereren van de PDF.");
        // Restore original display values even if there's an error
        if (heroSection) heroSection.style.display = originalHeroDisplay || "";
        if (stepSection) stepSection.style.display = originalStepDisplay || "";
        if (measureList)
          measureList.style.display = originalMeasureListDisplay || "";
        if (downloadButton)
          downloadButton.style.display = originalDownloadButtonDisplay || "";
      });
  };

  return (
    <button onClick={handleDownload} className="pdf-download-btn" style={{}}>
      Download als PDF
    </button>
  );
};

export default PdfDownloadButton;
