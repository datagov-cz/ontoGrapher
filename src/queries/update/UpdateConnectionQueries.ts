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
import { doesLinkHaveInverse } from "../../function/FunctionLink";

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
function constructDefaultLinkRestriction(
  iri: string,
  restriction: string,
  onProperty: string,
  target: string,
  buildInverse: boolean = false,
  inverseTarget?: string,
  onClass?: string
): string[] {
  const buildFunction = (inverse: boolean) =>
    qb.s(
      inverse && inverseTarget ? (onClass ? qb.i(onClass) : target) : qb.i(iri),
      "rdfs:subClassOf",
      qb.b([
        qb.po("rdf:type", "owl:Restriction"),
        qb.po(
          "owl:onProperty",
          inverse
            ? qb.b([
                qb.po(qb.i(parsePrefix("owl", "inverseOf")), qb.i(onProperty)),
              ])
            : qb.i(onProperty)
        ),
        ...(onClass
          ? [qb.po("owl:onClass", inverse ? qb.i(iri) : qb.i(onClass))]
          : []),
        qb.po(restriction, inverse && inverseTarget ? inverseTarget : target),
      ])
    );
  return [buildFunction(false), ...(buildInverse ? [buildFunction(true)] : [])];
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
  const insert: string = INSERT.DATA`${qb.g(contextIRI, [
    ...getActiveToConnections(WorkspaceLinks[id].source)
      .filter(
        (linkID) =>
          linkID in WorkspaceLinks &&
          WorkspaceElements[WorkspaceLinks[linkID].target] &&
          WorkspaceLinks[linkID].iri in Links &&
          WorkspaceLinks[linkID].type === LinkType.DEFAULT
      )
      .map((linkID) =>
        [
          ...constructDefaultLinkRestriction(
            iri,
            "owl:someValuesFrom",
            WorkspaceLinks[linkID].iri,
            qb.i(WorkspaceLinks[linkID].target),
            doesLinkHaveInverse(linkID),
            qb.i(iri)
          ),
          ...constructDefaultLinkRestriction(
            iri,
            "owl:allValuesFrom",
            WorkspaceLinks[linkID].iri,
            qb.i(WorkspaceLinks[linkID].target),
            doesLinkHaveInverse(linkID),
            qb.i(iri)
          ),
          ...(isNumber(
            WorkspaceLinks[linkID].targetCardinality.getFirstCardinality()
          )
            ? constructDefaultLinkRestriction(
                iri,
                "owl:minQualifiedCardinality",
                WorkspaceLinks[linkID].iri,
                qb.lt(
                  WorkspaceLinks[
                    linkID
                  ].targetCardinality.getFirstCardinality(),
                  "xsd:nonNegativeInteger"
                ),
                doesLinkHaveInverse(linkID) &&
                  isNumber(
                    WorkspaceLinks[
                      linkID
                    ].sourceCardinality.getFirstCardinality()
                  ),
                qb.lt(
                  WorkspaceLinks[
                    linkID
                  ].sourceCardinality.getFirstCardinality(),
                  "xsd:nonNegativeInteger"
                ),
                WorkspaceLinks[linkID].target
              )
            : []),
          ...(isNumber(
            WorkspaceLinks[linkID].targetCardinality.getSecondCardinality()
          )
            ? constructDefaultLinkRestriction(
                iri,
                "owl:maxQualifiedCardinality",
                WorkspaceLinks[linkID].iri,
                qb.lt(
                  WorkspaceLinks[
                    linkID
                  ].targetCardinality.getSecondCardinality(),
                  "xsd:nonNegativeInteger"
                ),
                doesLinkHaveInverse(linkID) &&
                  isNumber(
                    WorkspaceLinks[
                      linkID
                    ].sourceCardinality.getSecondCardinality()
                  ),
                qb.lt(
                  WorkspaceLinks[
                    linkID
                  ].sourceCardinality.getSecondCardinality(),
                  "xsd:nonNegativeInteger"
                ),
                WorkspaceLinks[linkID].target
              )
            : []),
        ].join(`
		`)
      ),
    ...WorkspaceTerms[iri].restrictions
      .filter(
        (rest) =>
          rest.target &&
          !(
            rest.target in WorkspaceTerms ||
            (isNumber(rest.target) && rest.onProperty in Links)
          )
      )
      .map((rest) =>
        [
          ...constructDefaultLinkRestriction(
            iri,
            qb.i(rest.restriction),
            rest.onProperty,
            isNumber(rest.target)
              ? qb.lt(rest.target, "xsd:nonNegativeInteger")
              : qb.i(rest.target),
            false,
            undefined,
            rest.onClass
          ),
        ].join(`
			`)
      ),
  ])}`.build();

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
