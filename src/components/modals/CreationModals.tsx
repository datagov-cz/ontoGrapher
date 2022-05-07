import React, { useEffect, useState } from "react";
import NewLinkModal from "./NewLinkModal";
import NewElemModal from "./NewElemModal";
import {
  highlightElement,
  resetDiagramSelection,
} from "../../function/FunctionDiagram";
import { ElemCreationStrategy, Representation } from "../../config/Enum";
import { createTerm } from "../../function/FunctionCreateElem";
import { saveNewLink } from "../../function/FunctionLink";
import { AppSettings } from "../../config/Variables";
import { setRepresentation } from "../../function/FunctionGraph";
import { getElementPosition } from "../../function/FunctionElem";
import { graph } from "../../graph/Graph";
import { drawGraphElement } from "../../function/FunctionDraw";
import { initConnections } from "../../function/FunctionRestriction";
import { updateProjectLink } from "../../queries/update/UpdateLinkQueries";
import { PatternCreationModal } from "../../pattern/PatternCreationModal";

export type ElemCreationConfiguration = {
  strategy: ElemCreationStrategy;
  position: { x: number; y: number };
  connections: string[];
  header: string;
  vocabulary: string;
};

export type LinkCreationConfiguration = { sourceID: string; targetID: string };

export type PatternCreationConfiguration = { elements: string[] };

interface Props {
  update: () => void;
  projectLanguage: string;
  performTransaction: (...queries: string[]) => void;
  elemConfiguration: ElemCreationConfiguration;
  linkConfiguration: LinkCreationConfiguration;
  patternConfiguration: PatternCreationConfiguration;
}

// TODO: create new instance modal from scratch tab
export const CreationModals: React.FC<Props> = (props) => {
  const [modalAddLink, setModalAddLink] = useState<boolean>(false);
  const [modalAddElem, setModalAddElem] = useState<boolean>(false);
  const [modalAddPattern, setModalAddPattern] = useState<boolean>(false);

  useEffect(() => {
    if (props.elemConfiguration.header !== "") setModalAddElem(true);
  }, [props.elemConfiguration]);
  useEffect(() => {
    if (props.linkConfiguration.sourceID !== "") setModalAddLink(true);
  }, [props.linkConfiguration]);
  useEffect(() => {
    if (props.patternConfiguration.elements.length > 0)
      setModalAddPattern(true);
  }, [props.patternConfiguration]);

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
              ),
              updateProjectLink(false, ...initConnections().add)
            );
            setRepresentation(Representation.COMPACT);
            AppSettings.selectedElements = [];
            props.update();
          }
        }}
      />
      <NewElemModal
        projectLanguage={props.projectLanguage}
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
                highlightElement(props.elemConfiguration.connections[0]);
              }
            }
            props.update();
          }
        }}
      />
      <PatternCreationModal
        modal={modalAddPattern}
        close={() => setModalAddPattern(false)}
        configuration={props.patternConfiguration}
      />
    </div>
  );
};
