import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { PatternStatisticsModal } from "../modals/PatternStatisticsModal";
import { StorePattern } from "../function/StorePattern";
import { PatternAlgorithmModal } from "../modals/PatternAlgorithmModal";

type Props = {};

export const MenuPanelPatterns: React.FC<Props> = (props: Props) => {
  const [algorithmModal, setAlgorithmModal] = useState<boolean>(false);
  const [statisticsModal, setStatisticsModal] = useState<boolean>(false);
  const [statisticsID, setStatisticsID] = useState<string>("");

  StorePattern.subscribe(
    (s) => s.selectedPattern,
    (state) => {
      setStatisticsID(state);
      if (state) setStatisticsModal(true);
    }
  );

  return (
    <span className={"inert"}>
      <Dropdown>
        <Dropdown.Toggle>Pattern functions</Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setAlgorithmModal(true)}>
            Pattern algorithms
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setStatisticsModal(true)}>
            Pattern usage statistics
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <PatternAlgorithmModal
        open={algorithmModal}
        close={() => setAlgorithmModal(false)}
      />
      <PatternStatisticsModal
        open={statisticsModal}
        id={statisticsID}
        close={() => {
          setStatisticsModal(false);
          StorePattern.update((s) => {
            s.selectedPattern = "";
          });
        }}
      />
    </span>
  );
};
