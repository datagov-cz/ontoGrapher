import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React from "react";
import {
  Button,
  Form,
  OverlayTrigger,
  Popover,
  Tooltip,
  Dropdown,
} from "react-bootstrap";
import { Flags } from "../../../components/LanguageSelector";
import { Languages } from "../../../config/Languages";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
interface Props {
  removeAction: Function;
  tooltipText: string;
  unfilledLanguages: string[];
  addLanguageInput: Function;
}

export const ListLanguageControls: React.FC<Props> = (props: Props) => {
  return (
    <span className="listItemControls">
      <OverlayTrigger
        placement="left"
        overlay={<Tooltip>{props.tooltipText}</Tooltip>}
      >
        <Dropdown>
          <Dropdown.Toggle variant="light" className="plainButton">
            <AddIcon />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {props.unfilledLanguages.map((lang) => (
              <Dropdown.Item onClick={() => props.addLanguageInput(lang)}>
                <img
                  src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${Flags[lang]}.svg`}
                  alt={Languages[lang]}
                />
                &nbsp;{Languages[lang]}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip>
            {Locale[AppSettings.interfaceLanguage].workspaceReady}
          </Tooltip>
        }
      >
        <Button
          variant="light"
          className="plainButton"
          onClick={() => props.removeAction()}
        >
          <RemoveIcon />
        </Button>
      </OverlayTrigger>
    </span>
  );
};
