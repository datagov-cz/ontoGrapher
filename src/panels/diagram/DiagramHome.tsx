import React from "react";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
} from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { addDiagram } from "../../function/FunctionCreateVars";
import { Representation } from "../../config/Enum";
import HomeIcon from "@mui/icons-material/Home";
import { Button } from "react-bootstrap";

interface Props {}

interface State {}

export default class DiagramHome extends React.Component<Props, State> {
  render() {
    return (
      <div className={"diagramTab"}>
        <Button className="plainButton">
          <HomeIcon />
        </Button>
      </div>
    );
  }
}
