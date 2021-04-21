import React from "react";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import { PackageNode } from "../datatypes/PackageNode";
import {
  AppSettings,
  Languages,
  PackageRoot,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { Locale } from "../config/Locale";
import { createNewElemIRI } from "../function/FunctionCreateVars";
import { initLanguageObject } from "../function/FunctionEditVars";
import _ from "lodash";
import { getVocabularyFromScheme } from "../function/FunctionGetVars";

interface Props {
  modal: boolean;
  close: (names?: State["conceptName"], pkg?: PackageNode) => void;
  projectLanguage: string;
}

interface State {
  conceptName: { [key: string]: string };
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
      conceptName: initLanguageObject(""),
      selectedPackage: pkg ? pkg : PackageRoot,
      errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
    };
    this.save = this.save.bind(this);
    this.checkExists = this.checkExists.bind(this);
  }

  checkExists(scheme: string, name: string): boolean {
    const newIRI = createNewElemIRI(scheme, name);
    return (
      Object.keys(WorkspaceTerms)
        .filter((iri) => WorkspaceTerms[iri].inScheme === scheme)
        .find(
          (iri) =>
            (iri === newIRI &&
              Object.keys(WorkspaceElements).find(
                (elem) =>
                  WorkspaceElements[elem].active &&
                  WorkspaceElements[elem].iri === iri
              )) ||
            Object.values(WorkspaceTerms[iri].labels).find(
              (label) =>
                label.trim().toLowerCase() === name.trim().toLowerCase()
            )
        ) !== undefined
    );
  }

  handleChangeInput(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    language: string
  ) {
    const names = this.state.conceptName;
    names[language] = event.currentTarget.value;
    this.setState({
      conceptName: names,
      errorText: this.checkNames(this.state.selectedPackage.scheme, names),
    });
  }

  checkNames(scheme: string, names: State["conceptName"]) {
    let errorText = "";
    if (names[AppSettings.defaultLanguage] === "") {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemError;
    } else if (
      Object.values(names).find((name) => this.checkExists(scheme, name))
    ) {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemExistsError;
    } else if (
      Object.values(names).find(
        (name) => name && (name.length < 2 || name.length > 150)
      )
    ) {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemLengthError;
    } else if (
      createNewElemIRI(scheme, names[AppSettings.defaultLanguage]) ===
      WorkspaceVocabularies[getVocabularyFromScheme(scheme)].namespace
    ) {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemCharacterError;
    }
    return errorText;
  }

  handleChangeSelect(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const pkg = PackageRoot.children.find(
      (pkg) =>
        pkg.labels[this.props.projectLanguage] === event.currentTarget.value
    );
    if (pkg)
      this.setState({
        selectedPackage: pkg,
        errorText: this.checkNames(pkg.scheme, this.state.conceptName),
      });
  }

  save() {
    if (this.state.errorText === "") {
      const names = _.mapValues(this.state.conceptName, (name) => name.trim());
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
                conceptName: initLanguageObject(""),
                errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
                selectedPackage: pkg,
              });
          } else
            this.setState({
              conceptName: initLanguageObject(""),
              errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
            });
          const input = document.getElementById("newElemLabelInputcs");
          if (input) input.focus();
        }}
      >
        <Modal.Header>
          <Modal.Title>
            {Locale[AppSettings.viewLanguage].modalNewElemTitle}
          </Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            if (this.state.errorText === "") this.save();
          }}
        >
          <Modal.Body>
            <p>{Locale[AppSettings.viewLanguage].modalNewElemDescription}</p>
            {Object.keys(Languages).map((lang) => (
              <div key={lang}>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text id={"inputGroupPrepend" + lang}>
                      {Languages[lang] +
                        (lang === AppSettings.defaultLanguage ? "*" : "")}
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    id={"newElemLabelInput" + lang}
                    type="text"
                    value={this.state.conceptName[lang]}
                    required={lang === AppSettings.defaultLanguage}
                    onChange={(event) => this.handleChangeInput(event, lang)}
                  />
                </InputGroup>
              </div>
            ))}
            <br />
            <Form.Group controlId="exampleForm.ControlSelect1">
              <Form.Label>
                {Locale[AppSettings.viewLanguage].selectPackage}
              </Form.Label>
              <Form.Control
                as="select"
                value={
                  this.state.selectedPackage.labels[this.props.projectLanguage]
                }
                onChange={(event) => this.handleChangeSelect(event)}
              >
                {PackageRoot.children
                  .filter(
                    (pkg) =>
                      !WorkspaceVocabularies[
                        getVocabularyFromScheme(pkg.scheme)
                      ].readOnly
                  )
                  .map((pkg, i) => (
                    <option
                      key={i}
                      value={pkg.labels[this.props.projectLanguage]}
                    >
                      {pkg.labels[this.props.projectLanguage]}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
            {!this.state.errorText && (
              <Alert variant={"primary"}>{`${
                Locale[AppSettings.viewLanguage].modalNewElemIRI
              }
					${createNewElemIRI(
            this.state.selectedPackage.scheme,
            this.state.conceptName[AppSettings.defaultLanguage]
          )}`}</Alert>
            )}
            {this.state.errorText && (
              <Alert variant="danger">{this.state.errorText}</Alert>
            )}
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
