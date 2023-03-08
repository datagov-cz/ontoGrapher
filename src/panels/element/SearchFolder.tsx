import React from "react";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import classNames from "classnames";
import { AppSettings } from "../../config/Variables";
import { Accordion } from "react-bootstrap";

interface Props {
  scheme: string;
  projectLanguage: string;
  terms: string[];
  update: Function;
  setOpen: (vocabulary: string) => void;
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

  handleClick(event: React.MouseEvent<HTMLElement, MouseEvent>) {
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
      this.props.setOpen(this.props.scheme);
    }
    this.props.update();
  }

  render() {
    return (
      <Accordion.Item
        eventKey={this.props.scheme}
        className={classNames("vocabularyFolder", { open: this.state.open })}
      >
        <Accordion.Header onClick={(event) => this.handleClick(event)}>
          {getLabelOrBlank(
            CacheSearchVocabularies[this.props.scheme].labels,
            this.props.projectLanguage
          )}
        </Accordion.Header>
        <Accordion.Body>{this.props.children}</Accordion.Body>
      </Accordion.Item>
    );
  }
}
