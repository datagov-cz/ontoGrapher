import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  AppSettings,
  FolderRoot,
  WorkspaceVocabularies,
} from "../../config/Variables";
import _ from "lodash";
import { ElemCreationConfiguration } from "./CreationModals";
import { VocabularyNode } from "../../datatypes/VocabularyNode";
import { getVocabularyFromScheme } from "../../function/FunctionGetVars";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { Locale } from "../../config/Locale";
import { NewElemForm } from "./NewElemForm";

interface Props {
  modal: boolean;
  close: (names?: State["termName"], pkg?: VocabularyNode) => void;
  projectLanguage: string;
  configuration: ElemCreationConfiguration;
}

interface State {
  termName: { [key: string]: string };
  errorText: string;
  selectedVocabulary: VocabularyNode;
}

export default class NewElemModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const pkg = FolderRoot.children.find(
      (pkg) =>
        !WorkspaceVocabularies[getVocabularyFromScheme(pkg.scheme)].readOnly
    );
    if (!pkg) this.props.close();
    this.state = {
      termName: initLanguageObject(""),
      selectedVocabulary: pkg ? pkg : FolderRoot,
      errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
    };
    this.save = this.save.bind(this);
  }

  save() {
    if (this.state.errorText === "") {
      const names = _.mapValues(this.state.termName, (name) => name.trim());
      this.props.close(names, this.state.selectedVocabulary);
    }
  }

  render() {
    return (
      <Modal
        centered
        scrollable
        show={this.props.modal}
        keyboard={true}
        onEscapeKeyDown={() => this.props.close()}
        onHide={() => this.props.close}
        onEntering={() => {
          if (this.state.selectedVocabulary === FolderRoot) {
            const pkg = FolderRoot.children.find(
              (pkg) =>
                !WorkspaceVocabularies[getVocabularyFromScheme(pkg.scheme)]
                  .readOnly
            );
            if (!pkg) this.props.close();
            else
              this.setState({
                termName: initLanguageObject(""),
                errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
                selectedVocabulary: pkg,
              });
          } else
            this.setState({
              termName: initLanguageObject(""),
              errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
            });
          const input = document.getElementById(
            "newElemLabelInput" + this.props.projectLanguage
          );
          if (input) input.focus();
        }}
      >
        <Modal.Header>
          <Modal.Title>{this.props.configuration.header}</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            if (this.state.errorText === "") this.save();
          }}
        >
          <Modal.Body>
            <NewElemForm
              lockVocabulary={this.props.configuration.pkg !== FolderRoot}
              projectLanguage={this.props.projectLanguage}
              termName={this.state.termName}
              selectedVocabulary={this.state.selectedVocabulary}
              errorText={this.state.errorText}
              setTermName={(name, lang) =>
                this.setState((prevState) => ({
                  ...prevState,
                  termName: { ...prevState.termName, [lang]: name },
                }))
              }
              setSelectedVocabulary={(p) =>
                this.setState({ selectedVocabulary: p })
              }
              setErrorText={(s) => this.setState({ errorText: s })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type={"submit"}
              disabled={this.state.errorText !== ""}
              variant="primary"
            >
              {Locale[AppSettings.viewLanguage].confirm}
            </Button>
            <Button
              onClick={() => {
                this.props.close();
              }}
              variant="secondary"
            >
              {Locale[AppSettings.viewLanguage].cancel}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}
