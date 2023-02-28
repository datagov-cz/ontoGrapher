import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PreviewIcon from "@mui/icons-material/Preview";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar } from "@mui/material";
import { getVocabularyShortLabel } from "@opendata-mvcr/assembly-line-shared";
import classNames from "classnames";
import { Document, Id } from "flexsearch";
import * as _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Select, { MultiValue } from "react-select";
import { VocabularyBadge } from "../../components/VocabularyBadge";
import { Representation } from "../../config/Enum";
import { Locale } from "../../config/Locale";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { addDiagram } from "../../function/FunctionCreateVars";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import ModalRemoveDiagram from "../modal/ModalRemoveDiagram";
import DiagramPreview from "./DiagramPreview";

var md5 = require("md5");

type Props = {
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  update: Function;
};

type FlexDiagrams = {
  id: string;
  language: string;
  label: string;
};

const FlexDiagramSearch = new Document<FlexDiagrams>({
  worker: false,
  tokenize: "reverse",
  charset: "latin:advanced",
  document: {
    id: "id",
    tag: "language",
    index: ["label"],
  },
});

const addToSearch = (...ids: string[]) => {
  for (const id of ids) {
    FlexDiagramSearch.add({
      id: id,
      language: "a",
      label: Diagrams[id].name,
    });
  }
};

const removeFromSearch = (...ids: string[]) => {
  for (const id of ids) {
    FlexDiagramSearch.remove(id);
  }
};

export const DiagramManager: React.FC<Props> = (props: Props) => {
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [modalRemoveDiagram, setModalRemoveDiagram] = useState<boolean>(false);
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

  const [selectedDiagram, setSelectedDiagram] = useState<string>("");
  const [selectedDiagramName, setSelectedDiagramName] = useState<string>("");
  const [selectedDiagramDescription, setSelectedDiagramDescription] =
    useState<string>("");
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
    addToSearch(...Object.keys(Diagrams));
  }, []);

  useEffect(() => {
    const searchResults: Id[] = _.flatten(
      FlexDiagramSearch.search(search, {
        tag: "a",
      }).map((result) => result.result)
    );
    setDiagrams(
      searchResults
        .filter((diag) =>
          searchVocabs.length > 0
            ? _.intersection(
                Diagrams[diag].vocabularies,
                searchVocabs.map((input) => input.value)
              ).length > 0
            : true
        )
        .map((diag) => diag as string)
    );
  }, [search, searchVocabs]);

  const selectDiagram = (diag: string) => {
    setPreview(false);
    setSelectedDiagram(diag);
    setSelectedDiagramName(Diagrams[diag].name);
    setSelectedDiagramDescription(
      Diagrams[diag].description ? Diagrams[diag].description : ""
    );
    setInputVocabs(
      Diagrams[diag].vocabularies
        ? Diagrams[diag].vocabularies.map((v) => {
            return {
              label: getLabelOrBlank(
                WorkspaceVocabularies[v].labels,
                AppSettings.canvasLanguage
              ),
              value: v,
            };
          })
        : []
    );
  };

  return (
    <Container fluid className="diagramManager">
      <Row>
        <Col xs={6}>
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
                styles={{
                  multiValue: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor:
                      WorkspaceVocabularies[state.data.value].color,
                    borderRadius: "10px",
                  }),
                }}
                options={availableVocabs.map((vocab) => {
                  return {
                    value: vocab,
                    label: getLabelOrBlank(
                      WorkspaceVocabularies[vocab].labels,
                      props.projectLanguage
                    ),
                  };
                })}
                value={searchVocabs}
                placeholder={
                  Locale[AppSettings.interfaceLanguage]
                    .filterVocabulariesPlaceholder
                }
                onChange={(option) => setSearchVocabs(_.clone(option))}
              />
            </div>
            <div className="diagramList">
              {diagrams.map((diag, i) => (
                <div
                  onMouseEnter={() => setHoveredDiagram(diag)}
                  onMouseLeave={() => setHoveredDiagram("")}
                  onClick={() => selectDiagram(diag)}
                  className={classNames("diagramListItem", {
                    selected: diag === selectedDiagram,
                    hovered:
                      diag === hoveredDiagram && diag !== selectedDiagram,
                    top: i === 0,
                    middle: i > 0,
                  })}
                >
                  <div className="top">
                    <span className="left">
                      <span className="name">{Diagrams[diag].name}</span>
                      &nbsp;
                      <span className="vocabularies">
                        {Diagrams[diag].vocabularies?.map((v) => (
                          <VocabularyBadge
                            text={getVocabularyShortLabel(v).toLowerCase()}
                            color={WorkspaceVocabularies[v].color}
                            cancellable={false}
                          />
                        ))}
                      </span>
                    </span>
                    {(diag === selectedDiagram || diag === hoveredDiagram) && (
                      <span className="options">
                        &nbsp;
                        {!Diagrams[diag].active && (
                          <OverlayTrigger
                            placement={"bottom"}
                            overlay={
                              <Tooltip id={`tooltip`}>Otevřít diagram</Tooltip>
                            }
                          >
                            <Button
                              onClick={() => {
                                Diagrams[diag].active = true;
                                props.update();
                              }}
                              className="plainButton"
                              variant="secondary"
                            >
                              <OpenInNewIcon />
                            </Button>
                          </OverlayTrigger>
                        )}
                        {Diagrams[diag].active && (
                          <OverlayTrigger
                            placement={"bottom"}
                            overlay={
                              <Tooltip id={`tooltip`}>Zavřít diagram</Tooltip>
                            }
                          >
                            <Button
                              onClick={() => {
                                Diagrams[diag].active = false;
                                props.update();
                              }}
                              className="plainButton"
                              variant="secondary"
                            >
                              <CloseIcon />
                            </Button>
                          </OverlayTrigger>
                        )}
                        <OverlayTrigger
                          placement={"bottom"}
                          overlay={
                            <Tooltip id={`tooltip`}>Smazat diagram</Tooltip>
                          }
                        >
                          <Button
                            onClick={() => {
                              setSelectedDiagram(diag);
                              setModalRemoveDiagram(true);
                            }}
                            className="plainButton"
                            variant="secondary"
                          >
                            <DeleteIcon />
                          </Button>
                        </OverlayTrigger>
                      </span>
                    )}
                  </div>
                  <span className="description">
                    {Diagrams[diag].description}
                  </span>
                </div>
              ))}
              <div
                onMouseEnter={() => setHoveredDiagram("newDiagram")}
                onMouseLeave={() => setHoveredDiagram("")}
                onClick={() => {
                  const id = addDiagram(
                    Locale[AppSettings.interfaceLanguage].untitled,
                    true,
                    Representation.COMPACT
                  );
                  Object.keys(WorkspaceElements).forEach(
                    (elem) => (WorkspaceElements[elem].hidden[id] = true)
                  );
                  Object.keys(WorkspaceLinks).forEach(
                    (link) => (WorkspaceLinks[link].vertices[id] = [])
                  );
                  props.update();
                }}
                className={classNames("diagramListItem", "bottom", {
                  hovered: "newDiagram" === hoveredDiagram,
                })}
              >
                <div className="top">
                  <span className="left">
                    <span className="name">
                      <i>Vytvořit nový diagram</i>
                    </span>
                  </span>
                  <span className="options">
                    <AddIcon />
                  </span>
                </div>
              </div>
            </div>
          </Stack>
        </Col>
        <Col xs={6}>
          {selectedDiagram && (
            <Stack direction="vertical">
              <Card body className="diagramDetail">
                <Container>
                  <h3>{Diagrams[selectedDiagram].name}</h3>
                  <Card>
                    <div
                      className={classNames("detailCard", {
                        preview: preview,
                      })}
                    >
                      {preview && <DiagramPreview diagram={selectedDiagram} />}
                      {/* TODO: i18n */}
                      {!preview && (
                        <Button
                          className="setPreview"
                          onClick={() => setPreview(true)}
                        >
                          <PreviewIcon />
                          &nbsp;Zobrazit náhled
                        </Button>
                      )}
                    </div>
                  </Card>
                  <Row>
                    <Col className="infoRow">
                      <span className="left">Spolupracovali:</span>
                      <span className="right">
                        {Diagrams[selectedDiagram].collaborators
                          ? Diagrams[selectedDiagram].collaborators.map((c) => (
                              <Avatar
                                src={`https://www.gravatar.com/avatar/${md5(
                                  c
                                )}?d=identicon&s=200`}
                              />
                            ))
                          : "Není známo"}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="infoRow">
                      <span className="left">Datum vytvoření:</span>
                      <span className="right">
                        {Diagrams[selectedDiagram].creationDate
                          ? Diagrams[
                              selectedDiagram
                            ].creationDate.toLocaleDateString(
                              AppSettings.interfaceLanguage
                            )
                          : "Není známo"}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="infoRow">
                      <span className="left">Datum poslední změny:</span>
                      <span className="right">
                        {Diagrams[selectedDiagram].modifiedDate
                          ? Diagrams[
                              selectedDiagram
                            ].modifiedDate.toLocaleDateString(
                              AppSettings.interfaceLanguage
                            )
                          : "Není známo"}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Název</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Zde vpište název diagramu"
                          value={selectedDiagramName}
                          onChange={(event) =>
                            setSelectedDiagramName(event.currentTarget.value)
                          }
                        />
                        {/* <Form.Text className="text-muted red">
                  We'll never share your email with anyone else.
                </Form.Text> */}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Popis</Form.Label>
                        <Form.Control
                          as={"textarea"}
                          rows={2}
                          placeholder="Zde vpište popis diagramu"
                          value={selectedDiagramDescription}
                          onChange={(event) =>
                            setSelectedDiagramDescription(
                              event.currentTarget.value
                            )
                          }
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Slovníky</Form.Label>
                        <Select
                          isMulti
                          isSearchable
                          value={inputVocabs}
                          styles={{
                            multiValue: (baseStyles, state) => ({
                              ...baseStyles,
                              backgroundColor:
                                WorkspaceVocabularies[state.data.value].color,
                              borderRadius: "10px",
                            }),
                          }}
                          placeholder={
                            Locale[AppSettings.interfaceLanguage]
                              .filterVocabulariesPlaceholder
                          }
                          options={availableVocabs.map((vocab) => {
                            return {
                              value: vocab,
                              label: getLabelOrBlank(
                                WorkspaceVocabularies[vocab].labels,
                                props.projectLanguage
                              ),
                            };
                          })}
                          onChange={(option) => {
                            setInputVocabs(_.clone(option));
                            Diagrams[selectedDiagram].vocabularies = option.map(
                              (o) => o.value
                            );
                          }}
                        />
                        {/* TODO */}
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              </Card>
            </Stack>
          )}
        </Col>
      </Row>
      <ModalRemoveDiagram
        modal={modalRemoveDiagram}
        diagram={selectedDiagram}
        close={() => setModalRemoveDiagram(false)}
        update={() => {
          removeFromSearch(selectedDiagram);
          props.update();
          setSelectedDiagram("");
        }}
        performTransaction={props.performTransaction}
      />
    </Container>
  );
};
