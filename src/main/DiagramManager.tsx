import { useStoreState } from "pullstate";
import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import { StoreSettings } from "../config/Store";
import { DiagramManagerDetails } from "./manager/details/DiagramManagerDetails";
import { DiagramManagerList } from "./manager/list/DiagramManagerList";
import * as _ from "lodash";
import { Diagrams } from "../config/Variables";

type Props = {
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  update: () => void;
  freeze: boolean;
};

export const DiagramManager: React.FC<Props> = (props: Props) => {
  const state = useStoreState(StoreSettings);
  const [selectedDiagram, setSelectedDiagram] = useState<string>("");
  const [availableVocabs, setAvailableVocabs] = useState<string[]>([]);

  useEffect(
    () => setSelectedDiagram(state.selectedDiagram),
    [state.selectedDiagram]
  );

  useEffect(
    () =>
      setAvailableVocabs(
        _.compact(
          _.uniq(
            Object.keys(Diagrams).flatMap((diag) => Diagrams[diag].vocabularies)
          )
        )
      ),
    []
  );

  return (
    <Container fluid className="diagramManager">
      <Row>
        <DiagramManagerList
          freeze={props.freeze}
          projectLanguage={props.projectLanguage}
          performTransaction={props.performTransaction}
          update={props.update}
          selectDiagram={(diagram) => setSelectedDiagram(diagram)}
          availableVocabularies={availableVocabs}
          selectedDiagram={selectedDiagram}
        />
        {selectedDiagram && (
          <DiagramManagerDetails
            selectedDiagram={selectedDiagram}
            performTransaction={props.performTransaction}
            projectLanguage={props.projectLanguage}
            availableVocabularies={availableVocabs}
          />
        )}
      </Row>
    </Container>
  );
};
