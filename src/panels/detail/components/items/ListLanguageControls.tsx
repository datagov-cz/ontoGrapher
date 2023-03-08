import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React from "react";
import { Button, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Flags } from "../../../../components/LanguageSelector";
import { Languages } from "../../../../config/Languages";
import { Locale } from "../../../../config/Locale";
import { AppSettings } from "../../../../config/Variables";
interface Props {
  removeAction: Function;
  tooltipText: string;
  unfilledLanguages: string[];
  addLanguageInput: Function;
  disableRemoveControl: boolean;
  disableAddControl: boolean;
}

export const ListLanguageControls: React.FC<Props> = (props: Props) => {
  return (
    <span className="listItemControls">
      <OverlayTrigger
        placement="left"
        overlay={<Tooltip>{props.tooltipText}</Tooltip>}
      >
        <Dropdown>
          <Dropdown.Toggle
            disabled={props.disableAddControl}
            variant="light"
            className="plainButton"
          >
            <AddIcon />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {props.unfilledLanguages.map((lang) => (
              <Dropdown.Item
                key={lang}
                onClick={() => props.addLanguageInput(lang)}
              >
                <img
                  src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${Flags[lang]}.svg`}
                  alt={Languages[lang]}
                  className="flag"
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
            {Locale[AppSettings.interfaceLanguage].removeLanguage}
          </Tooltip>
        }
      >
        <Button
          disabled={props.disableRemoveControl}
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
