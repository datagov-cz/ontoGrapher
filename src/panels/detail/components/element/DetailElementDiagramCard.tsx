import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import InfoIcon from "@mui/icons-material/Info";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useStoreState } from "pullstate";
import React from "react";
import { Accordion, Button, ListGroup } from "react-bootstrap";
import { DetailPanelMode, MainViewMode } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import { StoreSettings } from "../../../../config/Store";
import {
  AppSettings,
  Diagrams,
  WorkspaceElements,
} from "../../../../config/Variables";
import {
  changeDiagrams,
  highlightElement,
} from "../../../../function/FunctionDiagram";
import { isElementHidden } from "../../../../function/FunctionElem";
import { centerElementInView } from "../../../../function/FunctionGraph";

type Props = {
  id: string;
};

export const DetailElementDiagramCard: React.FC<Props> = (props) => {
  const d = useStoreState(StoreSettings);

  return (
    <Accordion.Item eventKey="2">
      <Accordion.Header>
        {Locale[AppSettings.interfaceLanguage].diagramTab}
      </Accordion.Header>
      <Accordion.Body>
        <ListGroup className={d.diagramPanelSelectedDiagram}>
          {Object.keys(WorkspaceElements[props.id].hidden)
            .filter(
              (diag) => Diagrams[diag] && !isElementHidden(props.id, diag)
            )
            .map((diag, i) => (
              <ListGroup.Item
                className="diagramEntry form-control form-control-sm"
                key={i}
              >
                <span className="diagram">{Diagrams[diag].name}</span>
                <span className="actions">
                  {!Diagrams[diag].active ? (
                    <Button
                      variant="light"
                      className="plainButton"
                      onClick={() => {
                        Diagrams[diag].active = true;
                        changeDiagrams(diag);
                        AppSettings.selectedLinks = [];
                        centerElementInView(props.id);
                        StoreSettings.update((s) => {
                          s.diagramPanelSelectedDiagram = diag;
                        });
                      }}
                    >
                      <OpenInNewIcon />
                    </Button>
                  ) : (
                    <Button
                      variant="light"
                      className="plainButton"
                      onClick={() => {
                        if (diag !== AppSettings.selectedDiagram) {
                          changeDiagrams(diag);
                          AppSettings.selectedLinks = [];
                          highlightElement(props.id);
                          StoreSettings.update((s) => {
                            s.diagramPanelSelectedDiagram = diag;
                          });
                        }
                        centerElementInView(props.id);
                      }}
                    >
                      <FullscreenExitIcon />
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      AppSettings.selectedDiagram = "";
                      StoreSettings.update((s) => {
                        s.selectedDiagram = diag;
                        s.mainViewMode = MainViewMode.MANAGER;
                        s.detailPanelMode = DetailPanelMode.HIDDEN;
                        s.detailPanelSelectedID = "";
                        s.diagramPanelSelectedDiagram = "";
                      });
                    }}
                    variant="light"
                    className="plainButton"
                  >
                    <InfoIcon />
                  </Button>
                </span>
              </ListGroup.Item>
            ))}
        </ListGroup>
      </Accordion.Body>
    </Accordion.Item>
  );
};
