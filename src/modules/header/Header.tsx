"use client";

import MenuLink from "./MenuLink";
import { Users, Map, Plane, HousePlug, Calculator, House} from "lucide-react";
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
      <MenuLink title="Retrofitting measures" url="/retrofitting-measures" icon={HousePlug} />
      <MenuLink title="Variables" url="/variables" icon={Calculator} />
      <MenuLink title="Residence" url="/residences" icon={House} />
      <div style={{ marginTop: "auto" }}>
        <ThemeControls />
      </div>
    </nav>
  );
}
