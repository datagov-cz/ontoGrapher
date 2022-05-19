import React, { useState } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { Instances, Patterns } from "../function/PatternTypes";
import { InstanceStructureModal } from "../modals/InstanceStructureModal";
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
              Detail šablony
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey={"0"}>
            <Card.Body>
              <h6>Autor</h6>
              {Patterns[Instances[props.id].iri].author}
              <h6>Datum vytvoření</h6>
              {new Date(
                Patterns[Instances[props.id].iri].date
              ).toLocaleString()}
              <h6>Popis</h6>
              <p>{Patterns[Instances[props.id].iri].description}</p>
              <Button onClick={() => setInternalViewModal(true)}>
                Pohled na vnitřní strukturu
              </Button>
              <Button
                onClick={() => {
                  StorePattern.update((s) => {
                    s.selectedPattern = Instances[props.id].iri;
                  });
                }}
              >
                Statistika užití šablony
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
