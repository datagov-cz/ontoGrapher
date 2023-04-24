import React from "react";
import { AppSettings, Stereotypes } from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { CellColors } from "../../config/visual/CellColors";
import { highlightCells, unHighlightCells } from "../../function/FunctionDraw";

interface Props {
  iri: string;
  projectLanguage: string;
  items: string[];
  update: () => void;
}

interface State {
  hover: boolean;
}

export default class ConceptDivider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  handleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (
        this.props.items.every((id) =>
          AppSettings.selectedElements.includes(id)
        )
      )
        unHighlightCells(
          ...AppSettings.selectedElements.filter((elem) =>
            this.props.items.includes(elem)
          )
        );
      else highlightCells(CellColors.detail, ...this.props.items);
      this.props.update();
    }
  }

  render() {
    return (
      <div
        className={
          "conceptDivider" +
          (this.props.items.every((elem) =>
            AppSettings.selectedElements.includes(elem)
          )
            ? " selected"
            : "")
        }
        onMouseOver={() => {
          this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          this.setState({ hover: false });
        }}
        onClick={(event) => this.handleClick(event)}
      >
        {this.props.iri in Stereotypes
          ? Stereotypes[this.props.iri].labels[this.props.projectLanguage]
          : Locale[AppSettings.interfaceLanguage].unsorted}
      </div>
    );
  }
}
