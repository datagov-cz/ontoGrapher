import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar } from "@mui/material";
import { useAuth } from "@opendata-mvcr/assembly-line-shared";
import React, { useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { IconText } from "../../../components/IconText";
import { Locale } from "../../../config/Locale";
import { AppSettings, Users } from "../../../config/Variables";

export const MenuPanelAvatar: React.FC = () => {
  const { logout, user } = useAuth();

  useEffect(() => {
    AppSettings.currentUser = user.profile.sub;
    Users[user.profile.sub] = {
      given_name: user.profile.given_name,
      family_name: user.profile.family_name,
    };
  }, [user]);

  return (
    <Dropdown className="displayInline">
      <Dropdown.Toggle className="plainButton noBackground">
        <Avatar
          className="avatar"
          alt={
            user.profile.sub in Users
              ? `${Users[user.profile.sub].given_name} ${
                  Users[user.profile.sub].family_name
                }`
              : ""
          }
        >
          {user.profile.sub in Users
            ? user.profile.given_name.toUpperCase()[0] +
              user.profile.family_name.toUpperCase()[0]
            : ""}
        </Avatar>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={logout}>
          <IconText
            text={Locale[AppSettings.interfaceLanguage].logout}
            icon={LogoutIcon}
          />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
