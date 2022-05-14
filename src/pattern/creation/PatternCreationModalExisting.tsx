import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import {
  formElementData,
  formRelationshipData,
  PatternViewColumn,
} from "./PatternViewColumn";
import { PatternCreationConfiguration } from "../../components/modals/CreationModals";
import { AppSettings } from "../../config/Variables";
import { Patterns } from "../function/PatternTypes";
import { callSuggestionAlgorithm } from "../function/PatternQueries";

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
  useEffect(() => setSearchResults(Object.keys(Patterns)), []);

  const suggestPatterns: () => Promise<string[]> = async () => {
    return await callSuggestionAlgorithm(AppSettings.selectedElements);
  };

  useEffect(() => {
    if (props.pattern) {
      setDetailPattern(props.pattern);
    }
  }, [props.pattern]);

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
    <Container style={{ minWidth: "95%" }}>
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
                      onClick={() => setDetailPattern(r)}
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
            pattern={detailPattern}
            initSubmit={props.initSubmit}
            submit={props.submit}
          />
        </Col>
      </Row>
    </Container>
  );
};
