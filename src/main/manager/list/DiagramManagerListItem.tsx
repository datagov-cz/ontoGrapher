import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import classNames from "classnames";
import React, { useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { VocabularyBadge } from "../../../components/VocabularyBadge";
import { Locale } from "../../../config/Locale";
import {
  AppSettings,
  Diagrams,
  WorkspaceVocabularies,
} from "../../../config/Variables";
import { getVocabularyLabel } from "../../../function/FunctionGetVars";
import {
  updateDiagram,
  updateDiagramAssignments,
} from "../../../queries/update/UpdateDiagramQueries";

interface Props {
  diagram: string;
  selected: boolean;
  performTransaction: (...queries: string[]) => void;
  update: () => void;
  selectDiagram: (diagram: string) => void;
  openRemoveDiagram: () => void;
}

export const DiagramManagerListItem: React.FC<Props> = (props: Props) => {
  const [hovered, setHovered] = useState<boolean>(false);

  const saveActive = (id: string) => {
    props.performTransaction(updateDiagram(id), updateDiagramAssignments(id));
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => props.selectDiagram(props.diagram)}
      className={classNames("diagramListItem", {
        selected: props.selected,
        hovered: hovered && !props.selected,
      })}
    >
      <div className="top">
        <span className="left">
          <span className="name">{Diagrams[props.diagram].name}</span>
          &nbsp;
          <span className="vocabularies">
            {Diagrams[props.diagram].vocabularies?.map((v) => (
              <VocabularyBadge
                key={v}
                text={getVocabularyLabel(v)}
                color={WorkspaceVocabularies[v].color}
                cancellable={false}
              />
            ))}
          </span>
        </span>
        {(props.selected || hovered) && (
          <span className="options">
            &nbsp;
            {!Diagrams[props.diagram].active && (
              <OverlayTrigger
                placement={"bottom"}
                overlay={
                  <Tooltip id={`tooltip`}>
                    {Locale[AppSettings.interfaceLanguage].openDiagram}
                  </Tooltip>
                }
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    Diagrams[props.diagram].active = true;
                    saveActive(props.diagram);
                    props.update();
                  }}
                  className="plainButton"
                  variant="secondary"
                >
                  <OpenInNewIcon />
                </Button>
              </OverlayTrigger>
            )}
            {Diagrams[props.diagram].active && (
              <OverlayTrigger
                placement={"bottom"}
                overlay={
                  <Tooltip id={`tooltip`}>
                    {Locale[AppSettings.interfaceLanguage].closeDiagram}
                  </Tooltip>
                }
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    Diagrams[props.diagram].active = false;
                    saveActive(props.diagram);
                    props.update();
                  }}
                  className="plainButton"
                  variant="secondary"
                >
                  <CloseIcon />
                </Button>
              </OverlayTrigger>
            )}
            <OverlayTrigger
              placement={"bottom"}
              overlay={
                <Tooltip id={`tooltip`}>
                  {Locale[AppSettings.interfaceLanguage].deleteDiagram}
                </Tooltip>
              }
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  props.openRemoveDiagram();
                }}
                className="plainButton"
                variant="secondary"
              >
                <DeleteIcon />
              </Button>
            </OverlayTrigger>
          </span>
        )}
      </div>
      <span className="description">{Diagrams[props.diagram].description}</span>
    </div>
  );
};
