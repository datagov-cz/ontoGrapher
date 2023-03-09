import isUrl from "is-url";
import _ from "lodash";
import { LinkType, Representation } from "../config/Enum";
import { LinkConfig } from "../config/logic/LinkConfig";
import {
  AppSettings,
  Links,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { CacheSearchVocabularies } from "../datatypes/CacheSearchResults";
import { Restriction } from "../datatypes/Restriction";
import {
  fetchFullRelationships,
  fetchReadOnlyTerms,
  fetchRelationships,
  fetchSubClasses,
} from "../queries/get/CacheQueries";
import { CacheConnection } from "../types/CacheConnection";
import { getVocabularyFromScheme, setSchemeColors } from "./FunctionGetVars";

export async function getCacheConnections(
  iri: string,
  representation: Representation = AppSettings.representation
): Promise<CacheConnection[]> {
  const subClasses = (
    await fetchSubClasses(AppSettings.contextEndpoint, iri)
  ).concat(WorkspaceTerms[iri].subClassOf);
  let connections: CacheConnection[] = [];
  if (representation === Representation.FULL) {
    connections = connections.concat(await getFullConnections(iri, subClasses));
  } else if (representation === Representation.COMPACT) {
    connections = connections.concat(
      await getCompactConnections(iri, subClasses)
    );
  } else throw new Error("Unrecognized view representation value");
  return _.uniqWith(
    connections,
    (a, b) => a.target.iri === b.target.iri && a.link === b.link
  ).filter((conn) => !(conn.target.iri in WorkspaceTerms));
}

function mapResultToConnection(
  terms: typeof WorkspaceTerms,
  iri: string,
  link: string,
  direction: "source" | "target",
  linkLabels?: { [key: string]: string }
): CacheConnection {
  return {
    link: link,
    linkLabels: linkLabels ? linkLabels : Links[link].labels,
    direction: direction,
    target: {
      iri: iri,
      labels: terms[iri].labels,
      definitions: terms[iri].definitions,
      vocabulary: getVocabularyFromScheme(terms[iri].inScheme),
    },
  };
}

async function getFullConnections(
  iri: string,
  subClasses: string[]
): Promise<CacheConnection[]> {
  const connections: CacheConnection[] = [];
  const restrictions = await fetchRelationships(AppSettings.contextEndpoint, [
    iri,
  ]);
  const terms = await fetchReadOnlyTerms(
    AppSettings.contextEndpoint,
    Object.keys(restrictions)
      .concat(
        WorkspaceTerms[iri].restrictions
          .filter((r) => isUrl(r.target))
          .map((r) => r.target)
      )
      .concat(subClasses)
  );
  connections.push(
    ...WorkspaceTerms[iri].restrictions
      .filter((restriction) => restriction.target in terms)
      .map((restriction) =>
        mapResultToConnection(
          terms,
          restriction.target,
          restriction.onProperty,
          "source"
        )
      )
  );
  Object.keys(restrictions)
    .filter((restriction) => restriction in terms)
    .forEach((restriction) => {
      connections.push(
        ...restrictions[restriction].map((r) =>
          mapResultToConnection(terms, restriction, r.onProperty, "target")
        )
      );
    });
  return connections.concat(getSubclassConnections(iri, terms, subClasses));
}

async function getCompactConnections(
  iri: string,
  subClasses: string[]
): Promise<CacheConnection[]> {
  const connections: CacheConnection[] = [];
  const relationships = await fetchFullRelationships(
    AppSettings.contextEndpoint,
    iri
  );
  const terms = await fetchReadOnlyTerms(
    AppSettings.contextEndpoint,
    relationships.map((rel) => rel.target).concat(subClasses)
  );
  connections.push(
    ...relationships
      .filter((relationship) => relationship.target in terms)
      .map((relationship) =>
        mapResultToConnection(
          terms,
          relationship.target,
          relationship.relation,
          "target",
          relationship.labels
        )
      )
  );
  connections.push(
    ...subClasses
      .filter((subC) => subC in terms)
      .map((subC) =>
        mapResultToConnection(
          terms,
          subC,
          LinkConfig[LinkType.GENERALIZATION].iri,
          WorkspaceTerms[iri].subClassOf.includes(subC) ? "source" : "target"
        )
      )
  );
  return connections.concat(getSubclassConnections(iri, terms, subClasses));
}

function getSubclassConnections(
  iri: string,
  terms: typeof WorkspaceTerms,
  subClasses: string[]
): CacheConnection[] {
  return subClasses
    .filter((subC) => subC in terms)
    .map((subC) =>
      mapResultToConnection(
        terms,
        subC,
        LinkConfig[LinkType.GENERALIZATION].iri,
        WorkspaceTerms[iri].subClassOf.includes(subC) ? "source" : "target"
      )
    );
}

export function insertNewCacheTerms(newTerms: typeof WorkspaceTerms) {
  Object.assign(WorkspaceTerms, newTerms);
  for (const term in newTerms) {
    const vocab = Object.keys(CacheSearchVocabularies).find(
      (vocab) =>
        CacheSearchVocabularies[vocab].glossary === newTerms[term].inScheme
    );
    if (vocab) {
      if (
        !Object.keys(WorkspaceVocabularies).find(
          (vocab) =>
            WorkspaceVocabularies[vocab].glossary === newTerms[term].inScheme
        )
      ) {
        WorkspaceVocabularies[vocab] = {
          labels: CacheSearchVocabularies[vocab].labels,
          readOnly: true,
          namespace: CacheSearchVocabularies[vocab].namespace,
          glossary: CacheSearchVocabularies[vocab].glossary,
          graph: vocab,
          color: "#FFF",
        };
        setSchemeColors(AppSettings.viewColorPool);
      }
    } else
      console.error(
        `Vocabulary with glossary ${newTerms[term].inScheme} has not been found in the database; term ${term} will not be added.`
      );
  }
}

export function insertNewRestrictions(values: {
  [key: string]: Restriction[];
}) {
  for (const term of Object.keys(values).filter(
    (term) => term in WorkspaceTerms
  )) {
    WorkspaceTerms[term].restrictions.push(...values[term]);
  }
}
