import HomeIcon from "@mui/icons-material/Home";
import React from "react";
import { Button } from "react-bootstrap";
import { MainViewMode } from "../../config/Enum";
import { StoreSettings } from "../../config/Store";
import { AppSettings } from "../../config/Variables";

interface Props {
  update: Function;
}

export default class DiagramHome extends React.Component<Props> {
  render() {
    return (
      <div
        className={
          "diagramTab" + ("" === AppSettings.selectedDiagram ? " selected" : "")
        }
      >
        <Button
          className="plainButton noBackground"
          onClick={() => {
            AppSettings.selectedDiagram = "";
            StoreSettings.update((s) => {
              s.mainViewMode = MainViewMode.MANAGER;
              s.selectedDiagram = "";
            });
            this.forceUpdate();
            this.props.update();
          }}
        >
          <HomeIcon />
        </Button>
      </div>
    );
  }
}
