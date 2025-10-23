"use client";

import { useEffect, useRef, useState } from "react";

const PdfDownloadButton = ({
  selectedResidence,
  selectedMeasures,
  totalBudget,
  totalHeatDemand,
  settings // Add settings prop to get budget breakdown data
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const jsPDFRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      jsPDFRef.current = window.jspdf.jsPDF;
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate budget breakdown (same logic as Budget.tsx)
  const calculateBudgetBreakdown = () => {
    if (!settings) return null;

    const directCosts = Math.max(0, totalBudget);
    const customValue1Amount = directCosts > 0 ? settings.customValue1 || 0 : 0;
    const customValue2Amount = directCosts > 0 ? settings.customValue2 || 0 : 0;

    const subtotalDirectAndCustom = directCosts + customValue1Amount + customValue2Amount;
    const abkMaterieelAmount = subtotalDirectAndCustom * (settings.abkMaterieel / 100);
    const subtotalAfterABK = subtotalDirectAndCustom + abkMaterieelAmount;
    const afkoopAmount = subtotalDirectAndCustom * (settings.afkoop / 100);
    const subtotalDirectABKAfkoop = subtotalAfterABK + afkoopAmount;
    const planuitwerkingAmount = subtotalDirectAndCustom * (settings.kostenPlanuitwerking / 100);
    const subtotalAfterPlanuitwerking = subtotalDirectABKAfkoop + planuitwerkingAmount;
    const nazorgServiceAmount = subtotalDirectAndCustom * (settings.nazorgService / 100);
    const carPiDicAmount = subtotalDirectAndCustom * (settings.carPiDicVerzekering / 100);
    const bankgarantieAmount = subtotalDirectAndCustom * (settings.bankgarantie / 100);
    const algemeneKostenAmount = subtotalDirectAndCustom * (settings.algemeneKosten / 100);
    const risicoAmount = subtotalDirectAndCustom * (settings.risico / 100);
    const winstAmount = subtotalDirectAndCustom * (settings.winst / 100);
    const subtotalBouwkosten = subtotalAfterPlanuitwerking + nazorgServiceAmount + carPiDicAmount + 
                               bankgarantieAmount + algemeneKostenAmount + risicoAmount + winstAmount;
    const planvoorbereidingAmount = subtotalDirectAndCustom * (settings.planvoorbereiding / 100);
    const huurdersbegeleidingAmount = subtotalDirectAndCustom * (settings.huurdersbegeleiding / 100);
    const subtotalAfterBijkomendeKosten = subtotalBouwkosten + planvoorbereidingAmount + huurdersbegeleidingAmount;
    const totalExclVAT = subtotalAfterBijkomendeKosten;
    const vat = totalExclVAT * (settings.vatPercentage / 100);
    const finalAmount = totalExclVAT + vat;

    return {
      directCosts, customValue1Amount, customValue2Amount, subtotalDirectAndCustom,
      abkMaterieelAmount, subtotalAfterABK, afkoopAmount, subtotalDirectABKAfkoop,
      planuitwerkingAmount, subtotalAfterPlanuitwerking, nazorgServiceAmount,
      carPiDicAmount, bankgarantieAmount, algemeneKostenAmount, risicoAmount,
      winstAmount, subtotalBouwkosten, planvoorbereidingAmount, huurdersbegeleidingAmount,
      subtotalAfterBijkomendeKosten, totalExclVAT, vat, finalAmount
    };
  };

  const determineEnergyLabel = (originalEnergy, heatDemandReduction) => {
    if (!originalEnergy) return "?";
    
    const newEnergy = originalEnergy - heatDemandReduction;
    const labels = {
      "A++++": 0, "A+++": 50, "A++": 75, "A+": 105, "A": 160,
      "B": 190, "C": 250, "D": 290, "E": 335, "F": 380, "G": 1000,
    };

    const sortedLabels = Object.entries(labels).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < sortedLabels.length - 1; i++) {
      if (newEnergy < sortedLabels[i + 1][1]) {
        return sortedLabels[i][0];
      }
    }
    return "G";
  };

  // Convert image to base64 and get dimensions for proper scaling
  const getImageAsBase64WithDimensions = (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve({
          base64: dataURL,
          width: img.width,
          height: img.height
        });
      };
      img.onerror = reject;
      img.src = imagePath;
    });
  };

  // Calculate dimensions to fit within bounds while maintaining aspect ratio (like object-fit: contain)
  const calculateContainDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = maxWidth;
    let newHeight = maxWidth / aspectRatio;
    
    // If height exceeds max, scale based on height instead
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = maxHeight * aspectRatio;
    }
    
    return { width: newWidth, height: newHeight };
  };

  // Simplified function to just add the final total
  const addFinalTotalToPDF = (doc, breakdown, startY) => {
    let currentY = startY;
    const leftMargin = 20;
    const rightMargin = doc.internal.pageSize.getWidth() - 20;
    
    // Final total with prominent styling (removed "Totaal Project" title and one line)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Totaal incl. BTW", leftMargin, currentY);
    doc.text(`€ ${formatPrice(breakdown.finalAmount)}`, rightMargin, currentY, { align: "right" });
    
    return currentY + 10;
  };

  const handleDownload = async () => {
    if (!jsPDFRef.current) {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    if (!selectedResidence || selectedMeasures.length === 0) {
      alert("Selecteer eerst een woning en maatregelen voordat je een PDF genereert.");
      return;
    }

    setIsLoading(true);

    try {
      const doc = new jsPDFRef.current({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFont("helvetica");
      
      const projectInfo = selectedResidence.projectInformation || {};
      const energyInfo = selectedResidence.energyDetails || {};
      const currentEnergyUsage = energyInfo.huidigVerbruik || 0;
      // Calculate current label from energy usage, just like EnergyLabel component
      const currentLabel = currentEnergyUsage ? determineEnergyLabel(currentEnergyUsage, 0) : "?";
      const newLabel = determineEnergyLabel(currentEnergyUsage, totalHeatDemand);
      
      // Header with dual logos
      try {
        // Giesbers logo (left side)
        const giesbersLogoPath = `/images/giesbersLogo.png`;
        const giesbersLogoData = await getImageAsBase64WithDimensions(giesbersLogoPath);
        
        // Alpha logo (right side of Giesbers logo)
        const alphaLogoPath = `/images/alphaLogo.png`;
        const alphaLogoData = await getImageAsBase64WithDimensions(alphaLogoPath);
        
        // Set max dimensions for both logos
        const maxLogoWidth = 70;  // Slightly smaller to fit both
        const maxLogoHeight = 35;
        
        // Calculate proper dimensions for Giesbers logo
        const giesbersDimensions = calculateContainDimensions(
          giesbersLogoData.width, 
          giesbersLogoData.height, 
          maxLogoWidth, 
          maxLogoHeight
        );
        
        // Calculate proper dimensions for Alpha logo
        const alphaDimensions = calculateContainDimensions(
          alphaLogoData.width, 
          alphaLogoData.height, 
          maxLogoWidth, 
          maxLogoHeight
        );
        
        // Position Alpha logo on the left (switched position)
        doc.addImage(alphaLogoData.base64, 'PNG', 20, 4, alphaDimensions.width, alphaDimensions.height);
        
        // Position Giesbers logo next to Alpha logo with some spacing (switched position)
        const giesbersLogoX = 20 + alphaDimensions.width + 15; // 15mm gap between logos
        doc.addImage(giesbersLogoData.base64, 'PNG', giesbersLogoX, 12, giesbersDimensions.width, giesbersDimensions.height);
        
      } catch (error) {
        // Fallback to text if logos fail
        console.warn('Could not load logo images, using text fallback');
        doc.setFontSize(20);
        doc.setTextColor(29, 112, 184);
        doc.text("Giesbers & Alpha", 20, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Bouwen en Renoveren", 20, 30);
      }
      
      // Try to add energy label image
      try {
        const labelImagePath = `/images/${newLabel}.png`;
        const labelData = await getImageAsBase64WithDimensions(labelImagePath);
        
        // Set max dimensions for energy label
        const maxLabelWidth = 40;
        const maxLabelHeight = 20;
        
        // Calculate proper dimensions maintaining aspect ratio
        const labelDimensions = calculateContainDimensions(
          labelData.width, 
          labelData.height, 
          maxLabelWidth, 
          maxLabelHeight
        );
        
        // Position from top-right, positioned lower for better alignment
        const labelX = pageWidth - 20 - labelDimensions.width;
        doc.addImage(labelData.base64, 'PNG', labelX, 35, labelDimensions.width, labelDimensions.height);
      } catch (error) {
        // Fallback to text if image fails
        console.warn('Could not load energy label image, using text fallback');
        doc.setFontSize(28);
        doc.setTextColor(29, 112, 184);
        doc.text(newLabel, pageWidth - 20, 40, { align: "right" });
      }
      
      // Residence information
      const leftColX = 20;
      const rightColX = pageWidth / 2 + 10;
      let currentY = 50;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      const addInfoLine = (label, value, x = leftColX) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, x, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(value || "", x + 40, currentY);
      };
      
      // Left column
      addInfoLine("Adres", projectInfo.adres);
      currentY += 6;
      addInfoLine("Postcode", projectInfo.postcode);
      currentY += 6;
      addInfoLine("Plaats", projectInfo.plaats);
      currentY += 6;
      addInfoLine("Bouwjaar", new Date().getFullYear().toString());
      
      // Right column - add "Energielabel" text without value, then TCO and other info
      currentY = 50;
      
      // Add "Energielabel" label only (no value, image will show the actual label)
      doc.setFont("helvetica", "bold");
      doc.text("Energielabel", rightColX, currentY);
      currentY += 8;
      
      // Calculate and display budget breakdown
      const breakdown = calculateBudgetBreakdown();
      if (breakdown) {
        const totalMaintenance40Years = selectedMeasures.reduce((sum, measure) => 
          sum + (measure.maintenanceCost40Years || 0), 0);
        const totalTCO = breakdown.finalAmount + totalMaintenance40Years;
        
        addInfoLine("TCO", `€ ${formatPrice(totalTCO)}`, rightColX);
        currentY += 8;
      }
      
      const highestNuisance = selectedMeasures.reduce((highest, measure) => {
        const nuisanceValue = measure.nuisance ? parseFloat(String(measure.nuisance)) : 0;
        return Math.max(highest, isNaN(nuisanceValue) ? 0 : nuisanceValue);
      }, 0);
      
      addInfoLine("Hinderindicator", highestNuisance.toFixed(1), rightColX);
      currentY += 8;
      addInfoLine("Warmtebehoefte", totalHeatDemand.toFixed(2), rightColX);
      
      // Measures section
      currentY = 100;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Maatregelen", 20, currentY);
      currentY += 8;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, currentY, pageWidth - 20, currentY);
      currentY += 5;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      selectedMeasures.forEach((measure, index) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        
        // Draw blue dot
        doc.setFillColor(29, 112, 184); // Same blue as used for headers
        doc.circle(23, currentY - 2, 1.5, 'F'); // Small filled circle at x:23, y:currentY-2, radius:1.5
        
        const measureText = `${measure.name}`;
        const priceText = `€ ${formatPrice(measure.price || 0)}`;
        
        // Calculate available width for measure text (leave space for price)
        const priceWidth = doc.getTextWidth(priceText);
        const availableWidth = pageWidth - 30 - 20 - priceWidth - 10; // 30 (text start) + 20 (right margin) + priceWidth + 10 (gap)
        
        // Truncate text if it's too long
        let displayText = measureText;
        if (doc.getTextWidth(measureText) > availableWidth) {
          // Find the maximum characters that fit
          let truncated = measureText;
          while (doc.getTextWidth(truncated + "...") > availableWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
          }
          displayText = truncated + "...";
        }
        
        // Indent text to account for the dot
        doc.text(displayText, 30, currentY);
        doc.text(priceText, pageWidth - 20, currentY, { align: "right" });
        currentY += 8;
      });
      
      currentY += 15;
      
      // Add simplified final total if settings are available
      if (breakdown && settings) {
        currentY = addFinalTotalToPDF(doc, breakdown, currentY);
      }
      
      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Disclaimer - uitkomsten zijn een benadering - er kunnen geen rechten aan ontleent worden", 20, currentY + 10);
      
      doc.save("kostencalculator.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Er is een fout opgetreden bij het genereren van de PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      className="pdf-download-btn"
      disabled={isLoading}
      style={{
        padding: "8px 16px",
        backgroundColor: "#1d70b8",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        width: "100%"
      }}
    >
      {isLoading ? "PDF wordt gegenereerd..." : "Download als PDF"}
    </button>
  );
};

export default PdfDownloadButton;