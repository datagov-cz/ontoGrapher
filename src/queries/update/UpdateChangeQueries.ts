import { Environment } from "./../../config/Environment";
import { AppSettings, WorkspaceVocabularies } from "./../../config/Variables";
import { DELETE, INSERT } from "@tpluscode/sparql-builder";
import { qb } from "../QueryBuilder";
import { parsePrefix } from "../../function/FunctionEditVars";
import { v4 as uuidv4 } from "uuid";
import { ChangeType, Change } from "../../config/ChangeTypes";

function getUserIRI(): string {
  return `${AppSettings.cacheContext}/uživatel/${AppSettings.currentUser!.id}`;
}

export function updateVocabularyAnnotations(vocabulary: string): string {
  if (!Environment.auth)
    throw new Error(
      "Attemted to update vocabulary annotations without a signed-in user."
    );
  if (WorkspaceVocabularies[vocabulary].readOnly)
    throw new Error(
      `Attemted to track changes for a read-only vocabulary ${vocabulary}.`
    );
  const context = WorkspaceVocabularies[vocabulary].graph;
  const queryInsert = INSERT.DATA`${qb.g(context, [
    qb.s(
      qb.i(context),
      qb.i(parsePrefix("a-popis-dat-pojem", "má-posledního-editora")),
      qb.i(getUserIRI())
    ),
    qb.s(
      qb.i(context),
      qb.i(
        parsePrefix("a-popis-dat-pojem", "má-datum-a-čas-poslední-modifikace")
      ),
      qb.lt(new Date().toISOString(), "xsd:dateTime")
    ),
  ])}`.build();

  const deleteStatements = qb.g(context, [
    qb.s(
      qb.i(context),
      qb.i(parsePrefix("a-popis-dat-pojem", "má-posledního-editora")),
      "?e"
    ),
    qb.s(
      qb.i(context),
      qb.i(
        parsePrefix("a-popis-dat-pojem", "má-datum-a-čas-poslední-modifikace")
      ),
      "?d"
    ),
  ]);

  const queryDelete = DELETE`${deleteStatements}`
    .WHERE`${deleteStatements}`.build();
  return qb.combineQueries(queryDelete, queryInsert);
}

function getChangeType(type: ChangeType): string {
  if (type === ChangeType.ADDITION)
    return parsePrefix("a-popis-dat-pojem", "vytvoření-entity");
  if (type === ChangeType.EDIT)
    return parsePrefix("a-popis-dat-pojem", "úprava-entity");
  throw new Error("Received an unexpected ChangeType.");
}

function constructChangeTrackingQuery(change: Change): string {
  if (!WorkspaceVocabularies[change.vocabulary].changeContext)
    throw new Error(
      `Change context not found for vocabulary ${change.vocabulary}.`
    );
  if (WorkspaceVocabularies[change.vocabulary].readOnly)
    throw new Error(
      `Attemted to track changes for a read-only vocabulary ${change.vocabulary}.`
    );
  if (!Environment.auth)
    throw new Error(
      "Attemted to update vocabulary annotations without a signed-in user."
    );
  const type = getChangeType(change.type);
  //TODO: change ID generation to conform to Termit implementation
  const suffix = `/instance-${uuidv4()}`;
  const iri = qb.i(type + suffix);
  return qb.combineQueries(
    INSERT.DATA`${qb.g(
      WorkspaceVocabularies[change.vocabulary].changeContext!,
      [
        qb.s(iri, "rdf:type", qb.i(type)),
        qb.s(
          iri,
          parsePrefix("a-popis-dat-pojem", "má-editora"),
          qb.i(getUserIRI())
        ),
        qb.s(
          iri,
          qb.i(parsePrefix("a-popis-dat-pojem", "má-datum-a-čas-modifikace")),
          qb.lt(new Date().toISOString(), "xsd:dateTime")
        ),
        qb.s(
          iri,
          parsePrefix("a-popis-dat-pojem", "má-změněnou-entitu"),
          qb.i(change.entity)
        ),
        // If this is just an addition change (i.e. creation of a new term), we stop here. Otherwise, we continue logging additional details:
        ...(change.type === ChangeType.EDIT
          ? [
              qb.s(
                iri,
                parsePrefix("a-popis-dat-pojem", "má-změněný-atribut"),
                qb.i(change.attribute)
              ),
              qb.s(
                iri,
                parsePrefix("a-popis-dat-pojem", "má-původní-hodnotu"),
                change.current
              ),
              qb.s(
                iri,
                parsePrefix("a-popis-dat-pojem", "má-novou-hodnotu"),
                change.replace
              ),
            ]
          : []),
      ]
    )}`.build()
  );
}

// TODO: implement entity/attribute change tracking
export function updateChanges(...changes: Change[]): string {
  return qb.combineQueries(
    ...changes.map((c) => updateVocabularyAnnotations(c.vocabulary)),
    ...changes.map((c) => constructChangeTrackingQuery(c))
  );
}
