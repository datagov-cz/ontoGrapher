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
import { RestrictionConfig } from "../../config/logic/RestrictionConfig";
import isUrl from "is-url";

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

function convertTargetIfIRI(target: string, type: TargetType) {
  return type === TargetType.IRI ? qb.i(target) : target;
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
      console.error(`Skipping invalid connection, which would have resulted in erroneus data:
      ${buildFunction(conn, false)}`);
      continue;
    }
    if (conn.target) restrictions.push(buildFunction(conn, false));
    if (conn.buildInverse && conn.inverseTarget)
      restrictions.push(buildFunction(conn, true));
  }
  return restrictions;
}

export function updateDefaultLink(id: string): string {
  const iri = WorkspaceLinks[id].source;
  const vocabulary = getVocabularyFromScheme(WorkspaceTerms[iri].inScheme);
  checkReadOnlyVocabulary(vocabulary);
  const contextIRI = WorkspaceVocabularies[vocabulary].graph;
  const del: string = DELETE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", qb.v("b")),
    qb.s(qb.v("b"), "?p", "?o"),
    qb.s("?i", "rdfs:subClassOf", "?ib"),
    qb.s("?ib", "owl:onProperty", "?ibo"),
    qb.s("?ibo", "?ibop", "?iboo"),
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
      "?ibo ?ibop ?iboo.",
      qb.s("?ib", "?iop", qb.i(iri)),
      `values ?iop {<${Object.keys(RestrictionConfig)
        .concat([parsePrefix("owl", "onClass")])
        .join("> <")}>}`,
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
      insertConnections.push(
        {
          iri: iri,
          restriction: parsePrefix("owl", "someValuesFrom"),
          onProperty: WorkspaceLinks[linkID].iri,
          target: WorkspaceLinks[linkID].target,
          buildInverse: true,
          inverseTarget: iri,
          targetType: TargetType.IRI,
        },
        {
          iri: iri,
          restriction: parsePrefix("owl", "allValuesFrom"),
          onProperty: WorkspaceLinks[linkID].iri,
          target: WorkspaceLinks[linkID].target,
          buildInverse: true,
          inverseTarget: iri,
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
        return;
      }
      const targetCardMin =
        WorkspaceLinks[linkID].targetCardinality.getFirstCardinality();
      const targetCardMax =
        WorkspaceLinks[linkID].targetCardinality.getSecondCardinality();
      const sourceCardMin =
        WorkspaceLinks[linkID].sourceCardinality.getFirstCardinality();
      const sourceCardMax =
        WorkspaceLinks[linkID].sourceCardinality.getSecondCardinality();
      insertConnections.push();
      const minCardinalityConnection: Connection = {
        iri: iri,
        restriction: parsePrefix("owl", "minQualifiedCardinality"),
        onProperty: WorkspaceLinks[linkID].iri,
        target: qb.lt(getNumber(targetCardMin), "xsd:nonNegativeInteger"),
        buildInverse: isNumber(sourceCardMin),
        inverseTarget: qb.lt(sourceCardMin, "xsd:nonNegativeInteger"),
        onClass: WorkspaceLinks[linkID].target,
        targetType: TargetType.CARDINALITY,
      };
      const maxCardinalityConnection: Connection = {
        iri: iri,
        restriction: parsePrefix("owl", "maxQualifiedCardinality"),
        onProperty: WorkspaceLinks[linkID].iri,
        target: qb.lt(getNumber(targetCardMax), "xsd:nonNegativeInteger"),
        buildInverse: isNumber(sourceCardMax),
        inverseTarget: qb.lt(sourceCardMax, "xsd:nonNegativeInteger"),
        onClass: WorkspaceLinks[linkID].target,
        targetType: TargetType.CARDINALITY,
      };

      insertConnections.push(minCardinalityConnection);

      insertConnections.push(maxCardinalityConnection);
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
        restriction: rest.restriction,
        onProperty: rest.onProperty,
        target: isNumber(rest.target)
          ? qb.lt(rest.target, "xsd:nonNegativeInteger")
          : rest.target,
        buildInverse: false,
        onClass: rest.onClass,
        targetType: isNumber(rest.target)
          ? TargetType.CARDINALITY
          : TargetType.IRI,
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
  const vocabulary = getVocabularyFromScheme(WorkspaceTerms[iri].inScheme);
  checkReadOnlyVocabulary(vocabulary);
  const contextIRI = WorkspaceVocabularies[vocabulary].graph;
  const subClassOf: string[] = getActiveToConnections(WorkspaceLinks[id].source)
    .filter((conn) => WorkspaceLinks[conn].type === LinkType.GENERALIZATION)
    .map((conn) => WorkspaceLinks[conn].target);
  const list = WorkspaceTerms[iri].subClassOf
    .filter((superClass) => superClass && !(superClass in WorkspaceTerms))
    .map((superClass) => superClass);

  const del = DELETE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
  ])}`.WHERE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
    "filter(!isBlank(?b)).",
  ])}`.build();

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

function checkReadOnlyVocabulary(graph: string) {
  if (WorkspaceVocabularies[graph].readOnly)
    throw new Error(
      `Attempted to write to read-only graph ${WorkspaceVocabularies[graph].graph}`
    );
}

function getNumber(str: string) {
  return isNumber(str) ? str : "";
}
