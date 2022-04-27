import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { PatternAlgorithmModal } from "./PatternAlgorithmModal";
import { PatternSearchModal } from "./PatternSearchModal";
import { PatternStatisticsModal } from "./PatternStatisticsModal";

type Props = {};

export const MenuPanelPatterns: React.FC<Props> = (props: Props) => {
  const [searchModal, setSearchModal] = useState<boolean>(false);
  const [algorithmModal, setAlgorithmModal] = useState<boolean>(false);
  const [statisticsModal, setStatisticsModal] = useState<boolean>(false);
  return (
    <div>
      <Dropdown className={"inert"}>
        <Dropdown.Toggle>Pattern functions</Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setSearchModal(true)}>
            Search patterns
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setAlgorithmModal(true)}>
            Pattern algorithms
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setStatisticsModal(true)}>
            Usage statistics
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <PatternSearchModal open={searchModal} />
      <PatternAlgorithmModal
        open={algorithmModal}
        close={() => setAlgorithmModal(false)}
      />
      <PatternStatisticsModal
        open={statisticsModal}
        close={() => setStatisticsModal(false)}
      />
    </div>
  );
};
