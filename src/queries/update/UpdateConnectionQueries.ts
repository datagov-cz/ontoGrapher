import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import isUrl from "is-url";
import * as joint from "jointjs";
import _ from "lodash";
import { LinkType } from "../../config/Enum";
import { LanguageObject } from "../../config/Languages";
import {
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { RestrictionConfig } from "../../config/logic/RestrictionConfig";
import {
  initLanguageObject,
  parsePrefix,
} from "../../function/FunctionEditVars";
import {
  getActiveToConnections,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import { generalizationLink } from "../../graph/uml/GeneralizationLink";
import { qb } from "../QueryBuilder";
import { AppSettings } from "./../../config/Variables";

export const LinkConfig: {
  [key: number]: {
    id: string;
    update: (ids: string[]) => string;
    newLink: (id?: string) => joint.dia.Link;
    labels: LanguageObject;
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
    update: updateDefaultLink,
  },
  [LinkType.GENERALIZATION]: {
    id: "generalization",
    labels: { cs: "je podtřídou", en: "is subclass of" },
    iri: "http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/uml/generalization",
    newLink: (id?: string) => {
      if (id) return new generalizationLink({ id: id });
      else return new generalizationLink();
    },
    update: updateGeneralizationLink,
  },
} as const;

type Connection = {
  iri: string;
  onProperty: string;
  restriction: string;
  buildInverse: boolean;
  targetType: TargetType;
  onClass?: string;
  // DO NOT use qb.i(); on these
  inverseTarget?: string;
  target: string;
};

enum TargetType {
  CARDINALITY,
  IRI,
}

// This function helps construct the owl:Restrictions. The result for origin restrictions is:
// IRI rdfs:subClassOf [rdf:type owl:Restriction;
// 		owl:onProperty ONPROPERTY;
//    owl:onClass ONCLASS;
// 		RESTRICTION TARGET].
// For inverse restrictions, it is:
// (ONCLASS || TARGET) rdfs:subClassOf [rdf:type owl:Restriction;
//    owl:onProperty [owl:inverseOf ONPROPERTY];
//    owl:onClass IRI;
//    RESTRICTION INVERSETARGET].
function constructDefaultLinkRestrictions(
  ...connections: Connection[]
): string[] {
  const restrictions: string[] = [];
  const convertTargetIfIRI = (target: string, type: TargetType) =>
    type === TargetType.IRI ? qb.i(target) : target;
  const buildFunction = (conn: Connection, inverse: boolean) =>
    qb.s(
      inverse && conn.inverseTarget
        ? conn.onClass
          ? qb.i(conn.onClass)
          : qb.i(conn.target)
        : qb.i(conn.iri),
      "rdfs:subClassOf",
      qb.b([
        qb.po("rdf:type", "owl:Restriction"),
        qb.po(
          "owl:onProperty",
          inverse
            ? qb.b([qb.po("owl:inverseOf", qb.i(conn.onProperty))])
            : qb.i(conn.onProperty)
        ),
        ...(conn.onClass
          ? [
              qb.po(
                "owl:onClass",
                inverse ? qb.i(conn.iri) : qb.i(conn.onClass)
              ),
            ]
          : []),
        qb.po(
          qb.i(conn.restriction),
          convertTargetIfIRI(
            inverse && conn.inverseTarget ? conn.inverseTarget : conn.target,
            conn.targetType
          )
        ),
      ])
    );
  for (const conn of connections) {
    if (![conn.iri, conn.onProperty, conn.restriction].every((p) => isUrl(p))) {
      console.error(`Skipping invalid connection, which would have resulted in erroneous data:
      ${buildFunction(conn, false)}`);
      continue;
    }
    if (conn.target) restrictions.push(buildFunction(conn, false));
    if (conn.buildInverse && conn.inverseTarget)
      restrictions.push(buildFunction(conn, true));
  }
  return restrictions;
}

function updateDefaultLink(ids: string[]): string {
  // Pre-processing
  const vocabulariesAndTerms: { [key: string]: string[] } = {};
  const termsAndLinks: { [key: string]: string[] } = {};
  for (const id of ids) {
    const source = WorkspaceLinks[id].source;
    const target = WorkspaceLinks[id].target;
    const vocabularySource = getVocabularyFromScheme(
      WorkspaceTerms[source].inScheme
    );
    const vocabularyTarget = getVocabularyFromScheme(
      WorkspaceTerms[source].inScheme
    );
    vocabulariesAndTerms[vocabularySource] = _.uniq(
      _.flatten(_.compact([vocabulariesAndTerms[vocabularySource], source]))
    );
    vocabulariesAndTerms[vocabularyTarget] = _.uniq(
      _.flatten(_.compact([vocabulariesAndTerms[vocabularyTarget], target]))
    );
    termsAndLinks[source] = _.uniq(
      _.flatten(_.compact([termsAndLinks[source], id]))
    );
    termsAndLinks[target] = _.uniq(
      _.flatten(_.compact([termsAndLinks[target], id]))
    );
  }
  const dels: string[] = [];
  const inserts: string[] = [];

  for (const vocabulary of Object.keys(vocabulariesAndTerms)) {
    checkReadOnlyVocabulary(vocabulary);
    const contextIRI = WorkspaceVocabularies[vocabulary].graph;
    const terms = vocabulariesAndTerms[vocabulary];
    const insertConnections: Connection[] = [];
    const linksToUpdate = _.uniq(_.flatten(terms.map((t) => termsAndLinks[t])));
    for (const linkID of linksToUpdate.filter(
      (linkID) => WorkspaceLinks[linkID].type === LinkType.DEFAULT
    )) {
      dels.push(
        DELETE`${qb.g(contextIRI, [
          qb.s(qb.i(WorkspaceLinks[linkID].source), "rdfs:subClassOf", "?b"),
          qb.s("?b", "?bp", "?bo"),
        ])}
    `.WHERE`
      ${qb.g(contextIRI, [
        qb.s(qb.i(WorkspaceLinks[linkID].source), "rdfs:subClassOf", "?b"),
        "filter(isBlank(?b)).",
        qb.s("?b", "rdf:type", "owl:Restriction"),
        qb.s("?b", "owl:onProperty", qb.i(WorkspaceLinks[linkID].iri)),
        qb.s("?b", "?pMatch", qb.i(WorkspaceLinks[linkID].target)),
        `values ?pMatch {<${Object.keys(RestrictionConfig)
          .concat([parsePrefix("owl", "onClass")])
          .join("> <")}>}`,
      ])}`.build(),
        DELETE`${qb.g(contextIRI, [
          qb.s(qb.i(WorkspaceLinks[linkID].target), "rdfs:subClassOf", "?ib"),
          qb.s("?ibo", "?ibop", "?iboo"),
          qb.s("?ib", "?ip", "?io"),
        ])}
      `.WHERE`
        ${qb.g(contextIRI, [
          qb.s(qb.i(WorkspaceLinks[linkID].target), "rdfs:subClassOf", "?ib"),
          "filter(isBlank(?ib)).",
          qb.s("?ib", "rdf:type", "owl:Restriction"),
          qb.s("?ib", "owl:onProperty", "?ibo"),
          "filter(isBlank(?ibo)).",
          "?ibo ?ibop ?iboo.",
          qb.s("?ibo", "owl:inverseOf", qb.i(WorkspaceLinks[linkID].iri)),
          qb.s("?ib", "?ipMatch", qb.i(WorkspaceLinks[linkID].source)),
          `values ?ipMatch {<${Object.keys(RestrictionConfig)
            .concat([parsePrefix("owl", "onClass")])
            .join("> <")}>}`,
          qb.s("?ib", "?ip", "?io"),
        ])}`.build()
      );
      if (!!!WorkspaceLinks[linkID].active) continue;
      const targetCardMin =
        WorkspaceLinks[linkID].targetCardinality.getFirstCardinality();
      const targetCardMax =
        WorkspaceLinks[linkID].targetCardinality.getSecondCardinality();
      const sourceCardMin =
        WorkspaceLinks[linkID].sourceCardinality.getFirstCardinality();
      const sourceCardMax =
        WorkspaceLinks[linkID].sourceCardinality.getSecondCardinality();
      const source = WorkspaceLinks[linkID].source;
      const target = WorkspaceLinks[linkID].target;
      const linkIRI = WorkspaceLinks[linkID].iri;
      insertConnections.push(
        {
          iri: source,
          restriction: parsePrefix("owl", "someValuesFrom"),
          onProperty: linkIRI,
          target: target,
          buildInverse: true,
          inverseTarget: source,
          targetType: TargetType.IRI,
        },
        {
          iri: source,
          restriction: parsePrefix("owl", "allValuesFrom"),
          onProperty: linkIRI,
          target: target,
          buildInverse: true,
          inverseTarget: source,
          targetType: TargetType.IRI,
        }
      );
      if (
        ![
          WorkspaceLinks[linkID].targetCardinality,
          WorkspaceLinks[linkID].sourceCardinality,
        ].every((c) => c.checkCardinalities())
      ) {
        console.error(
          `Cannot save connection ${linkID}'s cardinalities because of invalid data.`
        );
        continue;
      }
      const minCardinalityConnection: Connection = {
        iri: source,
        restriction: parsePrefix("owl", "minQualifiedCardinality"),
        onProperty: linkIRI,
        target: qb.lt(getNumber(targetCardMin), "xsd:nonNegativeInteger"),
        buildInverse: isNumber(sourceCardMin),
        inverseTarget: qb.lt(sourceCardMin, "xsd:nonNegativeInteger"),
        onClass: target,
        targetType: TargetType.CARDINALITY,
      };
      const maxCardinalityConnection: Connection = {
        iri: source,
        restriction: parsePrefix("owl", "maxQualifiedCardinality"),
        onProperty: linkIRI,
        target: qb.lt(getNumber(targetCardMax), "xsd:nonNegativeInteger"),
        buildInverse: isNumber(sourceCardMax),
        inverseTarget: qb.lt(sourceCardMax, "xsd:nonNegativeInteger"),
        onClass: target,
        targetType: TargetType.CARDINALITY,
      };
      insertConnections.push(
        minCardinalityConnection,
        maxCardinalityConnection
      );
    }
    inserts.push(
      INSERT.DATA`${qb.g(
        contextIRI,
        constructDefaultLinkRestrictions(..._.uniq(insertConnections))
      )}`.build()
    );
  }
  if (dels && inserts)
    AppSettings.changedVocabularies.push(...Object.keys(vocabulariesAndTerms));
  return qb.combineQueries(...dels, ...inserts);
}

function updateGeneralizationLink(ids: string[]): string {
  const dels: string[] = [];
  const inserts: string[] = [];
  for (const id of ids) {
    const iri = WorkspaceLinks[id].source;
    const vocabulary = getVocabularyFromScheme(WorkspaceTerms[iri].inScheme);
    checkReadOnlyVocabulary(vocabulary);
    const contextIRI = WorkspaceVocabularies[vocabulary].graph;
    const subClassOf: string[] = getActiveToConnections(
      WorkspaceLinks[id].source
    )
      .filter((conn) => WorkspaceLinks[conn].type === LinkType.GENERALIZATION)
      .map((conn) => WorkspaceLinks[conn].target);
    const list = WorkspaceTerms[iri].subClassOf
      .filter((superClass) => superClass && !(superClass in WorkspaceTerms))
      .map((superClass) => superClass);

    dels.push(
      DELETE`${qb.g(contextIRI, [qb.s(qb.i(iri), "rdfs:subClassOf", "?b")])}`
        .WHERE`${qb.g(contextIRI, [
        qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
        "filter(!isBlank(?b)).",
      ])}`.build()
    );

    const subClasses = _.compact(
      subClassOf
        .concat(list)
        .filter((sc) => {
          const check = isUrl(sc);
          if (!check)
            console.error(
              `Skipping the claim that term ${iri} is a sub-class of ${sc}, which is invalid.`
            );
          return check;
        })
        .map((sc) => qb.i(sc))
    );

    inserts.push(
      INSERT.DATA`${qb.g(contextIRI, [
        qb.s(
          qb.i(iri),
          "rdfs:subClassOf",
          qb.a(subClasses),
          subClasses.length > 0
        ),
      ])}`.build()
    );
    AppSettings.changedVocabularies.push(
      getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)
    );
  }

  return qb.combineQueries(...dels, ...inserts);
}

export function updateTermConnections(...ids: string[]): string {
  const connections = Object.keys(WorkspaceLinks);
  const updates: Record<number, string[]> = {};
  const queries: string[] = [];
  for (const k of Object.keys(LinkConfig).map((_, i) => i)) updates[k] = [];
  for (const id of ids) {
    const type = WorkspaceLinks[id].type;
    if (!updates[type].includes(id)) {
      updates[type].push(id);
      if (type === LinkType.DEFAULT) {
        const source = WorkspaceLinks[id].source;
        const connectionsSource = connections.filter(
          (linkID) =>
            WorkspaceLinks[linkID].source === source &&
            WorkspaceLinks[linkID].target in WorkspaceElements
        );
        const connectionsTarget = connections.filter(
          (linkID) =>
            WorkspaceLinks[linkID].target === source &&
            WorkspaceLinks[linkID].source in WorkspaceElements
        );
        updates[type] = _.uniq([
          ...updates[type],
          ...connectionsSource,
          ...connectionsTarget,
        ]);
      }
    }
  }
  for (const k of Object.keys(LinkConfig).map((_, i) => i))
    queries.push(
      LinkConfig[k].update(
        updates[k].filter((linkID) => WorkspaceLinks[linkID].iri in Links)
      )
    );
  return qb.combineQueries(...queries);
}

export function isNumber(str: string) {
  return !isNaN(parseInt(str, 10));
}

function checkReadOnlyVocabulary(vocabulary: string) {
  if (WorkspaceVocabularies[vocabulary].readOnly)
    throw new Error(
      `Attempted to write to read-only graph ${WorkspaceVocabularies[vocabulary].graph}`
    );
}

function getNumber(str: string) {
  return isNumber(str) ? str : "";
}
