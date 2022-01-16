import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  changeVocabularyCount,
  deleteConcept,
} from "../../function/FunctionEditVars";
import { AppSettings, Diagrams, WorkspaceTerms } from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { updateDeleteTriples } from "../../queries/update/UpdateMiscQueries";
import {
  getVocabularyFromScheme,
  getWorkspaceContextIRI,
} from "../../function/FunctionGetVars";
import { removeFromFlexSearch } from "../../function/FunctionCreateVars";

interface Props {
  modal: boolean;
  id: string;
  close: Function;
  update: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {}

export default class ModalRemoveReadOnlyConcept extends React.Component<
  Props,
  State
> {
  save() {
    removeFromFlexSearch(this.props.id);
    const vocabulary = getVocabularyFromScheme(
      WorkspaceTerms[this.props.id].inScheme
    );
    changeVocabularyCount(vocabulary, (count) => count - 1, this.props.id);
    this.props.performTransaction(
      ...deleteConcept(this.props.id),
      updateDeleteTriples(
        this.props.id,
        [
          getWorkspaceContextIRI(),
          ...Object.values(Diagrams).map((diag) => diag.graph),
        ],
        true,
        true,
        false
      )
    );
  }

  render() {
    return (
      <Modal
        centered
        show={this.props.modal}
        keyboard
        onEscapeKeyDown={() => this.props.close()}
        onEntering={() => {
          const elem = document.getElementById("modalRemoveItemConfirm");
          if (elem) elem.focus();
        }}
      >
        <Modal.Header>
          <Modal.Title>
            {Locale[AppSettings.interfaceLanguage].modalRemoveConceptTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {
              Locale[AppSettings.interfaceLanguage]
                .modalRemoveReadOnlyConceptDescription
            }
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              this.save();
              this.props.close();
              this.props.update();
            }}
          >
            <Button type={"submit"} id={"modalRemoveItemConfirm"}>
              {Locale[AppSettings.interfaceLanguage].confirm}
            </Button>
          </Form>
          <Button
            onClick={() => {
              this.props.close();
            }}
            variant="secondary"
          >
            {Locale[AppSettings.interfaceLanguage].cancel}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
