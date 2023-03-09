import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Col, Stack } from "react-bootstrap";
import { MultiValue } from "react-select";
import { Diagrams } from "../../../config/Variables";
import { DiagramManagerDiagrams } from "./DiagramManagerDiagrams";
import { DiagramManagerSearch } from "./DiagramManagerSearch";

interface Props {
  freeze: boolean;
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  update: () => void;
  selectDiagram: (diagram: string) => void;
  availableVocabularies: string[];
  selectedDiagram: string;
}

export const DiagramManagerList: React.FC<Props> = (props: Props) => {
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searchVocabs, setSearchVocabs] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);

  const refresh = () => {
    const diags = Object.keys(Diagrams)
      .filter((d) => !Diagrams[d].toBeDeleted)
      .filter((d) =>
        Diagrams[d].name.normalize().trim().toLowerCase().includes(search)
      )
      .filter((d) =>
        searchVocabs.length > 0
          ? _.intersection(
              Diagrams[d].vocabularies,
              searchVocabs.map((input) => input.value)
            ).length > 0
          : true
      );
    setDiagrams(diags);
  };

  useEffect(refresh, [props.freeze, search, searchVocabs]);

  return (
    <Col xs={6}>
      <Stack direction="vertical">
        <DiagramManagerSearch
          search={search}
          setSearch={(search) => setSearch(search)}
          searchVocabularies={searchVocabs}
          setSearchVocabularies={(search) => setSearchVocabs(search)}
          availableVocabularies={props.availableVocabularies}
          projectLanguage={props.projectLanguage}
        />
        <DiagramManagerDiagrams
          diagrams={diagrams}
          projectLanguage={props.projectLanguage}
          performTransaction={props.performTransaction}
          update={() => {
            refresh();
            props.update();
          }}
          selectDiagram={props.selectDiagram}
          selectedDiagram={props.selectedDiagram}
        />
      </Stack>
    </Col>
  );
};
