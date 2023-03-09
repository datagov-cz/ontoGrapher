import React from "react";
import { Dropdown } from "react-bootstrap";
import { ColorPool } from "../../../config/visual/ColorPool";
import { AppSettings } from "../../../config/Variables";
import { graph } from "../../../graph/Graph";
import { setSchemeColors } from "../../../function/FunctionGetVars";
import { Locale } from "../../../config/Locale";
import { drawGraphElement } from "../../../function/FunctionDraw";
import { updateApplicationContext } from "../../../queries/update/UpdateMiscQueries";

interface Props {
  update: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {}

export default class MenuPanelSwitchColors extends React.Component<
  Props,
  State
> {
  switch(pool: string) {
    AppSettings.viewColorPool = pool;
    setSchemeColors(pool);
    graph
      .getElements()
      .forEach((elem) =>
        drawGraphElement(
          elem,
          AppSettings.canvasLanguage,
          AppSettings.representation
        )
      );
    this.props.performTransaction(updateApplicationContext());
    this.props.update();
    this.forceUpdate();
  }

  render() {
    return (
      <Dropdown drop={"end"}>
        <Dropdown.Toggle>
          {Locale[AppSettings.interfaceLanguage].switchColors}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.keys(ColorPool).map((pool) => (
            <Dropdown.Item
              key={pool}
              disabled={pool === AppSettings.viewColorPool}
              onClick={() => this.switch(pool)}
            >
              {(pool === AppSettings.viewColorPool ? "✓ " : "") +
                ColorPool[pool].label[AppSettings.interfaceLanguage]}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
