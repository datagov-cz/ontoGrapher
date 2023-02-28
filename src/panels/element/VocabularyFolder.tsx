import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../config/Locale";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import {
  highlightElement,
  unhighlightElement,
} from "../../function/FunctionDiagram";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface Props {
  open: boolean;
  vocabulary: string;
  update: Function;
  projectLanguage: string;
  readOnly: boolean;
  filter: Function;
  elements: string[];
  setOpen: (vocabulary: string) => void;
}

interface State {
  hover: boolean;
}

export default class VocabularyFolder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (
        this.props.elements.every((id) =>
          AppSettings.selectedElements.includes(id)
        )
      )
        AppSettings.selectedElements
          .filter((elem) => this.props.elements.includes(elem))
          .forEach((elem) => unhighlightElement(elem));
      else this.props.elements.forEach((elem) => highlightElement(elem));
    } else {
      this.props.setOpen(this.props.vocabulary);
    }
    this.props.update();
  }

  render() {
    return (
      <div
        onMouseEnter={() => {
          this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          this.setState({ hover: false });
        }}
        onClick={(event) => this.handleClick(event)}
        className={
          "vocabularyFolder" +
          (this.props.elements.every((elem) =>
            AppSettings.selectedElements.includes(elem)
          )
            ? " selected"
            : "")
        }
      >
        <span
          className={"vocabularyLabel"}
          style={{
            backgroundColor: WorkspaceVocabularies[this.props.vocabulary].color,
          }}
        >
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip>
                {Locale[AppSettings.interfaceLanguage].workspaceReady}
              </Tooltip>
            }
          >
            {this.props.readOnly ? <DescriptionIcon /> : <EditIcon />}
          </OverlayTrigger>
          {getLabelOrBlank(
            WorkspaceVocabularies[this.props.vocabulary].labels,
            this.props.projectLanguage
          )}
          <span className="chevron">
            {this.props.open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </span>
        </span>
        {this.props.children}
      </div>
    );
  }
}
