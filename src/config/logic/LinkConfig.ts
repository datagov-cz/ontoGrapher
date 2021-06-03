import * as joint from "jointjs";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { generalizationLink } from "../../graph/uml/GeneralizationLink";
import { LinkType } from "../Enum";
import {
  updateDefaultLink,
  updateGeneralizationLink,
} from "../../queries/update/UpdateConnectionQueries";

export const LinkConfig: {
  [key: number]: {
    id: string;
    update: (id: string) => string;
    newLink: (id?: string) => joint.dia.Link;
    labels: { [key: string]: string };
    iri: string;
  };
} = {
  [LinkType.DEFAULT]: {
    id: "default",
    iri: "",
    labels: initLanguageObject(""),
    newLink: (id?: string) => {
      if (id) return new joint.shapes.standard.Link({ id: id });
      else return new joint.shapes.standard.Link();
    },
    update: (id: string) => updateDefaultLink(id),
  },
  [LinkType.GENERALIZATION]: {
    id: "generalization",
    labels: { cs: "generalizace", en: "generalization" },
    iri: "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/uml/generalization",
    newLink: (id?: string) => {
      if (id) return new generalizationLink({ id: id });
      else return new generalizationLink();
    },
    update: (id: string) => updateGeneralizationLink(id),
  },
} as const;
