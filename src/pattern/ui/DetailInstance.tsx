import React, { useState } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { Instances, Patterns } from "../function/PatternTypes";
import { InstanceStructureModal } from "../modals/InstanceStructureModal";
import { AppSettings } from "../../config/Variables";
import { LocalePattern } from "../../config/Locale";
import { StorePattern } from "../function/StorePattern";

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
                {LocalePattern[AppSettings.interfaceLanguage].viewStructure}
              </Button>
              <Button
                onClick={() => {
                  StorePattern.update((s) => {
                    s.selectedPattern = Instances[props.id].iri;
                  });
                }}
              >
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
