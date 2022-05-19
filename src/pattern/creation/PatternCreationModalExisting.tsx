import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import {
  formElementData,
  formRelationshipData,
  PatternViewColumn,
} from "./PatternViewColumn";
import { PatternCreationConfiguration } from "../../components/modals/CreationModals";
import { Patterns } from "../function/PatternTypes";
import { WorkspaceTerms } from "../../config/Variables";
import * as _ from "lodash";

type Props = {
  configuration: PatternCreationConfiguration;
  pattern: string;
  initSubmit: boolean;
  submit: (
    pattern: string,
    elements: { [key: string]: formElementData },
    connections: { [key: string]: formRelationshipData }
  ) => void;
  validate: (val: boolean) => void;
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

  useEffect(() => {
    if (props.pattern) {
      setDetailPattern(props.pattern);
    }
  }, [props.pattern]);

  useEffect(() => {
    if (filterSuggest) {
      const patterns: string[] = [];
      const types: { [key: string]: string[] } = {};
      for (const elem of props.configuration.elements) {
        types[elem] = WorkspaceTerms[elem].types;
      }
      for (const [id, pattern] of Object.entries(Patterns)) {
        const found: string[] = [];
        for (const term in pattern.terms) {
          for (const elem of props.configuration.elements) {
            if (
              _.intersection(pattern.terms[term].types, types[elem]).length !==
                0 &&
              !found.includes(elem)
            ) {
              found.push(elem);
            }
          }
        }
        if (found.length === props.configuration.elements.length) {
          patterns.push(id);
        }
      }
      setSearchResults(
        patterns.filter(
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
    } else
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
  }, [filterName, filterAuthor, filterSuggest, props.configuration.elements]);

  return (
    <Container style={{ minWidth: "95%" }}>
      <Row>
        <Col>
          <div style={{ marginTop: "10px" }}>
            <Form.Control
              size={"sm"}
              type={"text"}
              placeholder={"Název"}
              value={filterName}
              onChange={(event) => setFilterName(event.currentTarget.value)}
            />
            <Form.Control
              size={"sm"}
              type={"text"}
              placeholder={"Autor"}
              value={filterAuthor}
              onChange={(event) => setFilterAuthor(event.currentTarget.value)}
            />
            <Form.Check
              label="Omezit na šablony, kterými lze vyplnit vybrané pojmy"
              checked={filterSuggest}
              onChange={(event) =>
                setFilterSuggest(event.currentTarget.checked)
              }
            />
          </div>
          <Table size={"sm"} borderless striped>
            <thead>
              <tr>
                <th>Seznam šablon</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((r) => (
                <tr key={r}>
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
            submit={(pattern, elements, connections) =>
              props.submit(pattern, elements, connections)
            }
            validate={props.validate}
          />
        </Col>
      </Row>
    </Container>
  );
};
