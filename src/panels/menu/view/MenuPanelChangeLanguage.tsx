import * as React from "react";
import { Dropdown } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings, Languages } from "../../../config/Variables";
import { en } from "../../../locale/en";

interface Props {
  handleChangeLanguage: (language: string) => void;
  title: keyof typeof en;
  language: "interfaceLanguage" | "canvasLanguage";
}

export const MenuPanelChangeLanguage: React.FC<Props> = (props: Props) => {
  return (
    <Dropdown drop={"right"}>
      <Dropdown.Toggle>
        {Locale[AppSettings.interfaceLanguage][props.title]}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.keys(Languages).map((languageCode) => (
          <Dropdown.Item
            key={languageCode}
            disabled={languageCode === AppSettings[props.language]}
            onClick={() => {
              localStorage.setItem(props.language, languageCode);
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
