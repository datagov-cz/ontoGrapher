import React, { useState, useEffect } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { Container } from "react-bootstrap";
import { Diagrams } from "../../config/Variables";
import SearchIcon from "@mui/icons-material/Search";
import Select from "react-select";
import * as _ from "lodash";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";

type Props = {
  projectLanguage: string;
};

//TODO
export const DiagramManager: React.FC<Props> = (props: Props) => {
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [vocabs, setVocabs] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => setDiagrams(Object.keys(Diagrams)), []);
  return (
    <Container>
      <Row>
        <Col>
          <div>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text id="inputGroupPrepend">
                  <SearchIcon />
                </InputGroup.Text>
              </InputGroup.Prepend>
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
              options={_.uniq(
                diagrams.flatMap((diag) => Diagrams[diag].vocabularies)
              ).map((vocab) => {
                return {
                  value: vocab,
                  label: getLabelOrBlank(
                    CacheSearchVocabularies[vocab].labels,
                    props.projectLanguage
                  ),
                };
              })}
            />
          </div>
          <div></div>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
};
