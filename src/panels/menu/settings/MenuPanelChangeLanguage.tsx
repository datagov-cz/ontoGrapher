import * as React from "react";
import { Dropdown } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { en } from "../../../locale/en";
import { getLocalStorageKey } from "../../../function/FunctionGetVars";
import { Languages } from "../../../config/Languages";

interface Props {
  handleChangeLanguage: (language: string) => void;
  title: keyof typeof en;
  languageType: "interfaceLanguage" | "canvasLanguage";
}

export const MenuPanelChangeLanguage: React.FC<Props> = (props: Props) => {
  return (
    <Dropdown drop={"end"}>
      <Dropdown.Toggle>
        {Locale[AppSettings.interfaceLanguage][props.title]}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.keys(Languages).map((languageCode) => (
          <Dropdown.Item
            key={languageCode}
            disabled={languageCode === AppSettings[props.languageType]}
            onClick={() => {
              localStorage.setItem(
                getLocalStorageKey(props.languageType),
                languageCode
              );
              props.handleChangeLanguage(languageCode);
            }}
          >
            {Languages[languageCode]}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
