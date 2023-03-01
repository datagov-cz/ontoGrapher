import React, { useEffect } from "react";
import { Dropdown, Nav } from "react-bootstrap";
import { useAuth } from "@opendata-mvcr/assembly-line-shared";
import { Locale } from "../../../config/Locale";
import { AppSettings, Users } from "../../../config/Variables";
import { Avatar } from "@mui/material";
import { IconText } from "../../../components/IconText";
import LogoutIcon from "@mui/icons-material/Logout";

export default function MenuPanelAvatar() {
  // const { logout, user } = useAuth();

  // useEffect(() => {
  //   AppSettings.currentUser = user.profile.sub;
  //   Users[user.profile.sub] = {
  //   given_name: user.profile.given_name,
  //   family_name: user.profile.family_name,
  // }
  // }, [user]);

  return (
    <Dropdown className="displayInline">
      <Dropdown.Toggle className="plainButton noBackground">
        <Avatar
          className="avatar"
          // alt={`${Users[user.profile.sub].given_name} ${Users[user.profile.sub].family_name}`}
        >
          {/* TODO: Activate before PR */}
          {/* user.profile.given_name[0] + user.profile.family_name[0] */}
        </Avatar>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
        // onClick={logout}
        >
          <IconText text="Odhlásit" icon={LogoutIcon} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
