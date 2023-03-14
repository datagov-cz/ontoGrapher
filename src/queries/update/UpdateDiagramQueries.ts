import { WorkspaceVocabularies } from "./../../config/Variables";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { qb } from "../QueryBuilder";
import { AppSettings, Diagrams } from "../../config/Variables";
import { parsePrefix } from "../../function/FunctionEditVars";
import _ from "lodash";

function getDiagramTriples(diagram: string): string {
  const diagramIRI = qb.i(Diagrams[diagram].iri);
  const diagramGraph = Diagrams[diagram].graph;
  const diagramAttachmentTypes = [
    qb.i(parsePrefix("a-popis-dat-pojem", "příloha")),
    qb.i(parsePrefix("og", "diagram")),
  ];
  const conditionals: string[] = [];
  if (Diagrams[diagram].vocabularies)
    conditionals.push(
      qb.s(
        diagramIRI,
        "og:vocabulary",
        qb.a(Diagrams[diagram].vocabularies.map((v) => qb.i(v))),
        Diagrams[diagram].vocabularies.length > 0
      )
    );
  if (Diagrams[diagram].collaborators)
    conditionals.push(
      qb.s(
        diagramIRI,
        "og:collaborator",
        qb.a(
          Diagrams[diagram].collaborators.map((c) =>
            qb.i("https://slovník.gov.cz/uživatel/" + c)
          )
        ),
        Diagrams[diagram].collaborators.length > 0
      )
    );
  if (Diagrams[diagram].creationDate)
    conditionals.push(
      qb.s(
        diagramIRI,
        "og:creationDate",
        qb.lt(Diagrams[diagram].creationDate.toISOString(), "xsd:dateTime")
      )
    );
  if (Diagrams[diagram].modifiedDate)
    conditionals.push(
      qb.s(
        diagramIRI,
        "og:modifiedDate",
        qb.lt(Diagrams[diagram].modifiedDate.toISOString(), "xsd:dateTime")
      )
    );
  if (Diagrams[diagram].description)
    conditionals.push(
      qb.s(diagramIRI, "og:description", qb.ll(Diagrams[diagram].description))
    );
  return INSERT.DATA`${qb.g(diagramGraph, [
    qb.s(diagramIRI, "rdf:type", qb.a(diagramAttachmentTypes)),
    qb.s(diagramIRI, "og:index", qb.ll(Diagrams[diagram].index)),
    qb.s(diagramIRI, "og:name", qb.ll(Diagrams[diagram].name)),
    qb.s(diagramIRI, "og:id", qb.ll(diagram)),
    qb.s(diagramIRI, "og:active", qb.ll(Diagrams[diagram].active)),
    qb.s(
      diagramIRI,
      "og:representation",
      qb.ll(Diagrams[diagram].representation)
    ),
    ...conditionals,
  ])}`.build();
}

export function updateDiagramAssignments(diagram: string): string {
  const diagramIRI = qb.i(Diagrams[diagram].iri);
  const diagramGraph = qb.i(Diagrams[diagram].graph);
  const deleteVocabularyContext1 = AppSettings.contextIRIs.map((contextIRI) =>
    DELETE`${qb.g(contextIRI, [qb.s(diagramGraph, "?p1", "?o1")])}`
      .WHERE`${qb.g(contextIRI, [qb.s(diagramGraph, "?p1", "?o1")])}`.build()
  );
  const deleteVocabularyContext2 = AppSettings.contextIRIs.map((contextIRI) =>
    DELETE`${qb.g(contextIRI, [qb.s("?s1", "?p1", diagramGraph)])}`
      .WHERE`${qb.g(contextIRI, [qb.s("?s1", "?p1", diagramGraph)])}`.build()
  );

  const insertVocabularyContext = Diagrams[diagram].vocabularies
    .map((v) => WorkspaceVocabularies[v].graph)
    .map((contextIRI) =>
      INSERT.DATA`${qb.g(contextIRI, [
        qb.s(
          qb.i(contextIRI),
          qb.i(
            parsePrefix(
              "d-sgov-pracovní-prostor-pojem",
              `odkazuje-na-přílohový-kontext`
            )
          ),
          diagramGraph
        ),
        qb.s(
          diagramGraph,
          "rdf:type",
          qb.i(
            parsePrefix("d-sgov-pracovní-prostor-pojem", "přílohový-kontext")
          )
        ),
        qb.s(
          diagramGraph,
          qb.i(parsePrefix("a-popis-dat-pojem", "má-typ-přílohy")),
          "og:diagram"
        ),
        qb.s(
          diagramGraph,
          qb.i(parsePrefix("a-popis-dat-pojem", "vychází-z-verze")),
          diagramIRI
        ),
      ])}`.build()
    );
  return qb.combineQueries(
    ...deleteVocabularyContext1,
    ...deleteVocabularyContext2,
    ...insertVocabularyContext
  );
}

export function updateCreateDiagram(diagram: string): string {
  const diagramIRI = qb.i(Diagrams[diagram].iri);
  const diagramGraph = qb.i(Diagrams[diagram].graph);
  const insertAppContext = INSERT.DATA`${qb.g(AppSettings.applicationContext, [
    qb.s(qb.i(AppSettings.applicationContext), "og:diagram", qb.ll(diagram)),
  ])}`.build();
  const insertDiagramContext = getDiagramTriples(diagram);
  const insertVocabularyContext = AppSettings.contextIRIs.map((contextIRI) =>
    INSERT.DATA`${qb.g(contextIRI, [
      qb.s(
        qb.i(contextIRI),
        qb.i(
          parsePrefix(
            "d-sgov-pracovní-prostor-pojem",
            `odkazuje-na-přílohový-kontext`
          )
        ),
        diagramGraph
      ),
      qb.s(
        diagramGraph,
        "rdf:type",
        qb.i(parsePrefix("d-sgov-pracovní-prostor-pojem", "přílohový-kontext"))
      ),
      qb.s(
        diagramGraph,
        qb.i(parsePrefix("a-popis-dat-pojem", "má-typ-přílohy")),
        "og:diagram"
      ),
      qb.s(
        diagramGraph,
        qb.i(parsePrefix("a-popis-dat-pojem", "vychází-z-verze")),
        diagramIRI
      ),
    ])}`.build()
  );

  return qb.combineQueries(
    insertAppContext,
    ...insertVocabularyContext,
    insertDiagramContext
  );
}

export function updateDiagram(diagram: string): string {
  const diagramIRI = Diagrams[diagram].iri;
  const diagramGraph = Diagrams[diagram].graph;
  const insertDiagramContext = getDiagramTriples(diagram);
  const del = DELETE`${qb.g(diagramGraph, [
    qb.s(qb.i(diagramIRI), "?p1", "?o1"),
  ])}`.WHERE`${qb.g(diagramGraph, [
    qb.s(qb.i(diagramIRI), "?p1", "?o1"),
  ])}`.build();
  return qb.combineQueries(del, insertDiagramContext);
}

export function updateDeleteDiagram(diagram: string) {
  const diagramGraph = Diagrams[diagram].graph;
  const deleteGraph = `DROP GRAPH <${diagramGraph}>`;
  const deleteVocabularyContext1 = AppSettings.contextIRIs.map((contextIRI) =>
    DELETE`${qb.g(contextIRI, [qb.s(qb.i(diagramGraph), "?p1", "?o1")])}`
      .WHERE`${qb.g(contextIRI, [
      qb.s(qb.i(diagramGraph), "?p1", "?o1"),
    ])}`.build()
  );
  const deleteVocabularyContext2 = AppSettings.contextIRIs.map((contextIRI) =>
    DELETE`${qb.g(contextIRI, [qb.s("?s1", "?p1", qb.i(diagramGraph))])}`
      .WHERE`${qb.g(contextIRI, [
      qb.s("?s1", "?p1", qb.i(diagramGraph)),
    ])}`.build()
  );
  return qb.combineQueries(
    deleteGraph,
    ...deleteVocabularyContext1,
    ...deleteVocabularyContext2
  );
}

export function updateDiagramMetadata(diagram: string): string {
  const diagramGraph = Diagrams[diagram].graph;
  const diagramIRI = Diagrams[diagram].iri;
  Diagrams[diagram].modifiedDate = new Date();
  if (AppSettings.currentUser)
    Diagrams[diagram].collaborators = _.uniq([
      ...Diagrams[diagram].collaborators,
      AppSettings.currentUser,
    ]);
  const del = DELETE`${qb.g(diagramGraph, [
    qb.s(qb.i(diagramIRI), "og:modifiedDate", "?v1"),
    qb.s(qb.i(diagramIRI), "og:collaborator", "?v2"),
  ])}`.WHERE`${qb.g(diagramGraph, [
    qb.s(qb.i(diagramIRI), "og:modifiedDate", "?v1"),
    qb.s(qb.i(diagramIRI), "og:collaborator", "?v2"),
  ])}`.build();
  const ins = INSERT.DATA`${qb.g(diagramGraph, [
    qb.s(
      qb.i(diagramIRI),
      "og:modifiedDate",
      qb.lt(Diagrams[diagram].modifiedDate.toISOString(), "xsd:dateTime")
    ),
    qb.s(
      qb.i(diagramIRI),
      "og:collaborator",
      qb.a(
        Diagrams[diagram].collaborators.map((c) =>
          qb.i("https://slovník.gov.cz/uživatel/" + c)
        )
      ),
      Diagrams[diagram].collaborators.length > 0
    ),
  ])}`.build();
  return qb.combineQueries(del, ins);
}
