import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Patterns } from "./PatternTypes";
import { AppSettings, WorkspaceVocabularies } from "../config/Variables";
import { callSuggestionAlgorithm } from "./PatternQueries";
import { PatternCreationConfiguration } from "../components/modals/CreationModals";
import {
  formElementData,
  formRelationshipData,
  PatternViewColumn,
} from "./PatternViewColumn";

type Props = {
  configuration: PatternCreationConfiguration;
  pattern: string;
  initSubmit: boolean;
  submit: (
    pattern: string,
    elements: { [key: string]: formElementData },
    connections: { [key: string]: formRelationshipData }
  ) => void;
};

export const PatternCreationModalExisting: React.FC<Props> = (props: Props) => {
  const [searchResults, setSearchResults] = useState<string[]>(
    Object.keys(Patterns)
  );
  const [filterName, setFilterName] = useState<string>("");
  const [filterAuthor, setFilterAuthor] = useState<string>("");
  const [filterSuggest, setFilterSuggest] = useState<boolean>(false);
  const [detailPattern, setDetailPattern] = useState<string>("");
  const [patternElementFormData, setPatternElementFormData] = useState<{
    [key: string]: formElementData;
  }>({});
  const [patternRelationshipFormData, setPatternRelationshipFormData] =
    useState<{ [key: string]: formRelationshipData }>({});

  useEffect(() => setSearchResults(Object.keys(Patterns)), []);

  const suggestPatterns: () => Promise<string[]> = async () => {
    return await callSuggestionAlgorithm(AppSettings.selectedElements);
  };

  useEffect(() => {
    if (props.initSubmit)
      props.submit(
        detailPattern,
        patternElementFormData,
        patternRelationshipFormData
      );
  }, [props.initSubmit]);

  useEffect(() => {
    if (props.pattern) {
      selectPattern(props.pattern);
    }
  }, [props.pattern]);

  const selectPattern = (pattern: string) => {
    const elementFormData: { [key: string]: formElementData } = {};
    for (const term in Patterns[pattern].terms) {
      elementFormData[term] = {
        ...Patterns[pattern].terms[term],
        iri: term,
        create: true,
        value: { value: "", label: "" },
        scheme: Object.keys(WorkspaceVocabularies).find(
          (vocab) => !WorkspaceVocabularies[vocab].readOnly
        )!,
        use: true,
      };
    }
    setPatternElementFormData(elementFormData);
    const relationshipFormData: { [key: string]: formRelationshipData } = {};
    for (const term in Patterns[pattern].conns) {
      relationshipFormData[term] = {
        ...Patterns[pattern].conns[term],
        create: true,
        scheme: Object.keys(WorkspaceVocabularies).find(
          (vocab) => !WorkspaceVocabularies[vocab].readOnly
        )!,
        iri: term,
      };
    }
    setPatternRelationshipFormData(relationshipFormData);
    setDetailPattern(pattern);
    updateResults();
  };

  const updateResults = () => {
    if (filterSuggest)
      suggestPatterns().then((results) =>
        setSearchResults(
          results.filter(
            (r) =>
              (filterName
                ? Patterns[r].title
                    .toLowerCase()
                    .includes(filterName.toLowerCase())
                : true) &&
              (filterAuthor
                ? Patterns[r].author
                    .toLowerCase()
                    .includes(filterAuthor.toLowerCase())
                : true)
          )
        )
      );
    else
      setSearchResults(
        Object.keys(Patterns).filter(
          (r) =>
            (filterName
              ? Patterns[r].title
                  .toLowerCase()
                  .includes(filterName.toLowerCase())
              : true) &&
            (filterAuthor
              ? Patterns[r].author
                  .toLowerCase()
                  .includes(filterAuthor.toLowerCase())
              : true)
        )
      );
  };

  useEffect(() => updateResults(), [filterName, filterAuthor, filterSuggest]);

  return (
    <Container>
      <Row>
        <Col>
          <div style={{ marginTop: "10px" }}>
            <Form.Control
              size={"sm"}
              type={"text"}
              placeholder={"Pattern title"}
              value={filterName}
              onChange={(event) => setFilterName(event.currentTarget.value)}
            />
            <Form.Control
              size={"sm"}
              type={"text"}
              placeholder={"Pattern author"}
              value={filterAuthor}
              onChange={(event) => setFilterAuthor(event.currentTarget.value)}
            />
            <Form.Check
              label="Suggest only patterns that conform to selection"
              checked={filterSuggest}
              onChange={(event) =>
                setFilterSuggest(event.currentTarget.checked)
              }
            />
          </div>
          <Table size={"sm"} borderless striped>
            <thead>
              <tr>
                <th>Pattern list</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((r) => (
                <tr>
                  <td>
                    <Button
                      className={"buttonlink"}
                      onClick={() => selectPattern(r)}
                    >
                      {Patterns[r].title}
                    </Button>
                  </td>
                </tr>
              ))}
              {searchResults.length === 0 && (
                <tr>
                  <td>No patterns found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
        <Col>
          <PatternViewColumn
            configuration={props.configuration}
            pattern={props.pattern}
            initSubmit={props.initSubmit}
            submit={props.submit}
          />
        </Col>
      </Row>
    </Container>
  );
};
