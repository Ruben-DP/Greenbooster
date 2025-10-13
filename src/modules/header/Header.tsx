"use client";

import MenuLink from "./MenuLink";
import {
  HousePlug,
  House,
  Save,
  Settings,
  Link,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { ThemeControls } from "./ThemeControls";
import { useEffect, useState } from "react";
import { searchDocuments } from "@/app/actions/crudActions";

export default function Header() {
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedResidence = async () => {
      const residenceId = localStorage.getItem('selectedResidenceId');
      if (residenceId) {
        try {
          const results = await searchDocuments("woningen", residenceId, "_id");
          if (Array.isArray(results) && results.length > 0) {
            setSelectedAddress(results[0].projectInformation?.adres || null);
          }
        } catch (error) {
          console.error("Failed to fetch residence:", error);
        }
      } else {
        setSelectedAddress(null);
      }
    };

    fetchSelectedResidence();

    // Listen for storage changes to update when selection changes
    const handleStorageChange = () => {
      fetchSelectedResidence();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event when localStorage is updated in same window
    window.addEventListener('residenceSelected', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('residenceSelected', handleStorageChange);
    };
  }, []);
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <MenuLink title="Maatregelen" url="/admin/maatregelen" icon={HousePlug} />
      {/* <MenuLink
        title="Berekeningen"
        url="/admin/berekeningen"
        icon={Calculator}
      /> */}
      <MenuLink title="Woning types" url="/admin/woning-types" icon={House} />
      <MenuLink
        title="Opgeslagen woningen"
        url="/admin/opgeslagen-woningen"
        icon={Save}
      />
      <MenuLink
        title="Scenario's"
        url="/admin/scenarios"
        icon={Layers}
      />
      <MenuLink
        title="Instellingen"
        url="/admin/instellingen"
        icon={Settings}
      />
      <div style={{ marginTop: "auto", width: "100%" }}>
        <a
          href="/kosten-berekening"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            marginBottom: selectedAddress ? "8px" : "16px",
            backgroundColor: "#f8fafc",
            color: "#475569",
            textDecoration: "none",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f1f5f9";
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f8fafc";
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <ArrowLeft size={16} color="black" />
          Naar applicatie
        </a>
        {selectedAddress && (
          <div style={{
            padding: "0 16px",
            marginBottom: "16px",
            fontSize: "12px",
            color: "#64748b",
            fontStyle: "italic"
          }}>
            {selectedAddress}
          </div>
        )}
        {/* <ThemeControls /> */}
      </div>
    </nav>
  );
}