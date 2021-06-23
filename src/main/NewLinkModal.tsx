import React from "react";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";
import {
  AppSettings,
  Languages,
  Links,
  PackageRoot,
  Prefixes,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";
import { graph } from "../graph/Graph";
import { initLanguageObject, parsePrefix } from "../function/FunctionEditVars";
import { LinkType, Representation } from "../config/Enum";
import { Locale } from "../config/Locale";
import { createNewElemIRI } from "../function/FunctionCreateVars";

interface Props {
  modal: boolean;
  close: Function;
  projectLanguage: string;
  sid: string | undefined;
  tid: string | undefined;
}

interface State {
  selectedLink: string;
  displayIncompatible: boolean;
  search: string;
  conceptName: { [key: string]: string };
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
      conceptName: initLanguageObject(""),
      errorText: Locale[AppSettings.viewLanguage].modalNewElemError,
      existing: true,
      create: false,
    };
    this.handleChangeLink = this.handleChangeLink.bind(this);
  }

  handleChangeLink(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedLink: event.currentTarget.value });
  }

  filtering(link: string): boolean {
    if (!this.props.sid || !this.props.tid) return false;
    if (Links[link].type === LinkType.GENERALIZATION)
      return this.props.sid !== this.props.tid;
    const sourceTypes = WorkspaceTerms[
      WorkspaceElements[this.props.sid].iri
    ].types.filter((type) => type.startsWith(Prefixes["z-sgov-pojem"]));
    const targetTypes = WorkspaceTerms[
      WorkspaceElements[this.props.tid].iri
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
    let elem = graph.getElements().find((elem) => elem.id === this.props.sid);
    if (elem && this.props.sid) {
      let conns = WorkspaceElements[this.props.sid].connections;
      if (AppSettings.representation === Representation.FULL) {
        return Object.keys(Links).filter(
          (link) =>
            !conns.find(
              (conn) =>
                WorkspaceLinks[conn].iri === link &&
                WorkspaceLinks[conn].target === this.props.tid &&
                WorkspaceLinks[conn].active
            ) && (this.state.displayIncompatible ? true : this.filtering(link))
        );
      } else if (AppSettings.representation === Representation.COMPACT) {
        return Object.keys(WorkspaceTerms)
          .filter(
            (link) =>
              !conns.find(
                (conn) =>
                  WorkspaceLinks[conn].iri === link &&
                  WorkspaceLinks[conn].target === this.props.tid &&
                  WorkspaceLinks[conn].active
              ) &&
              WorkspaceTerms[link].types.includes(
                parsePrefix("z-sgov-pojem", "typ-vztahu")
              )
          )
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
    if (link !== "") this.props.close(link);
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
    });
  }

  render() {
    let options = this.getLinks().sort();
    return (
      <Modal
        centered
        scrollable
        show={this.props.modal}
        onHide={() => this.props.close}
        onEntering={() => {
          this.setState({ selectedLink: options.length > 0 ? options[0] : "" });
          const input = document.getElementById("newLinkInputSelect");
          if (input) input.focus();
        }}
        keyboard
        onEscapeKeyDown={() => this.props.close()}
      >
        <Modal.Header>
          <Modal.Title>
            {Locale[AppSettings.viewLanguage].modalNewLinkTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {AppSettings.representation === Representation.FULL && (
            <p>{Locale[AppSettings.viewLanguage].modalNewLinkDescription}</p>
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
                {Locale[AppSettings.viewLanguage].showIncompatibleLinks}
              </label>
            </span>
          )}
          {/*<br />*/}
          {AppSettings.representation === Representation.FULL ? (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                if (this.state.selectedLink !== "")
                  this.props.close(this.state.selectedLink);
              }}
            >
              <Form.Control
                type="text"
                value={this.state.search}
                onChange={(event) =>
                  this.setState({ search: event.currentTarget.value })
                }
                id={"newLinkInputSearch"}
              />
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
              onSubmit={(event) => {
                event.preventDefault();
                if (this.state.selectedLink !== "")
                  this.props.close(this.state.selectedLink);
              }}
            >
              <Form.Check
                label="Vybrat z existujících typů vztahů"
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
                    type="text"
                    placeholder="Hledat..."
                    value={this.state.search}
                    onChange={(event) =>
                      this.setState({ search: event.currentTarget.value })
                    }
                    id={"newLinkInputSearch"}
                  />
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
                        ).concat(
                          link.startsWith(AppSettings.ontographerContext)
                            ? ""
                            : " ⭐"
                        )}
                      </option>
                    ))}
                  </Form.Control>
                </div>
              )}
              <Form.Check
                value={2}
                label="Vytvořit nový typ vztahu"
                type="radio"
                id={"radio-2"}
                checked={this.state.create}
                onChange={() =>
                  this.setState({ existing: false, create: true })
                }
              />
              {this.state.create && (
                <div>
                  <Form
                    onSubmit={(event) => {
                      event.preventDefault();
                      // if (this.state.errorText === "") this.save();
                    }}
                  >
                    {/*<Modal.Body>*/}
                    <p>
                      {Locale[AppSettings.viewLanguage].modalNewElemDescription}
                    </p>
                    {Object.keys(Languages).map((lang) => (
                      <div key={lang}>
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text id={"inputGroupPrepend" + lang}>
                              {Languages[lang] +
                                (lang === AppSettings.defaultLanguage
                                  ? "*"
                                  : "")}
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            id={"newElemLabelInput" + lang}
                            type="text"
                            value={this.state.conceptName[lang]}
                            required={lang === AppSettings.defaultLanguage}
                            onChange={(event) =>
                              this.handleChangeInput(event, lang)
                            }
                          />
                        </InputGroup>
                      </div>
                    ))}
                    <br />
                    {/*<Form.Group controlId="exampleForm.ControlSelect1">*/}
                    {/*  <Form.Label>*/}
                    {/*    {Locale[AppSettings.viewLanguage].selectPackage}*/}
                    {/*  </Form.Label>*/}
                    {/*  <Form.Control*/}
                    {/*    as="select"*/}
                    {/*    value={*/}
                    {/*      this.state.selectedPackage.labels[*/}
                    {/*        this.props.projectLanguage*/}
                    {/*      ]*/}
                    {/*    }*/}
                    {/*    onChange={(event) => this.handleChangeSelect(event)}*/}
                    {/*  >*/}
                    {/*    {PackageRoot.children*/}
                    {/*      .filter(*/}
                    {/*        (pkg) =>*/}
                    {/*          !WorkspaceVocabularies[*/}
                    {/*            getVocabularyFromScheme(pkg.scheme)*/}
                    {/*          ].readOnly*/}
                    {/*      )*/}
                    {/*      .map((pkg, i) => (*/}
                    {/*        <option*/}
                    {/*          key={i}*/}
                    {/*          value={pkg.labels[this.props.projectLanguage]}*/}
                    {/*        >*/}
                    {/*          {pkg.labels[this.props.projectLanguage]}*/}
                    {/*        </option>*/}
                    {/*      ))}*/}
                    {/*  </Form.Control>*/}
                    {/*</Form.Group>*/}
                    {/*{!this.state.errorText && (*/}
                    {/*  <Alert variant={"primary"}>{`${*/}
                    {/*    Locale[AppSettings.viewLanguage].modalNewElemIRI*/}
                    {/*  }*/}
                    {/*${createNewElemIRI(*/}
                    {/*  this.state.selectedPackage.scheme,*/}
                    {/*  this.state.conceptName[AppSettings.defaultLanguage]*/}
                    {/*)}`}</Alert>*/}
                    {/*        )}*/}
                    {this.state.errorText && (
                      <Alert variant="danger">{this.state.errorText}</Alert>
                    )}
                    {/*      </Modal.Body>*/}
                    {/*      <Modal.Footer>*/}
                    {/*        <Button*/}
                    {/*          type={"submit"}*/}
                    {/*          disabled={this.state.errorText !== ""}*/}
                    {/*          variant="primary"*/}
                    {/*        >*/}
                    {/*          {Locale[AppSettings.viewLanguage].confirm}*/}
                    {/*        </Button>*/}
                    {/*        <Button*/}
                    {/*          onClick={() => {*/}
                    {/*            this.props.close();*/}
                    {/*          }}*/}
                    {/*          variant="secondary"*/}
                    {/*        >*/}
                    {/*          {Locale[AppSettings.viewLanguage].cancel}*/}
                    {/*        </Button>*/}
                    {/*      </Modal.Footer>*/}
                  </Form>
                </div>
              )}
              <button style={{ display: "none" }} />
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
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
