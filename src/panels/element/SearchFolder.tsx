import React from "react";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import classNames from "classnames";
import { AppSettings } from "../../config/Variables";

interface Props {
  scheme: string;
  projectLanguage: string;
  terms: string[];
  update: Function;
}

interface State {
  open: boolean;
}

export default class SearchFolder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation();
    if (event.ctrlKey) {
      if (
        this.props.terms.every((iri) =>
          AppSettings.selectedElements.includes(iri)
        )
      )
        AppSettings.selectedElements
          .filter((iri) => this.props.terms.includes(iri))
          .forEach((iri) => {
            const index = AppSettings.selectedElements.indexOf(iri);
            AppSettings.selectedElements.splice(index, 1);
          });
      else AppSettings.selectedElements.push(...this.props.terms);
    } else {
      this.setState({ open: !this.state.open });
    }
    this.props.update();
  }

  render() {
    return (
      <div
        onClick={(event) => this.handleClick(event)}
        className={classNames("packageFolder", { open: this.state.open })}
      >
        <span className={"vocabularyLabel"}>
          {getLabelOrBlank(
            CacheSearchVocabularies[this.props.scheme].labels,
            this.props.projectLanguage
          )}
        </span>
        {this.props.children}
      </div>
    );
  }
}
