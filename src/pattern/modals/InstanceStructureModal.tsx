import React from "react";
import { Button, Modal } from "react-bootstrap";
import { Instances, Patterns } from "../function/PatternTypes";
import { Locale } from "../../config/Locale";
import { AppSettings } from "../../config/Variables";
import InstanceInternalView from "../structures/InstanceInternalView";
import * as _ from "lodash";

type Props = { open: boolean; close: Function; instanceID: string };

export const InstanceStructureModal: React.FC<Props> = (props: Props) => {
  return (
    <Modal show={props.open} centered size={"xl"}>
      <Modal.Header>
        <Modal.Title>{`Vnitřní struktura šablony ${
          Patterns[Instances[props.instanceID].iri].title
        }`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InstanceInternalView
          width={"100%"}
          height={"500px"}
          fitContent={true}
          terms={_.flatten(Object.values(Instances[props.instanceID].terms))}
          conns={_.flatten(Object.values(Instances[props.instanceID].conns))}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            props.close();
          }}
          variant="secondary"
        >
          {Locale[AppSettings.interfaceLanguage].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};