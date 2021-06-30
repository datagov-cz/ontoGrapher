import React from "react";
import { Nav } from "react-bootstrap";
import { AppSettings } from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { useAuth } from "@opendata-mvcr/assembly-line-shared";

export default function MenuPanelLogout() {
  const { logout } = useAuth();
  return (
    <div className={"inert"}>
      <Nav.Link onClick={logout}>
        {Locale[AppSettings.viewLanguage].logout}
      </Nav.Link>
    </div>
  );
}
