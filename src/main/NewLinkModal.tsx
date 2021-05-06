import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  AppSettings,
  Links,
  Prefixes,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import {
  getLabelOrBlank,
  getLinkOrVocabElem,
} from "../function/FunctionGetVars";
import { graph } from "../graph/Graph";
import { parsePrefix } from "../function/FunctionEditVars";
import { LinkType, Representation } from "../config/Enum";
import { Locale } from "../config/Locale";

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
}

export default class NewLinkModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedLink: "",
      displayIncompatible: false,
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
          <p>{Locale[AppSettings.viewLanguage].modalNewLinkDescription}</p>
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
          <br />
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              if (this.state.selectedLink !== "")
                this.props.close(this.state.selectedLink);
            }}
          >
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
