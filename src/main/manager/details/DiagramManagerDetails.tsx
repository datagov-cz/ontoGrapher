import { Avatar } from "@mui/material";
import Select, { MultiValue } from "react-select";
import classNames from "classnames";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  Col,
  Stack,
  Card,
  Container,
  Button,
  Row,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import PreviewIcon from "@mui/icons-material/Preview";
import InfoIcon from "@mui/icons-material/Info";
import {
  Diagrams,
  AppSettings,
  Users,
  WorkspaceVocabularies,
} from "../../../config/Variables";
import { getLabelOrBlank } from "../../../function/FunctionGetVars";
import DiagramPreview from "./DiagramPreview";
import {
  updateDiagram,
  updateDiagramAssignments,
} from "../../../queries/update/UpdateDiagramQueries";

interface Props {
  selectedDiagram: string;
  performTransaction: (...queries: string[]) => void;
  projectLanguage: string;
  availableVocabularies: string[];
}

export const DiagramManagerDetails: React.FC<Props> = (props: Props) => {
  const [preview, setPreview] = useState<boolean>(false);
  const [selectedDiagramName, setSelectedDiagramName] = useState<string>("");
  const [selectedDiagramDescription, setSelectedDiagramDescription] =
    useState<string>("");
  const [inputVocabs, setInputVocabs] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);

  const save = () => {
    Diagrams[props.selectedDiagram].name = selectedDiagramName;
    Diagrams[props.selectedDiagram].description = selectedDiagramDescription;
    Diagrams[props.selectedDiagram].modifiedDate = new Date();
    Diagrams[props.selectedDiagram].vocabularies = inputVocabs.map(
      (i) => i.value
    );
    if (AppSettings.currentUser)
      Diagrams[props.selectedDiagram].collaborators = _.uniq([
        ...Diagrams[props.selectedDiagram].collaborators,
        AppSettings.currentUser,
      ]);
    props.performTransaction(
      updateDiagram(props.selectedDiagram),
      updateDiagramAssignments(props.selectedDiagram)
    );
  };

  useEffect(() => {
    setPreview(false);
    setSelectedDiagramName(Diagrams[props.selectedDiagram].name);
    setSelectedDiagramDescription(
      Diagrams[props.selectedDiagram].description
        ? Diagrams[props.selectedDiagram].description
        : ""
    );
    setInputVocabs(
      Diagrams[props.selectedDiagram].vocabularies
        ? Diagrams[props.selectedDiagram].vocabularies.map((v) => {
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
  }, [props.selectedDiagram]);

  return (
    <Col xs={6}>
      {props.selectedDiagram && (
        <Stack direction="vertical">
          <Card body className="diagramDetail">
            <Container>
              <h3>{Diagrams[props.selectedDiagram].name}</h3>
              <Card>
                <div
                  className={classNames("detailCard", {
                    preview: preview,
                  })}
                >
                  {preview && (
                    <DiagramPreview diagram={props.selectedDiagram} />
                  )}
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
                    {Diagrams[props.selectedDiagram].collaborators
                      ? Diagrams[props.selectedDiagram].collaborators.map(
                          (c) => (
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
                          )
                        )
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
                    {Diagrams[props.selectedDiagram].creationDate
                      ? Diagrams[
                          props.selectedDiagram
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
                    {Diagrams[props.selectedDiagram].modifiedDate
                      ? Diagrams[
                          props.selectedDiagram
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
                        setSelectedDiagramDescription(event.currentTarget.value)
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
                      noOptionsMessage={() =>
                        Locale[AppSettings.interfaceLanguage].noOptions
                      }
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
                      options={props.availableVocabularies.map((vocab) => ({
                        value: vocab,
                        label: getLabelOrBlank(
                          WorkspaceVocabularies[vocab].labels,
                          props.projectLanguage
                        ),
                      }))}
                      onChange={(option) => {
                        if (option.length === 0) return;
                        setInputVocabs(_.clone(option));
                        Diagrams[props.selectedDiagram].vocabularies =
                          option.map((o) => o.value);
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
  );
};
