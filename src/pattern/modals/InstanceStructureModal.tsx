import React from "react";
import { Button, Modal } from "react-bootstrap";
import { Instances, Patterns } from "../function/PatternTypes";
import { Locale, LocalePattern } from "../../config/Locale";
import { AppSettings } from "../../config/Variables";
import InstanceInternalView from "../structures/InstanceInternalView";

type Props = { open: boolean; close: Function; instanceID: string };

export const InstanceStructureModal: React.FC<Props> = (props: Props) => {
  return (
    <Modal centered size={"xl"}>
      <Modal.Header>
        <Modal.Title>{`${Patterns[Instances[props.instanceID].iri].title} ${
          LocalePattern[AppSettings.interfaceLanguage].structure
        }`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InstanceInternalView
          width={"100%"}
          height={"100%"}
          fitContent={true}
          terms={Object.values(Instances[props.instanceID].terms)}
          conns={Object.values(Instances[props.instanceID].conns)}
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
