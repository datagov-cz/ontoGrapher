import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { deleteConcept } from "../../function/FunctionEditVars";
import {
  AppSettings,
  Diagrams,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { updateDeleteTriples } from "../../queries/update/UpdateMiscQueries";
import { getWorkspaceContextIRI } from "../../function/FunctionGetVars";
import { getCacheConnections } from "../../function/FunctionCache";
import { CacheConnection } from "../../types/CacheConnection";
import ConnectionCache from "../detail/components/connections/ConnectionCache";
import TableList from "../../components/TableList";
import { Representation } from "../../config/Enum";
import { removeFromFlexSearch } from "../../function/FunctionCreateVars";

interface Props {
  modal: boolean;
  id: string;
  close: Function;
  update: Function;
  performTransaction: (...queries: string[]) => void;
  projectLanguage: string;
}

interface State {
  shownLucene: CacheConnection[];
}

export default class ModalRemoveConcept extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      shownLucene: [],
    };
  }

  save() {
    removeFromFlexSearch(this.props.id);
    const writeGraphs = Object.keys(WorkspaceVocabularies)
      .filter((vocab) => !WorkspaceVocabularies[vocab].readOnly)
      .map((vocab) => WorkspaceVocabularies[vocab].graph);
    this.props.performTransaction(
      ...deleteConcept(this.props.id),
      updateDeleteTriples(
        this.props.id,
        [
          getWorkspaceContextIRI(),
          ...Object.values(Diagrams).map((diag) => diag.graph),
        ],
        true,
        false,
        false
      ),
      updateDeleteTriples(this.props.id, writeGraphs, true, true, true)
    );
  }

  getConnections() {
    getCacheConnections(this.props.id, Representation.FULL).then(
      (connections) =>
        this.setState({
          shownLucene: connections.filter(
            (conn) => conn.direction === "target"
          ),
        })
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
          this.getConnections();
        }}
      >
        <Modal.Header>
          <Modal.Title>
            {Locale[AppSettings.interfaceLanguage].modalRemoveConceptTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {
              Locale[AppSettings.interfaceLanguage]
                .modalRemoveConceptDescription
            }
          </p>
          {this.state.shownLucene.length > 0 && (
            <div>
              {
                Locale[AppSettings.interfaceLanguage]
                  .modalRemoveConceptConnectionsDescription
              }
              <div className={"deleteConnections"}>
                <TableList width={"400px"}>
                  {this.state.shownLucene.map((connection) => (
                    <ConnectionCache
                      key={`${connection.link}->${connection.target.iri}`}
                      connection={connection}
                      projectLanguage={this.props.projectLanguage}
                      elemID={this.props.id}
                      selected={false}
                      selection={[]}
                    />
                  ))}
                </TableList>
              </div>
            </div>
          )}
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
              {Locale[AppSettings.interfaceLanguage].confirm}
            </Button>
          </Form>
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
