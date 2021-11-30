import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  changeVocabularyCount,
  deleteConcept,
} from "../../function/FunctionEditVars";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
} from "../../config/Variables";
import { Locale } from "../../config/Locale";
import {
  updateDeleteTriples,
  updateRemoveTermsFromWorkspace,
} from "../../queries/update/UpdateMiscQueries";
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
      WorkspaceTerms[WorkspaceElements[this.props.id].iri].inScheme
    );
    changeVocabularyCount(
      vocabulary,
      (count) => count - 1,
      WorkspaceElements[this.props.id].iri
    );
    this.props.performTransaction(
      ...deleteConcept(this.props.id),
      updateDeleteTriples(
        WorkspaceElements[this.props.id].iri + "/diagram",
        [getWorkspaceContextIRI()],
        true,
        false,
        false
      ),
      updateDeleteTriples(
        WorkspaceElements[this.props.id].iri,
        [getWorkspaceContextIRI()],
        true,
        true,
        true
      ),
      updateRemoveTermsFromWorkspace([this.props.id])
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
            {Locale[AppSettings.viewLanguage].modalRemoveConceptTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {
              Locale[AppSettings.viewLanguage]
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
              {Locale[AppSettings.viewLanguage].confirm}
            </Button>
          </Form>
          <Button
            onClick={() => {
              this.props.close();
            }}
            variant="secondary"
          >
            {Locale[AppSettings.viewLanguage].cancel}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
