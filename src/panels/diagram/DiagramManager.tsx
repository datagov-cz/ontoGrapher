import InfoIcon from "@mui/icons-material/Info";
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
import { useStoreState } from "pullstate";
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
import { StoreSettings } from "../../config/Store";
import {
  AppSettings,
  Diagrams,
  Users,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { addDiagram } from "../../function/FunctionCreateVars";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import ModalRemoveDiagram from "../modal/ModalRemoveDiagram";
import DiagramPreview from "./DiagramPreview";
import {
  updateCreateDiagram,
  updateDiagram,
  updateDiagramAssignments,
} from "../../queries/update/UpdateDiagramQueries";

type Props = {
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  update: Function;
  freeze: boolean;
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
  const state = useStoreState(StoreSettings);

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
  const initialize = () => {
    setDiagrams(Object.keys(Diagrams).filter((d) => !Diagrams[d].toBeDeleted));
    setAvailableVocabs(
      _.compact(
        _.uniq(
          Object.keys(Diagrams).flatMap((diag) => Diagrams[diag].vocabularies)
        )
      )
    );
    addToSearch(
      ...Object.keys(Diagrams).filter((d) => !Diagrams[d].toBeDeleted)
    );
  };

  useEffect(initialize, []);
  useEffect(initialize, [props.freeze]);

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

  useEffect(
    () => setSelectedDiagram(state.selectedDiagram),
    [state.selectedDiagram]
  );

  const selectDiagram = (diag: string, preview: boolean) => {
    setPreview(preview);
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

  const save = () => {
    Diagrams[selectedDiagram].name = selectedDiagramName;
    Diagrams[selectedDiagram].description = selectedDiagramDescription;
    Diagrams[selectedDiagram].modifiedDate = new Date();
    Diagrams[selectedDiagram].vocabularies = inputVocabs.map((i) => i.value);
    if (AppSettings.currentUser)
      Diagrams[selectedDiagram].collaborators = _.uniq([
        ...Diagrams[selectedDiagram].collaborators,
        AppSettings.currentUser,
      ]);
    props.performTransaction(
      updateDiagram(selectedDiagram),
      updateDiagramAssignments(selectedDiagram)
    );
    selectDiagram(selectedDiagram, preview);
  };

  const saveActive = (id: string) => {
    props.performTransaction(updateDiagram(id), updateDiagramAssignments(id));
  };

  return (
    <Container fluid className="diagramManager">
      <Row>
        <Col xs={6}>
          <Stack direction="vertical">
            <div>
              <InputGroup>
                <InputGroup.Text className="top-item" id="inputGroupPrepend">
                  <SearchIcon />
                </InputGroup.Text>
                <Form.Control
                  className="top-item"
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
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "0",
                  }),
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
                  key={diag}
                  onMouseEnter={() => setHoveredDiagram(diag)}
                  onMouseLeave={() => setHoveredDiagram("")}
                  onClick={() => selectDiagram(diag, false)}
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
                            key={v}
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
                              <Tooltip id={`tooltip`}>
                                {
                                  Locale[AppSettings.interfaceLanguage]
                                    .openDiagram
                                }
                              </Tooltip>
                            }
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                Diagrams[diag].active = true;
                                saveActive(diag);
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
                              <Tooltip id={`tooltip`}>
                                {
                                  Locale[AppSettings.interfaceLanguage]
                                    .closeDiagram
                                }
                              </Tooltip>
                            }
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                Diagrams[diag].active = false;
                                saveActive(diag);
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
                            <Tooltip id={`tooltip`}>
                              {
                                Locale[AppSettings.interfaceLanguage]
                                  .deleteDiagram
                              }
                            </Tooltip>
                          }
                        >
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
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
                  Diagrams[id].saved = true;
                  Object.keys(WorkspaceElements).forEach(
                    (elem) => (WorkspaceElements[elem].hidden[id] = true)
                  );
                  Object.keys(WorkspaceLinks).forEach(
                    (link) => (WorkspaceLinks[link].vertices[id] = [])
                  );
                  props.performTransaction(updateCreateDiagram(id));
                  props.update();
                  initialize();
                }}
                className={classNames("diagramListItem", "bottom", {
                  hovered: "newDiagram" === hoveredDiagram,
                })}
              >
                <div className="top">
                  <span className="left">
                    <span className="name">
                      <i>
                        {Locale[AppSettings.interfaceLanguage].createDiagram}
                      </i>
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
                      {!preview && (
                        <Button
                          className="setPreview"
                          onClick={() => setPreview(true)}
                        >
                          <PreviewIcon />
                          &nbsp;
                          {Locale[AppSettings.interfaceLanguage].showPreview}
                        </Button>
                      )}
                    </div>
                  </Card>
                  <Row>
                    <Col className="infoRow">
                      <span className="left">
                        {Locale[AppSettings.interfaceLanguage].collaborators}
                      </span>
                      <span className="right">
                        {Diagrams[selectedDiagram].collaborators
                          ? Diagrams[selectedDiagram].collaborators.map((c) => (
                              <Avatar
                                key={c}
                                className="avatar"
                                alt={
                                  c in Users
                                    ? `${Users[c].given_name} ${Users[c].family_name}`
                                    : ""
                                }
                              >
                                {c in Users
                                  ? Users[c].given_name.toUpperCase()[0] +
                                    Users[c].family_name.toUpperCase()[0]
                                  : ""}
                              </Avatar>
                            ))
                          : Locale[AppSettings.interfaceLanguage].unknown}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="infoRow">
                      <span className="left">
                        {Locale[AppSettings.interfaceLanguage].creationDate}
                      </span>
                      <span className="right">
                        {Diagrams[selectedDiagram].creationDate
                          ? Diagrams[
                              selectedDiagram
                            ].creationDate.toLocaleDateString(
                              AppSettings.interfaceLanguage
                            )
                          : Locale[AppSettings.interfaceLanguage].unknown}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="infoRow">
                      <span className="left">
                        {Locale[AppSettings.interfaceLanguage].lastModifiedDate}
                      </span>
                      <span className="right">
                        {Diagrams[selectedDiagram].modifiedDate
                          ? Diagrams[
                              selectedDiagram
                            ].modifiedDate.toLocaleDateString(
                              AppSettings.interfaceLanguage
                            )
                          : Locale[AppSettings.interfaceLanguage].unknown}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {Locale[AppSettings.interfaceLanguage].name}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedDiagramName}
                          onChange={(event) =>
                            setSelectedDiagramName(event.currentTarget.value)
                          }
                          onBlur={() => save()}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {Locale[AppSettings.interfaceLanguage].description}
                        </Form.Label>
                        <Form.Control
                          as={"textarea"}
                          rows={2}
                          value={selectedDiagramDescription}
                          onChange={(event) =>
                            setSelectedDiagramDescription(
                              event.currentTarget.value
                            )
                          }
                          onBlur={() => save()}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {Locale[AppSettings.interfaceLanguage].vocabularies}
                          &nbsp;
                          <OverlayTrigger
                            overlay={
                              <Tooltip>
                                {
                                  Locale[AppSettings.interfaceLanguage]
                                    .vocabularySelectInfo
                                }
                              </Tooltip>
                            }
                          >
                            <InfoIcon />
                          </OverlayTrigger>
                        </Form.Label>
                        <Select
                          isMulti
                          isSearchable
                          backspaceRemovesValue={false}
                          hideSelectedOptions={true}
                          isClearable={false}
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
                          options={availableVocabs.map((vocab) => ({
                            value: vocab,
                            label: getLabelOrBlank(
                              WorkspaceVocabularies[vocab].labels,
                              props.projectLanguage
                            ),
                          }))}
                          onChange={(option) => {
                            if (option.length === 0) return;
                            setInputVocabs(_.clone(option));
                            Diagrams[selectedDiagram].vocabularies = option.map(
                              (o) => o.value
                            );
                            save();
                          }}
                        />
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
          setSelectedDiagram("");
          props.update();
          initialize();
        }}
        performTransaction={props.performTransaction}
      />
    </Container>
  );
};
