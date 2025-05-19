"use client";

import MenuLink from "./MenuLink";
import {
  HousePlug,
  House,
  Save,
  Settings,
  Link,
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
          style={{ marginBottom: "16px", display: "block", textDecoration: "none" }}
          href="/"
        >
          Naar voorkant
        </a>
        <ThemeControls />
      </div>
    </nav>
  );
}