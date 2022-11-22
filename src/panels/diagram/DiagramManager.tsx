import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import * as _ from "lodash";
import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Select, { MultiValue } from "react-select";
import { Locale } from "../../config/Locale";
import { AppSettings, Diagrams } from "../../config/Variables";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import DeleteIcon from "@mui/icons-material/Delete";
import classNames from "classnames";
import ModalRemoveDiagram from "../modal/ModalRemoveDiagram";
import { DiagramPreview } from "./DiagramPreview";
import { Avatar } from "@mui/material";
import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
type Props = {
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  update: Function;
};

export const DiagramManager: React.FC<Props> = (props: Props) => {
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [availableVocabs, setAvailableVocabs] = useState<string[]>([]);
  const [searchVocabs, setSearchVocabs] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);
  const [inputVocabs, setInputVocabs] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);

  const [modalRemoveDiagram, setModalRemoveDiagram] = useState<boolean>(false);
  const [selectedDiagram, setSelectedDiagram] = useState<string>("");
  const [hoveredDiagram, setHoveredDiagram] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  useEffect(() => {
    setDiagrams(Object.keys(Diagrams));
    setAvailableVocabs(
      _.compact(
        _.uniq(
          Object.keys(Diagrams).flatMap((diag) => Diagrams[diag].vocabularies)
        )
      )
    );
  }, []);

  const selectDiagram = (diag: string) => {
    setSelectedDiagram(diag);
  };

  return (
    <Container fluid className="diagramManager">
      <Row>
        <Col>
          <Stack direction="vertical">
            <div>
              <InputGroup>
                <InputGroup.Text id="inputGroupPrepend">
                  <SearchIcon />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  id={"searchInput"}
                  placeholder={
                    Locale[AppSettings.interfaceLanguage].searchStereotypes
                  }
                  aria-describedby="inputGroupPrepend"
                  value={search}
                  onChange={(evt) => setSearch(evt.currentTarget.value)}
                />
              </InputGroup>
              <Select
                isMulti
                isSearchable
                options={availableVocabs.map((vocab) => {
                  return {
                    value: vocab,
                    label: getLabelOrBlank(
                      CacheSearchVocabularies[vocab].labels,
                      props.projectLanguage
                    ),
                  };
                })}
                value={searchVocabs}
                onChange={(option) => setSearchVocabs(_.clone(option))}
              />
            </div>
            <br />
            <div className="diagramList">
              {diagrams.map((diag) => (
                <div
                  onMouseEnter={() => setHoveredDiagram(diag)}
                  onMouseLeave={() => setHoveredDiagram("")}
                  onClick={() => selectDiagram(diag)}
                  className={classNames("diagramListItem", {
                    selected: diag === selectedDiagram,
                    hovered: diag === hoveredDiagram,
                  })}
                >
                  <div>
                    <span className="name">{Diagrams[diag].name}</span>
                    <span className="vocabularies">
                      {/* {Diagrams[diag].vocabularies.map((v) => (
                        <Card text={getVocabularyShortLabel(v)} />
                      ))} */}
                    </span>
                    {(diag === selectedDiagram || diag === hoveredDiagram) && (
                      <span className="options">
                        {!Diagrams[diag].active && (
                          <Button className="plainButton" variant="secondary">
                            <OpenInNewIcon />
                          </Button>
                        )}
                        <Button className="plainButton" variant="secondary">
                          <DeleteIcon />
                        </Button>
                      </span>
                    )}
                  </div>
                  <span className="description">
                    {Diagrams[diag].description}
                  </span>
                </div>
              ))}
            </div>
          </Stack>
        </Col>
        <Col>
          {selectedDiagram && (
            <Stack direction="vertical">
              <Card body>
                <div className="detailCard">
                  {preview && <DiagramPreview diagram={selectedDiagram} />}
                  {/* TODO: i18n */}
                  {!preview && (
                    <span onClick={() => setPreview(true)}>
                      Klikněte pro zobrazení náhledu
                    </span>
                  )}
                </div>
                <Container>
                  <Row>
                    <Col>Spolupracovali:</Col>
                    {/* TODO: avatars, user management */}
                    <Col>
                      <span>
                        {/* {Diagrams[selectedDiagram].collaborators.map((c) => (
                        <Avatar
                          src={`https://www.gravatar.com/avatar/${md5(
                            c
                          )}?d=identicon&s=200`}
                        />
                      ))} */}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>Datum vytvoření:</Col>
                    <Col>
                      {/* {Diagrams[selectedDiagram].creationDate.toLocaleDateString(
                      AppSettings.interfaceLanguage
                    )} */}
                    </Col>
                  </Row>
                  <Row>
                    <Col>Datum poslední změny:</Col>
                    <Col>
                      {/* {Diagrams[selectedDiagram].modifiedDate.toLocaleDateString(
                      AppSettings.interfaceLanguage
                    )} */}
                    </Col>
                  </Row>
                </Container>
              </Card>
              <Form.Group>
                <Form.Label>Název</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Zde vpište název diagramu"
                />
                <Form.Text className="text-muted red">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Popis</Form.Label>
                <Form.Control
                  as={"textarea"}
                  rows={5}
                  placeholder="Zde vpište popis diagramu"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Slovníky</Form.Label>
                <Select
                  isMulti
                  isSearchable
                  value={inputVocabs}
                  options={availableVocabs.map((vocab) => {
                    return {
                      value: vocab,
                      label: getLabelOrBlank(
                        CacheSearchVocabularies[vocab].labels,
                        props.projectLanguage
                      ),
                    };
                  })}
                  onChange={(option) => setInputVocabs(_.clone(option))}
                />
                {/* TODO */}
              </Form.Group>
            </Stack>
          )}
        </Col>
      </Row>
      <ModalRemoveDiagram
        modal={modalRemoveDiagram}
        diagram={selectedDiagram}
        close={() => setModalRemoveDiagram(false)}
        update={() => props.update()}
        performTransaction={props.performTransaction}
      />
    </Container>
  );
};
