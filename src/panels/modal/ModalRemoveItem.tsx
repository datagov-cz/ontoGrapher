import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { deletePackageItem } from "../../function/FunctionEditVars";
import {
  AppSettings,
  WorkspaceElements,
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

export default class ModalRemoveItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      shownLucene: [],
    };
  }

  save() {
    const writeGraphs = Object.keys(WorkspaceVocabularies)
      .filter((vocab) => !WorkspaceVocabularies[vocab].readOnly)
      .map((vocab) => WorkspaceVocabularies[vocab].graph);
    this.props.performTransaction(
      ...deletePackageItem(this.props.id),
      updateDeleteTriples(
        WorkspaceElements[this.props.id].iri,
        [getWorkspaceContextIRI()],
        true,
        false,
        false
      ),
      updateDeleteTriples(
        WorkspaceElements[this.props.id].iri,
        writeGraphs,
        true,
        true,
        true
      )
    );
  }

  getConnections() {
    getCacheConnections(
      WorkspaceElements[this.props.id].iri,
      Representation.FULL
    ).then((connections) =>
      this.setState({
        shownLucene: connections.filter((conn) => conn.direction === "target"),
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
            {Locale[AppSettings.viewLanguage].modalRemovePackageItemTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {Locale[AppSettings.viewLanguage].modalRemovePackageItemDescription}
          </p>
          {this.state.shownLucene.length > 0 && (
            <div>
              {
                Locale[AppSettings.viewLanguage]
                  .modalRemovePackageItemConnectionsDescription
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
