"use client";

import MenuLink from "./MenuLink";
import {
  Users,
  Map,
  Plane,
  HousePlug,
  Calculator,
  House,
  Save,
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
      <MenuLink
        title="Berekeningen"
        url="/admin/berekeningen"
        icon={Calculator}
      />
      <MenuLink title="Woning types" url="/admin/woning-types" icon={House} />
      <MenuLink
        title="Opgeslagen woningen"
        url="/admin/opgeslagen-woningen"
        icon={Save}
      />
      <div style={{ marginTop: "auto", width: "100%" }}>
        <a
          style={{ fontSize: "20px", marginBottom: "16px", display: "block" }}
          href="/"
        >
          Back to site
        </a>
        <ThemeControls />
      </div>
    </nav>
  );
}
