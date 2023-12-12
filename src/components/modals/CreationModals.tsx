import React, { useEffect, useState } from "react";
import { ElemCreationStrategy, Representation } from "../../config/Enum";
import { AppSettings } from "../../config/Variables";
import { CellColors } from "../../config/visual/CellColors";
import { createTerm } from "../../function/FunctionCreateElem";
import { resetDiagramSelection } from "../../function/FunctionDiagram";
import { drawGraphElement, highlightCells } from "../../function/FunctionDraw";
import { getElementPosition } from "../../function/FunctionElem";
import { setRepresentation } from "../../function/FunctionGraph";
import { saveNewLink } from "../../function/FunctionLink";
import { graph } from "../../graph/Graph";
import NewElemModal from "./NewElemModal";
import NewLinkModal from "./NewLinkModal";

export type ElemCreationConfiguration = {
  strategy: ElemCreationStrategy;
  position: { x: number; y: number };
  connections: string[];
  header: string;
  vocabulary: string;
};

export type LinkCreationConfiguration = { sourceID: string; targetID: string };

interface Props {
  update: () => void;
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  elemConfiguration: ElemCreationConfiguration;
  linkConfiguration: LinkCreationConfiguration;
}

export const CreationModals: React.FC<Props> = (props) => {
  const [modalAddLink, setModalAddLink] = useState<boolean>(false);
  const [modalAddElem, setModalAddElem] = useState<boolean>(false);

  useEffect(() => {
    if (props.elemConfiguration.header !== "") setModalAddElem(true);
  }, [props.elemConfiguration]);
  useEffect(() => {
    if (props.linkConfiguration.sourceID !== "") setModalAddLink(true);
  }, [props.linkConfiguration]);

  return (
    <div>
      <NewLinkModal
        projectLanguage={props.projectLanguage}
        modal={modalAddLink}
        configuration={props.linkConfiguration}
        closeLink={(selectedLink?: string) => {
          setModalAddLink(false);
          if (selectedLink) {
            props.performTransaction(
              ...saveNewLink(
                selectedLink,
                props.linkConfiguration.sourceID,
                props.linkConfiguration.targetID
              )
            );
            props.update();
          }
          resetDiagramSelection();
        }}
        closeElem={(
          conceptName?: { [key: string]: string },
          vocabulary?: string
        ) => {
          setModalAddLink(false);
          if (conceptName && vocabulary) {
            props.performTransaction(
              ...createTerm(
                conceptName,
                vocabulary,
                ElemCreationStrategy.RELATOR_TYPE,
                getElementPosition(props.linkConfiguration.sourceID),
                [
                  props.linkConfiguration.sourceID,
                  props.linkConfiguration.targetID,
                ]
              )
            );
            setRepresentation(
              Representation.COMPACT,
              AppSettings.selectedDiagram
            );
            AppSettings.selectedElements = [];
            props.update();
          }
        }}
      />
      <NewElemModal
        modal={modalAddElem}
        configuration={props.elemConfiguration}
        close={(
          conceptName?: { [key: string]: string },
          vocabulary?: string
        ) => {
          setModalAddElem(false);
          if (conceptName && vocabulary) {
            props.performTransaction(
              ...createTerm(
                conceptName,
                vocabulary,
                props.elemConfiguration.strategy,
                props.elemConfiguration.position,
                props.elemConfiguration.connections
              )
            );
            if (props.elemConfiguration.connections.length === 1) {
              const elem = graph
                .getElements()
                .find(
                  (elem) => elem.id === props.elemConfiguration.connections[0]
                );
              if (elem) {
                drawGraphElement(
                  elem,
                  props.projectLanguage,
                  AppSettings.representation
                );
                highlightCells(
                  CellColors.detail,
                  props.elemConfiguration.connections[0]
                );
              }
            }
            props.update();
          }
        }}
      />
    </div>
  );
};
