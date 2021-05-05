import React from "react";
import { AppSettings, Stereotypes } from "../../config/Variables";
import { Locale } from "../../config/Locale";
import {
  highlightElement,
  unhighlightElement,
} from "../../function/FunctionDiagram";

interface Props {
  iri: string;
  projectLanguage: string;
  items: string[];
  visible: boolean;
  update: () => void;
}

interface State {
  hover: boolean;
}

export default class PackageDivider extends React.Component<Props, State> {
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
        AppSettings.selectedElements
          .filter((elem) => this.props.items.includes(elem))
          .forEach((elem) => unhighlightElement(elem));
      else this.props.items.forEach((elem) => highlightElement(elem));
      this.props.update();
    }
  }

  render() {
    return (
      <div
        className={
          "packageDivider" +
          (this.props.visible ? "" : " closed") +
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
          : Locale[AppSettings.viewLanguage].unsorted}
      </div>
    );
  }
}
