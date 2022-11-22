import React from "react";
import { AppSettings, CardinalityPool } from "../../../config/Variables";
import { Dropdown } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { Cardinality } from "../../../datatypes/Cardinality";
import { getLocalStorageKey } from "../../../function/FunctionGetVars";

type Props = {
  cardinality: "defaultCardinalitySource" | "defaultCardinalityTarget";
};

export const MenuPanelChangeDefaultCardinality: React.FC<Props> = (props) => {
  const changeCardinality: (cardinality: Cardinality) => void = (
    cardinality
  ) => {
    AppSettings[props.cardinality] = new Cardinality(
      cardinality.getFirstCardinality(),
      cardinality.getSecondCardinality()
    );
    localStorage.setItem(
      getLocalStorageKey(props.cardinality),
      JSON.stringify({
        first: cardinality.getFirstCardinality(),
        second: cardinality.getSecondCardinality(),
      })
    );
  };

  const getCardinalityLabel: () => string = () => {
    let location = "";
    if (props.cardinality === "defaultCardinalitySource")
      location = Locale[AppSettings.interfaceLanguage].sourceCardinality;
    if (props.cardinality === "defaultCardinalityTarget")
      location = Locale[AppSettings.interfaceLanguage].targetCardinality;
    return `${
      Locale[AppSettings.interfaceLanguage].default
    } ${location.toLowerCase()}`;
  };

  return (
    <Dropdown drop={"end"}>
      <Dropdown.Toggle>{getCardinalityLabel()}</Dropdown.Toggle>
      <Dropdown.Menu>
        {CardinalityPool.filter((c) => !c.isCardinalityNone())
          .sort((a, b) => a.getString().localeCompare(b.getString()))
          .map((c) => (
            <Dropdown.Item
              key={c.getString()}
              disabled={
                c.getString() === AppSettings[props.cardinality].getString()
              }
              onClick={() => changeCardinality(c)}
            >
              {(c.getString() === AppSettings[props.cardinality].getString()
                ? "✓ "
                : "") + c.getString()}
            </Dropdown.Item>
          ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
