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
import { getVocabularyFromScheme } from "../../function/FunctionGetVars";

export function updateDefaultLink(id: string): string {
  const iri = WorkspaceElements[WorkspaceLinks[id].source].iri;
  const contextIRI =
    WorkspaceVocabularies[getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)]
      .graph;

  const del: string = DELETE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", qb.v("b")),
    qb.s(qb.v("b"), "?p", "?o"),
  ])}
	`.WHERE`
		${qb.g(contextIRI, [
      qb.s(qb.i(iri), "rdfs:subClassOf", qb.v("b")),
      qb.s(qb.v("b"), "?p", "?o"),
      "filter(isBlank(?b)).",
    ])}`.build();

  const insert: string = INSERT.DATA`${qb.g(contextIRI, [
    ...WorkspaceElements[WorkspaceLinks[id].source].connections
      .filter(
        (linkID) =>
          linkID in WorkspaceLinks &&
          WorkspaceElements[WorkspaceLinks[linkID].target] &&
          WorkspaceLinks[linkID].active &&
          WorkspaceLinks[linkID].iri in Links &&
          WorkspaceLinks[linkID].type === LinkType.DEFAULT
      )
      .map((linkID) =>
        [
          qb.s(
            qb.i(iri),
            "rdfs:subClassOf",
            qb.b([
              qb.po("rdf:type", "owl:Restriction"),
              qb.po("owl:onProperty", qb.i(WorkspaceLinks[linkID].iri)),
              qb.po(
                "owl:someValuesFrom",
                qb.i(WorkspaceElements[WorkspaceLinks[linkID].target].iri)
              ),
            ])
          ),
          qb.s(
            qb.i(iri),
            "rdfs:subClassOf",
            qb.b([
              qb.po("rdf:type", "owl:Restriction"),
              qb.po("owl:onProperty", qb.i(WorkspaceLinks[linkID].iri)),
              qb.po(
                "owl:allValuesFrom",
                qb.i(WorkspaceElements[WorkspaceLinks[linkID].target].iri)
              ),
            ])
          ),
          (WorkspaceTerms[iri].types.includes(
            parsePrefix("z-sgov-pojem", "typ-vlastnosti")
          ) ||
            WorkspaceTerms[iri].types.includes(
              parsePrefix("z-sgov-pojem", "typ-vztahu")
            )) &&
          WorkspaceLinks[id].targetCardinality.getString() !== ""
            ? [
                isNumber(
                  WorkspaceLinks[linkID].targetCardinality.getFirstCardinality()
                )
                  ? qb.s(
                      qb.i(iri),
                      "rdfs:subClassOf",
                      qb.b([
                        qb.po("rdf:type", "owl:Restriction"),
                        qb.po(
                          "owl:onProperty",
                          qb.i(WorkspaceLinks[linkID].iri)
                        ),
                        qb.po(
                          "owl:onClass",
                          qb.i(
                            WorkspaceElements[WorkspaceLinks[linkID].target].iri
                          )
                        ),
                        qb.po(
                          "owl:minQualifiedCardinality",
                          qb.lt(
                            WorkspaceLinks[
                              linkID
                            ].targetCardinality.getFirstCardinality(),
                            "xsd:nonNegativeInteger"
                          )
                        ),
                      ])
                    )
                  : "",
                isNumber(
                  WorkspaceLinks[
                    linkID
                  ].targetCardinality.getSecondCardinality()
                )
                  ? qb.s(
                      qb.i(iri),
                      "rdfs:subClassOf",
                      qb.b([
                        qb.po("rdf:type", "owl:Restriction"),
                        qb.po(
                          "owl:onProperty",
                          qb.i(WorkspaceLinks[linkID].iri)
                        ),
                        qb.po(
                          "owl:onClass",
                          qb.i(
                            WorkspaceElements[WorkspaceLinks[linkID].target].iri
                          )
                        ),
                        qb.po(
                          "owl:maxQualifiedCardinality",
                          qb.lt(
                            WorkspaceLinks[
                              linkID
                            ].targetCardinality.getSecondCardinality(),
                            "xsd:nonNegativeInteger"
                          )
                        ),
                      ])
                    )
                  : "",
              ].join(`
				`)
            : "",
        ].join(`
		`)
      ),
    ...WorkspaceTerms[iri].restrictions
      .filter((rest) => !(rest.target in WorkspaceTerms))
      .map((rest) =>
        [
          qb.s(
            qb.i(iri),
            "rdfs:subClassOf",
            qb.b([
              qb.po("rdf:type", "owl:Restriction"),
              qb.po("owl:onProperty", qb.i(rest.onProperty)),
              qb.po(
                qb.i(rest.restriction),
                isNumber(rest.target)
                  ? qb.lt(rest.target, "xsd:nonNegativeInteger")
                  : qb.i(rest.target)
              ),
            ])
          ),
        ].join(`
			`)
      ),
  ])}`.build();

  return qb.combineQueries(del, insert);
}

export function updateGeneralizationLink(id: string): string {
  const iri = WorkspaceElements[WorkspaceLinks[id].source].iri;
  const contextIRI =
    WorkspaceVocabularies[getVocabularyFromScheme(WorkspaceTerms[iri].inScheme)]
      .graph;

  const subClassOf: string[] = WorkspaceElements[
    WorkspaceLinks[id].source
  ].connections
    .filter(
      (conn) =>
        WorkspaceLinks[conn].type === LinkType.GENERALIZATION &&
        WorkspaceLinks[conn].active
    )
    .map((conn) => qb.i(WorkspaceElements[WorkspaceLinks[conn].target].iri));
  const list = WorkspaceTerms[iri].subClassOf
    .filter((superClass) => !(superClass in WorkspaceTerms))
    .map((superClass) => qb.i(superClass));

  let del = DELETE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
  ])}`.WHERE`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", "?b"),
    "filter(!isBlank(?b)).",
  ])}`.build();

  let insert = INSERT.DATA`${qb.g(contextIRI, [
    qb.s(qb.i(iri), "rdfs:subClassOf", qb.a(subClassOf.concat(list))),
  ])}`.build();
  return qb.combineQueries(del, insert);
}

export function updateConnections(id: string): string {
  return LinkConfig[WorkspaceLinks[id].type].update(id);
}

function isNumber(str: string) {
  return !isNaN(parseInt(str, 10));
}
