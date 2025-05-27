"use client";

import MenuLink from "./MenuLink";
import {
  HousePlug,
  House,
  Save,
  Settings,
  Link,
  ArrowLeft,
} from "lucide-react";
import { ThemeControls } from "./ThemeControls";

export default function Header() {
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
        title="Instellingen"
        url="/admin/instellingen"
        icon={Settings}
      />
      <div style={{ marginTop: "auto", width: "100%" }}>
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
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
        {/* <ThemeControls /> */}
      </div>
    </nav>
  );
}