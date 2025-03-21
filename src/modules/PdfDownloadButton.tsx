"use client";
import { useEffect, useRef } from "react";

const PdfDownloadButton = () => {
  const scriptRef = useRef(null);

  useEffect(() => {
    // Load html2pdf script
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
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
      alert("PDF bibliotheek wordt geladen, probeer het over enkele seconden opnieuw.");
      return;
    }

    // Target the entire page-wrapper element
    const pageContent = document.querySelector(".page-wrapper");
    if (!pageContent) {
      alert("Kan page-wrapper element niet vinden.");
      return;
    }
    
    // Options for html2pdf
    const options = {
      margin: 10,
      filename: "kostencalculator.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    // Generate the PDF directly from the page content
    window.html2pdf()
      .from(pageContent)
      .set(options)
      .save()
      .catch(error => {
        console.error("Fout bij het genereren van PDF:", error);
        alert("Er is een fout opgetreden bij het genereren van de PDF.");
      });
  };

  return (
    <button
      onClick={handleDownload}
      className="pdf-download-btn"
      style={{
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
        margin: "20px 0"
      }}
    >
      Download als PDF
    </button>
  );
};

export default PdfDownloadButton;