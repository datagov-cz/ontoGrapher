import {
  AppSettings,
  Links,
  Prefixes,
  Stereotypes,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../config/Variables";
import { Locale } from "../../config/Locale";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import React from "react";
import { LinkType, Representation } from "../../config/Enum";
import { graph } from "../../graph/Graph";
import { Button, Form, Modal } from "react-bootstrap";
import {
  getActiveToConnections,
  getExpressionByRepresentation,
  getLabelOrBlank,
  getLinkOrVocabElem,
  getVocabularyFromScheme,
  isTermReadOnly,
} from "../../function/FunctionGetVars";
import { LinkCreationConfiguration } from "./CreationModals";
import { NewElemForm } from "./NewElemForm";
import _ from "lodash";

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
      displayIncompatible: false,
      termName: initLanguageObject(""),
      selectedVocabulary: "",
      errorText: Locale[AppSettings.interfaceLanguage].modalNewElemError,
      existing: true,
      create: false,
    };
    this.handleChangeLink = this.handleChangeLink.bind(this);
  }

  handleChangeLink(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedLink: event.currentTarget.value });
  }

  filtering(link: string): boolean {
    if (
      !this.props.configuration.sourceID ||
      !this.props.configuration.targetID
    )
      return false;
    if (
      getActiveToConnections(this.props.configuration.sourceID).find(
        (conn) =>
          WorkspaceLinks[conn].iri === link &&
          WorkspaceLinks[conn].target === this.props.configuration.targetID
      )
    )
      return false;
    if (Links[link].type === LinkType.GENERALIZATION)
      return (
        this.props.configuration.sourceID !== this.props.configuration.targetID
      );
    const sourceTypes = WorkspaceTerms[
      this.props.configuration.sourceID
    ].types.filter((type) => type.startsWith(Prefixes["z-sgov-pojem"]));
    const targetTypes = WorkspaceTerms[
      this.props.configuration.targetID
    ].types.filter((type) => type.startsWith(Prefixes["z-sgov-pojem"]));
    if (sourceTypes.length === 0 || targetTypes.length === 0) return false;
    const domain = Links[link].domain;
    const range = Links[link].range;
    let source = false;
    let target = false;

    for (const type of sourceTypes) {
      if (type in Stereotypes) {
        const subClasses = Stereotypes[type].subClassOf;
        const character = Stereotypes[type].character;
        if (character === domain || subClasses.includes(domain)) {
          source = true;
          break;
        }
      }
    }

    if (!source) return false;

    for (const type of targetTypes) {
      if (type in Stereotypes) {
        const subClasses = Stereotypes[type].subClassOf;
        const character = Stereotypes[type].character;
        if (character === range || subClasses.includes(range)) {
          target = true;
          break;
        }
      }
    }

    return target;
  }

  getLinks() {
    let elem = graph
      .getElements()
      .find((elem) => elem.id === this.props.configuration.sourceID);
    if (elem && this.props.configuration.sourceID) {
      const connections = getActiveToConnections(
        this.props.configuration.sourceID
      );
      if (AppSettings.representation === Representation.FULL) {
        return Object.keys(Links).filter(
          (link) =>
            !connections.find(
              (conn) =>
                WorkspaceLinks[conn].iri === link &&
                WorkspaceLinks[conn].target ===
                  this.props.configuration.targetID
            ) && (this.state.displayIncompatible ? true : this.filtering(link))
        );
      } else if (AppSettings.representation === Representation.COMPACT) {
        return Object.keys(WorkspaceTerms)
          .filter((iri) => {
            return (
              !isTermReadOnly(iri) &&
              getActiveToConnections(iri).length === 0 &&
              WorkspaceTerms[iri].types.includes(
                parsePrefix("z-sgov-pojem", "typ-vztahu")
              )
            );
          })
          .concat(
            Object.keys(Links).filter(
              (link) =>
                Links[link].inScheme === AppSettings.ontographerContext + "/uml"
            )
          );
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
          {AppSettings.representation === Representation.FULL && (
            <span>
              <input
                defaultChecked={this.state.displayIncompatible}
                onClick={(event: any) => {
                  this.setState({
                    displayIncompatible: event.currentTarget.checked,
                  });
                }}
                type="checkbox"
                id={"displayIncompatible"}
              />
              &nbsp;
              <label htmlFor={"displayIncompatible"}>
                {Locale[AppSettings.interfaceLanguage].showIncompatibleLinks}
              </label>
            </span>
          )}
          {AppSettings.representation === Representation.FULL ? (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                if (this.state.selectedLink !== "")
                  this.props.closeLink(this.state.selectedLink);
              }}
            >
              {/*<Form.Control*/}
              {/*  type="text"*/}
              {/*  value={this.state.search}*/}
              {/*  onChange={(event) =>*/}
              {/*    this.setState({ search: event.currentTarget.value })*/}
              {/*  }*/}
              {/*  id={"newLinkInputSearch"}*/}
              {/*/>*/}
              <Form.Control
                htmlSize={Object.keys(Links).length}
                as="select"
                value={this.state.selectedLink}
                onChange={this.handleChangeLink}
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
                  {/*<Form.Control*/}
                  {/*  type="text"*/}
                  {/*  placeholder={*/}
                  {/*    Locale[AppSettings.interfaceLanguage].searchStereotypes*/}
                  {/*  }*/}
                  {/*  value={this.state.search}*/}
                  {/*  onChange={(event) =>*/}
                  {/*    this.setState({ search: event.currentTarget.value })*/}
                  {/*  }*/}
                  {/*  id={"newLinkInputSearch"}*/}
                  {/*/>*/}
                  <Form.Control
                    htmlSize={Object.keys(Links).length}
                    as="select"
                    value={this.state.selectedLink}
                    onChange={this.handleChangeLink}
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
