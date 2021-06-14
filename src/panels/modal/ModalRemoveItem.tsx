import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { deletePackageItem } from "../../function/FunctionEditVars";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { updateDeleteTriples } from "../../queries/update/UpdateMiscQueries";
import {
  getVocabularyFromScheme,
  getWorkspaceContextIRI,
} from "../../function/FunctionGetVars";

interface Props {
  modal: boolean;
  id: string;
  close: Function;
  update: Function;
  performTransaction: (...queries: string[]) => void;
}

interface State {}

export default class ModalRemoveItem extends React.Component<Props, State> {
  save() {
    this.props.performTransaction(
      ...deletePackageItem(this.props.id),
      updateDeleteTriples(
        WorkspaceElements[this.props.id].iri,
        getWorkspaceContextIRI(),
        true,
        false,
        false
      ),
      updateDeleteTriples(
        WorkspaceElements[this.props.id].iri,
        WorkspaceVocabularies[
          getVocabularyFromScheme(
            WorkspaceTerms[WorkspaceElements[this.props.id].iri].inScheme
          )
        ].graph,
        true,
        true,
        true
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
            {Locale[AppSettings.viewLanguage].modalRemovePackageItemTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {Locale[AppSettings.viewLanguage].modalRemovePackageItemDescription}
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
