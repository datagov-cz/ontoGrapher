import React from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import TableList from "../../components/TableList";
import { Representation } from "../../config/Enum";
import { Locale } from "../../config/Locale";
import { AppSettings } from "../../config/Variables";
import { getCacheConnections } from "../../function/FunctionCache";
import { removeElement } from "../../function/FunctionElem";
import { CacheConnection } from "../../types/CacheConnection";
import ConnectionCache from "../detail/components/connections/ConnectionCache";

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
  buttonDisabled: boolean;
}

export default class ModalRemoveTerm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      shownLucene: [],
      buttonDisabled: true,
    };
  }

  save() {
    this.props.performTransaction(...removeElement(this.props.id));
  }

  getConnections() {
    getCacheConnections(this.props.id, Representation.FULL)
      .then((connections) =>
        this.setState({
          shownLucene: connections.filter(
            (conn) => conn.direction === "target"
          ),
        })
      )
      .finally(() => this.setState({ buttonDisabled: false }));
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
                      performTransaction={this.props.performTransaction}
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
            <Button
              type={"submit"}
              id={"modalRemoveItemConfirm"}
              disabled={this.state.buttonDisabled}
            >
              {Locale[AppSettings.interfaceLanguage].confirm}
              {this.state.buttonDisabled && (
                <span>
                  &nbsp;
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                </span>
              )}
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
