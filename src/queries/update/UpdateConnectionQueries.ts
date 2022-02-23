import {
  Links,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { LinkType } from "../../config/Enum";
import { parsePrefix } from "../../function/FunctionEditVars";
import { qb } from "../QueryBuilder";
import { LinkConfig } from "../../config/logic/LinkConfig";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import {
  getActiveToConnections,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import _ from "lodash";

type Connection = {
  iri: string;
  onProperty: string;
  restriction: string;
  target: string;
  buildInverse: boolean;
  inverseTarget?: string;
  onClass?: string;
};

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
  for (const conn of connections) {
    const buildFunction = (inverse: boolean) =>
      qb.s(
        inverse && conn.inverseTarget
          ? conn.onClass
            ? qb.i(conn.onClass)
            : conn.target
          : qb.i(conn.iri),
        "rdfs:subClassOf",
        qb.b([
          qb.po("rdf:type", "owl:Restriction"),
          qb.po(
            "owl:onProperty",
            inverse
              ? qb.b([
                  qb.po(
                    qb.i(parsePrefix("owl", "inverseOf")),
                    qb.i(conn.onProperty)
                  ),
                ])
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
            conn.restriction,
            inverse && conn.inverseTarget ? conn.inverseTarget : conn.target
          ),
        ])
      );
    if (conn.target) restrictions.push(buildFunction(false));
    if (conn.buildInverse) restrictions.push(buildFunction(true));
  }
  return restrictions;
}

export function updateDefaultLink(id: string): string {
  const iri = WorkspaceLinks[id].source;
  const contextIRI =
    WorkspaceVocabularies[getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)]
      .graph;
  const del: string = DELETE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", qb.v("b")),
    qb.s(qb.v("b"), "?p", "?o"),
    qb.s("?i", "rdfs:subClassOf", "?ib"),
    qb.s("?ib", "?ip", "?io"),
  ])}
	`.WHERE`
		${qb.g(contextIRI, [
      qb.s(qb.i(iri), "rdfs:subClassOf", qb.v("b")),
      qb.s(qb.v("b"), "?p", "?o"),
      "filter(isBlank(?b)).",
      "OPTIONAL {",
      qb.s("?i", "rdfs:subClassOf", "?ib"),
      "filter(isBlank(?ib)).",
      qb.s("?ib", "owl:onProperty", "?ibo"),
      "filter(isBlank(?ibo)).",
      qb.s("?ib", "owl:onClass", qb.i(iri)),
      qb.s("?ib", "?ip", "?io"),
      "}",
    ])}`.build();
  const insertConnections: Connection[] = [];
  getActiveToConnections(WorkspaceLinks[id].source)
    .filter(
      (linkID) =>
        linkID in WorkspaceLinks &&
        WorkspaceLinks[linkID].target in WorkspaceElements &&
        WorkspaceLinks[linkID].iri in Links &&
        WorkspaceLinks[linkID].type === LinkType.DEFAULT
    )
    .forEach((linkID) => {
      const targetCardMin =
        WorkspaceLinks[linkID].targetCardinality.getFirstCardinality();
      const targetCardMax =
        WorkspaceLinks[linkID].targetCardinality.getSecondCardinality();
      const sourceCardMin =
        WorkspaceLinks[linkID].sourceCardinality.getFirstCardinality();
      const sourceCardMax =
        WorkspaceLinks[linkID].sourceCardinality.getSecondCardinality();
      insertConnections.push(
        {
          iri: iri,
          restriction: "owl:someValuesFrom",
          onProperty: WorkspaceLinks[linkID].iri,
          target: qb.i(WorkspaceLinks[linkID].target),
          buildInverse: true,
          inverseTarget: qb.i(iri),
        },
        {
          iri: iri,
          restriction: "owl:allValuesFrom",
          onProperty: WorkspaceLinks[linkID].iri,
          target: qb.i(WorkspaceLinks[linkID].target),
          buildInverse: true,
          inverseTarget: qb.i(iri),
        },
        {
          iri: iri,
          restriction: "owl:minQualifiedCardinality",
          onProperty: WorkspaceLinks[linkID].iri,
          target: qb.lt(getNumber(targetCardMin), "xsd:nonNegativeInteger"),
          buildInverse: isNumber(sourceCardMin),
          inverseTarget: qb.lt(sourceCardMin, "xsd:nonNegativeInteger"),
          onClass: WorkspaceLinks[linkID].target,
        },
        {
          iri: iri,
          restriction: "owl:maxQualifiedCardinality",
          onProperty: WorkspaceLinks[linkID].iri,
          target: qb.lt(getNumber(targetCardMax), "xsd:nonNegativeInteger"),
          buildInverse: isNumber(sourceCardMax),
          inverseTarget: qb.lt(sourceCardMax, "xsd:nonNegativeInteger"),
          onClass: WorkspaceLinks[linkID].target,
        }
      );
    });
  WorkspaceTerms[iri].restrictions
    .filter(
      (rest) =>
        rest.target &&
        !(
          rest.target in WorkspaceTerms ||
          (isNumber(rest.target) && rest.onProperty in Links)
        )
    )
    .forEach((rest) =>
      insertConnections.push({
        iri: iri,
        restriction: qb.i(rest.restriction),
        onProperty: rest.onProperty,
        target: isNumber(rest.target)
          ? qb.lt(rest.target, "xsd:nonNegativeInteger")
          : qb.i(rest.target),
        buildInverse: false,
        onClass: rest.onClass,
      })
    );
  const insert = INSERT.DATA`${qb.g(
    contextIRI,
    _.uniq(constructDefaultLinkRestrictions(...insertConnections))
  )}`.build();
  return qb.combineQueries(del, insert);
}

export function updateGeneralizationLink(id: string): string {
  const iri = WorkspaceLinks[id].source;
  const contextIRI =
    WorkspaceVocabularies[getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)]
      .graph;

  const subClassOf: string[] = getActiveToConnections(WorkspaceLinks[id].source)
    .filter((conn) => WorkspaceLinks[conn].type === LinkType.GENERALIZATION)
    .map((conn) => qb.i(WorkspaceLinks[conn].target));
  const list = WorkspaceTerms[iri].subClassOf
    .filter((superClass) => superClass && !(superClass in WorkspaceTerms))
    .map((superClass) => qb.i(superClass));

  const del = DELETE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
  ])}`.WHERE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
    "filter(!isBlank(?b)).",
  ])}`.build();

  const subClasses = subClassOf.concat(list);

  const insert = INSERT.DATA`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", qb.a(subClasses), subClasses.length > 0),
  ])}`.build();
  return qb.combineQueries(del, insert);
}

export function updateConnections(id: string): string {
  return LinkConfig[WorkspaceLinks[id].type].update(id);
}

export function isNumber(str: string) {
  return !isNaN(parseInt(str, 10));
}

function getNumber(str: string) {
  return isNumber(str) ? str : "";
}
