import React, { useEffect } from "react";
import { Dropdown, Nav } from "react-bootstrap";
import { useAuth } from "@opendata-mvcr/assembly-line-shared";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { Avatar } from "@mui/material";
import { IconText } from "../../../components/IconText";
import LogoutIcon from "@mui/icons-material/Logout";

export default function MenuPanelAvatar() {
  // const { logout, user } = useAuth();

  // useEffect(() => {
  //   AppSettings.currentUser = {
  //     given_name: user.profile.given_name,
  //     email: user.profile.email,
  //     family_name: user.profile.family_name,
  //     id: user.profile.sub,
  //   };
  // }, [user]);

  return (
    <Dropdown className="displayInline">
      <Dropdown.Toggle className="plainButton noBackground">
        <Avatar className="avatar">{/* TODO: gravatar */}</Avatar>
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
