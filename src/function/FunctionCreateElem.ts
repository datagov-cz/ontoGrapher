import { ElemCreationStrategy, Representation } from "../config/Enum";
import { createNewConcept } from "./FunctionElem";
import { AppSettings } from "../config/Variables";
import {
  updateProjectElement,
  updateProjectElementDiagram,
} from "../queries/update/UpdateElementQueries";
import { parsePrefix } from "./FunctionEditVars";
import { saveNewLink } from "./FunctionLink";

type CreateElemStrategyType = (
  conceptName: { [key: string]: string },
  vocabulary: string,
  position: { x: number; y: number },
  connections: string[]
) => string[];

export const createTerm: (
  conceptName: { [key: string]: string },
  vocabulary: string,
  strategy: ElemCreationStrategy,
  position: { x: number; y: number },
  connections: string[]
) => string[] = (
  conceptName,
  vocabulary,
  strategy,
  position = { x: 0, y: 0 },
  connections
) => {
  return CreateElemStrategy[strategy](
    conceptName,
    vocabulary,
    position,
    connections
  );
};

const CreateElemStrategy: {
  [key in ElemCreationStrategy]: CreateElemStrategyType;
} = {
  [ElemCreationStrategy.DEFAULT]: (
    conceptName: { [key: string]: string },
    vocabulary: string,
    position: { x: number; y: number }
  ) => {
    const id = createNewConcept(
      position,
      conceptName,
      AppSettings.defaultLanguage,
      vocabulary
    );
    return [
      updateProjectElement(true, id),
      updateProjectElementDiagram(AppSettings.selectedDiagram, id),
    ];
  },
  [ElemCreationStrategy.INTRINSIC_TROPE_TYPE]: (
    conceptName: { [key: string]: string },
    vocabulary: string,
    position: { x: number; y: number },
    connections: string[]
  ) => {
    if (connections.length !== 1)
      throw new Error("Incorrect amount of supplied connections; expected 1");
    const id = createNewConcept(
      position,
      conceptName,
      AppSettings.defaultLanguage,
      vocabulary,
      [parsePrefix("z-sgov-pojem", "typ-vlastnosti")],
      true
    );
    return [
      updateProjectElement(true, id),
      updateProjectElementDiagram(AppSettings.selectedDiagram, id),
      ...saveNewLink(
        parsePrefix("z-sgov-pojem", "má-vlastnost"),
        connections[0],
        id,
        Representation.FULL
      ),
    ];
  },
  [ElemCreationStrategy.RELATOR_TYPE]: (
    conceptName: { [key: string]: string },
    vocabulary: string,
    position: { x: number; y: number },
    connections: string[]
  ) => {
    if (connections.length !== 2)
      throw new Error("Incorrect amount of supplied connections; expected 2");
    const id = createNewConcept(
      position,
      conceptName,
      AppSettings.defaultLanguage,
      vocabulary,
      [parsePrefix("z-sgov-pojem", "typ-vztahu")]
    );
    return [
      updateProjectElement(true, id),
      updateProjectElementDiagram(AppSettings.selectedDiagram, id),
      ...saveNewLink(
        id,
        connections[0],
        connections[1],
        Representation.COMPACT
      ),
    ];
  },
};
