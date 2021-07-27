import { PackageNode } from "../datatypes/PackageNode";
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
  pkg: PackageNode,
  position: { x: number; y: number },
  connections: string[]
) => string[];

export const createTerm: (
  conceptName: { [key: string]: string },
  pkg: PackageNode,
  strategy: ElemCreationStrategy,
  position: { x: number; y: number },
  connections: string[]
) => string[] = (
  conceptName,
  pkg,
  strategy,
  position = { x: 0, y: 0 },
  connections
) => {
  return CreateElemStrategy[strategy](conceptName, pkg, position, connections);
};

const CreateElemStrategy: {
  [key in ElemCreationStrategy]: CreateElemStrategyType;
} = {
  [ElemCreationStrategy.DEFAULT]: (
    conceptName: { [key: string]: string },
    pkg: PackageNode,
    position: { x: number; y: number }
  ) => {
    const id = createNewConcept(
      position,
      conceptName,
      AppSettings.defaultLanguage,
      pkg
    );
    return [
      updateProjectElement(true, id),
      updateProjectElementDiagram(AppSettings.selectedDiagram, id),
    ];
  },
  [ElemCreationStrategy.INTRINSIC_TROPE_TYPE]: (
    conceptName: { [key: string]: string },
    pkg: PackageNode,
    position: { x: number; y: number },
    connections: string[]
  ) => {
    if (connections.length !== 1)
      throw new Error("Incorrect amount of supplied connections; expected 1");
    const id = createNewConcept(
      position,
      conceptName,
      AppSettings.defaultLanguage,
      pkg,
      [parsePrefix("z-sgov-pojem", "typ-vlastnosti")]
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
    pkg: PackageNode,
    position: { x: number; y: number },
    connections: string[]
  ) => {
    if (connections.length !== 2)
      throw new Error("Incorrect amount of supplied connections; expected 2");
    const id = createNewConcept(
      position,
      conceptName,
      AppSettings.defaultLanguage,
      pkg,
      [parsePrefix("z-sgov-pojem", "typ-vztahu")]
    );
    return [
      updateProjectElement(true, id),
      updateProjectElementDiagram(AppSettings.selectedDiagram, id),
      ...saveNewLink(
        parsePrefix("z-sgov-pojem", "má-vztažený-prvek-1"),
        id,
        connections[0],
        Representation.FULL
      ),
      ...saveNewLink(
        parsePrefix("z-sgov-pojem", "má-vztažený-prvek-2"),
        id,
        connections[1],
        Representation.FULL
      ),
    ];
  },
};
