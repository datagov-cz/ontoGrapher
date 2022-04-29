import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { PatternAlgorithmModal } from "./PatternAlgorithmModal";
import { PatternStatisticsModal } from "./PatternStatisticsModal";

type Props = {};

export const MenuPanelPatterns: React.FC<Props> = (props: Props) => {
  const [algorithmModal, setAlgorithmModal] = useState<boolean>(false);
  const [statisticsModal, setStatisticsModal] = useState<boolean>(false);
  return (
    <span className={"inert"}>
      <Dropdown>
        <Dropdown.Toggle>Pattern functions</Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setAlgorithmModal(true)}>
            Pattern algorithms
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setStatisticsModal(true)}>
            Usage statistics
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <PatternAlgorithmModal
        open={algorithmModal}
        close={() => setAlgorithmModal(false)}
      />
      <PatternStatisticsModal
        open={statisticsModal}
        close={() => setStatisticsModal(false)}
      />
    </span>
  );
};
