import React, { useState } from "react";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { Nav } from "react-bootstrap";
import { SaveDiagramsModal } from "../modal/SaveDiagramsModal";

interface Props {}

export const MenuPanelSaveDiagrams: React.FC<Props> = (props) => {
  const [modal, setModal] = useState(false);

  return (
    <div className={"inert"}>
      <Nav.Link onClick={() => setModal(true)}>
        {Locale[AppSettings.viewLanguage].generateDiagramImage}
      </Nav.Link>
      <SaveDiagramsModal modal={modal} close={() => setModal(false)} />
    </div>
  );
};
