import React, { useState } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { Instances, Patterns } from "./PatternTypes";
import { InstanceStructureModal } from "./InstanceStructureModal";
import { LocalePattern } from "../config/Locale";
import { AppSettings } from "../config/Variables";

type Props = {
  id: string;
};

export const DetailInstance: React.FC<Props> = (props: Props) => {
  const [internalViewModal, setInternalViewModal] = useState<boolean>(false);
  return (
    <div className={"accordions"}>
      <Accordion defaultActiveKey={"0"}>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
              {LocalePattern[AppSettings.interfaceLanguage].patternDetails}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"0"}>
            <Card.Body>
              <h6>{LocalePattern[AppSettings.interfaceLanguage].title}</h6>
              {Patterns[Instances[props.id].iri].title}
              <h6>{LocalePattern[AppSettings.interfaceLanguage].author}</h6>
              {Patterns[Instances[props.id].iri].author}
              <h6>
                {LocalePattern[AppSettings.interfaceLanguage].creationDate}
              </h6>
              {new Date(
                Patterns[Instances[props.id].iri].date
              ).toLocaleString()}
              <h6>
                {LocalePattern[AppSettings.interfaceLanguage].description}
              </h6>
              <p>{Patterns[Instances[props.id].iri].description}</p>
              <Button onClick={() => setInternalViewModal(true)}>
                {LocalePattern[AppSettings.interfaceLanguage].viewStatistics}
              </Button>
              <Button onClick={() => setInternalViewModal(true)}>
                {LocalePattern[AppSettings.interfaceLanguage].viewStatistics}
              </Button>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
      <InstanceStructureModal
        open={internalViewModal}
        close={() => setInternalViewModal(false)}
        instanceID={props.id}
      />
    </div>
  );
};
