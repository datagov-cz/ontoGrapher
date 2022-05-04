import React, { useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { Locale } from "../config/Locale";
import {
  AppSettings,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { Patterns, PatternUsage } from "./PatternTypes";
import PatternInternalView from "./PatternInternalView";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";

type Props = { open: boolean; close: Function; id: string };

export const PatternStatisticsModal: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<typeof PatternUsage>({});
  const [selectPattern, setSelectPattern] = useState<string>("");
  const refresh = () => {
    setLoading(true);
    setLoading(false);
  };

  const select = (pattern: string) => {
    setSelectPattern(pattern);
  };

  return (
    <Modal
      centered
      size={"xl"}
      onEntering={() => {
        refresh();
        if (props.id) select(props.id);
      }}
    >
      <Modal.Header>
        <Modal.Title>Pattern usage statistics</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>
              <Table size={"sm"} bordered striped>
                {Object.keys(statistics).map((r) => (
                  <tr>
                    <td>
                      <Button
                        className={"buttonlink"}
                        onClick={() => select(r)}
                      >
                        {Patterns[r].title}
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            </Col>
            <Col>
              {selectPattern && (
                <div>
                  <h6>Title</h6>
                  {Patterns[selectPattern].title}
                  <h6>Author</h6>
                  {Patterns[selectPattern].author}
                  <h6>Creation date</h6>
                  {new Date(Patterns[selectPattern].date).toLocaleString()}
                  <h6>Description</h6>
                  <p>{Patterns[selectPattern].description}</p>

                  <h6>
                    Number of instances of this pattern in all vocabularies
                  </h6>
                  {statistics[selectPattern].length}
                  <h6>
                    Number of instances of this pattern in current vocabularies
                  </h6>
                  {
                    statistics[selectPattern].filter(
                      (u) => u.model === AppSettings.contextIRI
                    ).length
                  }
                  <h6>List of instances in current vocabularies</h6>
                  <Accordion>
                    {statistics[selectPattern].map((instance, i) => (
                      <Card>
                        <Card.Header>
                          <Accordion.Toggle
                            as={Button}
                            variant={"link"}
                            eventKey={i.toString(10)}
                          >
                            {instance.instance.terms
                              .map((t) => (
                                <span
                                  style={{
                                    backgroundColor:
                                      WorkspaceVocabularies[
                                        getVocabularyFromScheme(
                                          WorkspaceTerms[t].inScheme
                                        )
                                      ].color,
                                  }}
                                >
                                  {getLabelOrBlank(
                                    WorkspaceTerms[t].labels,
                                    AppSettings.canvasLanguage
                                  )}
                                </span>
                              ))
                              .join(", ")}
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey={i.toString(10)}>
                          <Card.Body></Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    ))}
                  </Accordion>
                  <PatternInternalView
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
        <Button onClick={() => refresh()} disabled={loading} variant="primary">
          {Locale[AppSettings.interfaceLanguage].validationReload}
        </Button>
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
