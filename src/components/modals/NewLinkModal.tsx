import _ from "lodash";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Representation } from "../../config/Enum";
import { Locale } from "../../config/Locale";
import {
  AppSettings,
  Links,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import {
  getActiveSourceConnections,
  getExpressionByRepresentation,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getVocabularyFromScheme,
  isTermReadOnly,
} from "../../function/FunctionGetVars";
import { graph } from "../../graph/Graph";
import { LinkCreationConfiguration } from "./CreationModals";
import { NewElemForm } from "./NewElemForm";
import { filterEquivalent } from "../../function/FunctionEquivalents";

interface Props {
  modal: boolean;
  closeLink: Function;
  closeElem: Function;
  projectLanguage: string;
  configuration: LinkCreationConfiguration;
}

interface State {
  selectedLink: string;
  displayIncompatible: boolean;
  search: string;
  termName: { [key: string]: string };
  selectedVocabulary: string;
  errorText: string;
  existing: boolean;
  create: boolean;
}

export default class NewLinkModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      search: "",
      selectedLink: "",
      displayIncompatible: true,
      termName: initLanguageObject(""),
      selectedVocabulary: "",
      errorText: Locale[AppSettings.interfaceLanguage].modalNewElemError,
      existing: true,
      create: false,
    };
    this.handleChangeLink = this.handleChangeLink.bind(this);
  }

  handleChangeLink(value: string) {
    this.setState({ selectedLink: value });
  }

  getLinks() {
    const elem = graph
      .getElements()
      .find((elem) => elem.id === this.props.configuration.sourceID);
    if (elem && this.props.configuration.sourceID) {
      const connections = getActiveSourceConnections(
        this.props.configuration.sourceID
      );
      if (AppSettings.representation === Representation.FULL) {
        return Object.keys(Links)
          .filter(
            (link) =>
              !connections.find(
                (conn) =>
                  WorkspaceLinks[conn].iri === link &&
                  WorkspaceLinks[conn].target ===
                    this.props.configuration.targetID
              )
          )
          .sort();
      } else if (AppSettings.representation === Representation.COMPACT) {
        return Object.keys(WorkspaceTerms)
          .filter((iri) => {
            return (
              !isTermReadOnly(iri) &&
              getActiveSourceConnections(iri).length === 0 &&
              filterEquivalent(
                WorkspaceTerms[iri].types,
                parsePrefix("z-sgov-pojem", "typ-vztahu")
              )
            );
          })
          .concat(
            Object.keys(Links).filter(
              (link) =>
                Links[link].inScheme === AppSettings.ontographerContext + "/uml"
            )
          )
          .sort();
      } else return [];
    } else return [];
  }

  setLink(link: string) {
    if (link !== "") this.props.closeLink(link);
  }

  render() {
    let options = this.getLinks().sort();
    return (
      <Modal
        centered
        scrollable
        show={this.props.modal}
        onHide={() => this.props.closeLink}
        onEntering={() => {
          this.setState({
            selectedLink: options.length > 0 ? options[0] : "",
            selectedVocabulary: getVocabularyFromScheme(
              WorkspaceTerms[this.props.configuration.sourceID].inScheme
            ),
            termName: initLanguageObject(""),
          });
          const inputLink = document.getElementById("newLinkInputSelect");
          if (inputLink) inputLink.focus();
          const inputElem = document.getElementById(
            "newElemLabelInput" + this.props.projectLanguage
          );
          if (inputElem) inputElem.focus();
        }}
        keyboard
        onEscapeKeyDown={() => this.props.closeLink()}
      >
        <Modal.Header>
          <Modal.Title>
            {getExpressionByRepresentation({
              [Representation.FULL]: "modalNewLinkTitleLink",
              [Representation.COMPACT]: "modalNewLinkTitleRelationship",
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {AppSettings.representation === Representation.FULL && (
            <p>
              {getExpressionByRepresentation({
                [Representation.FULL]: "modalNewLinkDescriptionLink",
                [Representation.COMPACT]: "modalNewLinkDescriptionRelationship",
              })}
            </p>
          )}
          {AppSettings.representation === Representation.FULL ? (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                if (this.state.selectedLink !== "")
                  this.props.closeLink(this.state.selectedLink);
              }}
            >
              <Form.Control
                htmlSize={Object.keys(Links).length}
                as="select"
                value={this.state.selectedLink}
                onChange={(evt) =>
                  this.handleChangeLink(evt.currentTarget.value)
                }
                id={"newLinkInputSelect"}
              >
                {options.map((link) => (
                  <option
                    key={link}
                    onClick={() => this.setLink(link)}
                    value={link}
                  >
                    {getLabelOrBlank(
                      getLinkOrVocabElem(link).labels,
                      this.props.projectLanguage
                    )}
                  </option>
                ))}
              </Form.Control>
              <button style={{ display: "none" }} />
            </Form>
          ) : (
            <Form
              id={"createForm"}
              onSubmit={(event) => {
                event.preventDefault();
                if (this.state.errorText === "" && this.state.create) {
                  const names = _.mapValues(this.state.termName, (name) =>
                    name.trim()
                  );
                  this.props.closeElem(names, this.state.selectedVocabulary);
                }
              }}
            >
              <Form.Check
                label={Locale[AppSettings.interfaceLanguage].selectRelationship}
                type="radio"
                id={"radio-1"}
                value={1}
                checked={this.state.existing}
                onChange={() =>
                  this.setState({ existing: true, create: false })
                }
              />
              {this.state.existing && (
                <div>
                  <Form.Control
                    htmlSize={Object.keys(Links).length}
                    as="select"
                    value={this.state.selectedLink}
                    onChange={(evt) =>
                      this.handleChangeLink(evt.currentTarget.value)
                    }
                    id={"newLinkInputSelect"}
                  >
                    {options.map((link) => (
                      <option
                        key={link}
                        onClick={() => this.setLink(link)}
                        value={link}
                      >
                        {getLabelOrBlank(
                          getLinkOrVocabElem(link).labels,
                          this.props.projectLanguage
                        )}
                      </option>
                    ))}
                  </Form.Control>
                </div>
              )}
              <Form.Check
                value={2}
                label={
                  Locale[AppSettings.interfaceLanguage].createNewRelationship
                }
                type="radio"
                id={"radio-2"}
                checked={this.state.create}
                onChange={() =>
                  this.setState({ existing: false, create: true })
                }
              />
              {this.state.create && (
                <NewElemForm
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
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          {AppSettings.representation === Representation.COMPACT &&
            this.state.create && (
              <Button
                type={"submit"}
                form={"createForm"}
                disabled={!this.state.create || this.state.errorText !== ""}
                variant="primary"
              >
                {Locale[AppSettings.interfaceLanguage].confirm}
              </Button>
            )}
          <Button
            onClick={() => {
              this.props.closeLink();
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
