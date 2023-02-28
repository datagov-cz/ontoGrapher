import React from "react";
import { Dropdown } from "react-bootstrap";
import { countries } from "country-flag-icons";
import { Languages } from "../config/Languages";

interface Props {
  language: string;
  setLanguage: Function;
}

export const Flags: {
  [Property in keyof typeof Languages]: typeof countries[number];
} = {
  cs: "CZ",
  en: "US",
};

export const LanguageSelector: React.FC<Props> = (props: Props) => {
  return (
    <Dropdown>
      <Dropdown.Toggle className="languageToggle" variant="light">
        <img
          src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${
            Flags[props.language]
          }.svg`}
          alt={Languages[props.language]}
        />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.keys(Languages).map((lang) => (
          <Dropdown.Item onClick={() => props.setLanguage(lang)}>
            <img
              src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${Flags[lang]}.svg`}
              alt={Languages[lang]}
            />
            &nbsp;{Languages[lang]}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
