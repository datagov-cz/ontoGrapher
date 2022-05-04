import React from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import _ from "lodash";
import { ElemCreationConfiguration } from "./CreationModals";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { Locale } from "../../config/Locale";
import { NewElemForm } from "./NewElemForm";

interface Props {
  modal: boolean;
  close: (names?: State["termName"], vocabulary?: string) => void;
  projectLanguage: string;
  configuration: ElemCreationConfiguration;
}

interface State {
  termName: { [key: string]: string };
  errorText: string;
  selectedVocabulary: string;
  size: undefined | "xl";
}

export default class NewElemModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const vocab = Object.keys(WorkspaceVocabularies).find(
      (vocab) => !WorkspaceVocabularies[vocab].readOnly
    );
    if (!vocab) this.props.close();
    this.state = {
      termName: initLanguageObject(""),
      selectedVocabulary: vocab ? vocab : "",
      errorText: Locale[AppSettings.interfaceLanguage].modalNewElemError,
      size: undefined,
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
        size={this.state.size}
        show={this.props.modal}
        keyboard={true}
        onEscapeKeyDown={() => this.props.close()}
        onHide={() => this.props.close}
        onEntering={() => {
          if (!this.state.selectedVocabulary) {
            const vocab = Object.keys(WorkspaceVocabularies).find(
              (vocab) => !WorkspaceVocabularies[vocab].readOnly
            );
            if (!vocab) this.props.close();
            else
              this.setState({
                termName: initLanguageObject(""),
                errorText:
                  Locale[AppSettings.interfaceLanguage].modalNewElemError,
                selectedVocabulary: vocab,
              });
          } else
            this.setState({
              termName: initLanguageObject(""),
              errorText:
                Locale[AppSettings.interfaceLanguage].modalNewElemError,
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
        <Modal.Body>
          <Tabs
            id={"elem-or-pattern-tabs"}
            defaultActiveKey={"0"}
            onSelect={(eventKey) =>
              this.setState({ size: eventKey === "0" ? undefined : "xl" })
            }
          >
            <Tab eventKey={"0"} title={this.props.configuration.header}>
              {this.state.selectedVocabulary && (
                <NewElemForm
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
              )}
            </Tab>
            {this.props.configuration.connections.length === 0 && (
              <Tab eventKey={"1"} title={"Create instance"}></Tab>
            )}
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type={"submit"}
            onClick={() => {
              if (this.state.errorText === "") this.save();
            }}
            disabled={this.state.errorText !== ""}
            variant="primary"
          >
            {Locale[AppSettings.interfaceLanguage].confirm}
          </Button>
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
