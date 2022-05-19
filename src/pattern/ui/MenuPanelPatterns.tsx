import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { PatternStatisticsModal } from "../modals/PatternStatisticsModal";
import { StorePattern } from "../function/StorePattern";

type Props = {};

export const MenuPanelPatterns: React.FC<Props> = (props: Props) => {
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
      <Nav.Link onClick={() => setStatisticsModal(true)}>
        Statistiky užití šablon
      </Nav.Link>
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
