import React, { useState } from "react";
import { Button, Col, Container, Modal, Row, Table } from "react-bootstrap";
import { AppSettings, WorkspaceTerms } from "../../config/Variables";
import { Locale } from "../../config/Locale";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { Instances, Patterns } from "../function/PatternTypes";
import NewPatternInternalView from "../structures/NewPatternInternalView";
import * as _ from "lodash";

type Props = { open: boolean; close: Function; id: string };

export const PatternStatisticsModal: React.FC<Props> = (props: Props) => {
  const [selectPattern, setSelectPattern] = useState<string>("");

  return (
    <Modal
      centered
      scrollable
      show={props.open}
      size={"xl"}
      dialogClassName={"patternModal"}
      onEntering={() => {
        if (props.id) setSelectPattern(props.id);
      }}
    >
      <Modal.Header>
        <Modal.Title>Statistiky užití šablon</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container style={{ minWidth: "95%" }}>
          <Row>
            <Col>
              <Table size={"sm"} borderless striped>
                <thead>
                  <tr>
                    <th>Seznam šablon</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(Patterns).map((r) => (
                    <tr key={r}>
                      <td>
                        <Button
                          className={"buttonlink"}
                          onClick={() => setSelectPattern(r)}
                        >
                          {Patterns[r].title}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(Patterns).length === 0 && (
                    <tr>
                      <td>Nenalezeny žádné šablony</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
            <Col>
              {selectPattern && (
                <div>
                  <h6>Název</h6>
                  {Patterns[selectPattern].title}
                  <h6>Autor</h6>
                  {Patterns[selectPattern].author}
                  <h6>Datum vytvoření</h6>
                  {new Date(Patterns[selectPattern].date).toLocaleString()}
                  <h6>Popis</h6>
                  <p>{Patterns[selectPattern].description}</p>

                  <h6>Počet instancí v tomto pracovním prostoru</h6>
                  {
                    Object.keys(Instances).filter(
                      (instance) => Instances[instance].iri === selectPattern
                    ).length
                  }
                  <h6>Seznam instancí v tomto pracovním prostoru</h6>
                  <Table striped borderless>
                    <thead></thead>
                    <tbody>
                      {Object.entries(Instances)
                        .filter(
                          ([iri, _]) => Instances[iri].iri === selectPattern
                        )
                        .map(([iri, instance]) => (
                          <tr>
                            <td>
                              {_.flatten(Object.values(instance.terms))
                                .flatMap((arr) => arr)
                                .map((t) =>
                                  getLabelOrBlank(
                                    WorkspaceTerms[t].labels,
                                    AppSettings.canvasLanguage
                                  )
                                )
                                .join(", ")}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                  <h5>Vnitřní struktura šablony</h5>
                  <NewPatternInternalView
                    width={"100%"}
                    height={"500px"}
                    fitContent={true}
                    conns={Patterns[selectPattern].conns}
                    terms={Patterns[selectPattern].terms}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            props.close();
          }}
          variant="secondary"
        >
          {Locale[AppSettings.interfaceLanguage].cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
