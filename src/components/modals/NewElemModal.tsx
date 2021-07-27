import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  AppSettings,
  PackageRoot,
  WorkspaceVocabularies,
} from "../../config/Variables";
import _ from "lodash";
import { ElemCreationConfiguration } from "./CreationModals";
import { PackageNode } from "../../datatypes/PackageNode";
import { getVocabularyFromScheme } from "../../function/FunctionGetVars";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { Locale } from "../../config/Locale";
import { NewElemForm } from "./NewElemForm";

interface Props {
  modal: boolean;
  close: (names?: State["termName"], pkg?: PackageNode) => void;
  projectLanguage: string;
  configuration: ElemCreationConfiguration;
}

interface State {
  termName: { [key: string]: string };
  errorText: string;
  selectedPackage: PackageNode;
}

export default class NewElemModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const pkg = PackageRoot.children.find(
      (pkg) =>
        !WorkspaceVocabularies[getVocabularyFromScheme(pkg.scheme)].readOnly
    );
    if (!pkg) this.props.close();
    this.state = {
      termName: initLanguageObject(""),
      selectedPackage: pkg ? pkg : PackageRoot,
      errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
    };
    this.save = this.save.bind(this);
  }

  save() {
    if (this.state.errorText === "") {
      const names = _.mapValues(this.state.termName, (name) => name.trim());
      this.props.close(names, this.state.selectedPackage);
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
          if (this.state.selectedPackage === PackageRoot) {
            const pkg = PackageRoot.children.find(
              (pkg) =>
                !WorkspaceVocabularies[getVocabularyFromScheme(pkg.scheme)]
                  .readOnly
            );
            if (!pkg) this.props.close();
            else
              this.setState({
                termName: initLanguageObject(""),
                errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
                selectedPackage: pkg,
              });
          } else
            this.setState({
              termName: initLanguageObject(""),
              errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
            });
          const input = document.getElementById("newElemLabelInputcs");
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
              lockPackage={true}
              projectLanguage={this.props.projectLanguage}
              termName={this.state.termName}
              selectedPackage={this.state.selectedPackage}
              errorText={this.state.errorText}
              setTermName={(name, lang) =>
                this.setState((prevState) => ({
                  ...prevState,
                  termName: { ...prevState.termName, [lang]: name },
                }))
              }
              setSelectedPackage={(p) => this.setState({ selectedPackage: p })}
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
