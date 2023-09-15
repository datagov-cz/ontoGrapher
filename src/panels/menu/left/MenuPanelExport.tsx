import React, { useState } from "react";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";
import { Nav } from "react-bootstrap";
import { ExportModal } from "../modal/ExportModal";
import classNames from "classnames";

export const MenuPanelExport: React.FC = () => {
  const [modal, setModal] = useState(false);

  return (
    <div
      className={classNames("inert", {
        nointeract: AppSettings.selectedDiagram === "",
      })}
    >
      <Nav.Link onClick={() => setModal(true)}>
        {Locale[AppSettings.interfaceLanguage].exportDiagram}
      </Nav.Link>
      <ExportModal modal={modal} close={() => setModal(false)} />
    </div>
  );
};
