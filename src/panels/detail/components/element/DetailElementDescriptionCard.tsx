import React from "react";
import { Accordion } from "react-bootstrap";
import { Locale } from "../../../../config/Locale";
import { AppSettings } from "../../../../config/Variables";
import { DetailElementDescription } from "./DetailElementDescription";

type Props = {
  id: string;
  performTransaction: (...queries: string[]) => void;
  selectedLanguage: string;
  save: (id: string) => void;
  infoFunction?: (trope: string) => void;
};

export class DetailElementDescriptionCard extends React.Component<Props> {
  render() {
    return (
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          {Locale[AppSettings.interfaceLanguage].description}
        </Accordion.Header>
        <Accordion.Body>
          <DetailElementDescription
            id={this.props.id}
            performTransaction={this.props.performTransaction}
            selectedLanguage={this.props.selectedLanguage}
            save={this.props.save}
            infoFunction={this.props.infoFunction}
          />
        </Accordion.Body>
      </Accordion.Item>
    );
  }
}
