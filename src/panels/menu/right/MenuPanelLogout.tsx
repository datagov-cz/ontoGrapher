import React from "react";
import { Nav } from "react-bootstrap";
import { useAuth } from "@opendata-mvcr/assembly-line-shared";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";

export default function MenuPanelLogout() {
  const { logout } = useAuth();
  return (
    <div className={"inert"}>
      <Nav.Link onClick={logout}>
        {Locale[AppSettings.interfaceLanguage].logout}
      </Nav.Link>
    </div>
  );
}
