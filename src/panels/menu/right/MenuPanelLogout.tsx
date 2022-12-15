import React, { useEffect } from "react";
import { Nav } from "react-bootstrap";
import { useAuth } from "@opendata-mvcr/assembly-line-shared";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";

export const MenuPanelLogout: React.FC = () => {
  const { logout, user } = useAuth();

  useEffect(() => {
    AppSettings.currentUser = {
      given_name: user.profile.given_name,
      email: user.profile.email,
      family_name: user.profile.family_name,
      id: user.profile.sub,
    };
  }, [user]);

  return (
    <div className={"inert"}>
      <Nav.Link onClick={logout}>
        {Locale[AppSettings.interfaceLanguage].logout}
      </Nav.Link>
    </div>
  );
};
