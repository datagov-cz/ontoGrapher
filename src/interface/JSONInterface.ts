import { Locale } from "../config/Locale";
import {
  AppSettings,
  EquivalentClasses,
  Links,
  Stereotypes,
  WorkspaceVocabularies,
} from "../config/Variables";
import { Cardinality } from "../datatypes/Cardinality";
import { createValues } from "../function/FunctionCreateVars";
import { initLanguageObject } from "../function/FunctionEditVars";
import {
  checkLabels,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";
import {
  fetchBaseOntology,
  fetchSubClassesAndCardinalities,
  fetchVocabulary,
} from "../queries/get/FetchQueries";

export async function getVocabulariesFromRemoteJSON(
  pathToJSON: string
): Promise<boolean> {
  const isURL = require("is-url");
  if (isURL(pathToJSON)) {
    await fetch(pathToJSON)
      .then((response) => response.json())
      .then(async (json) => {
        const results: boolean[] = [];
        if (Object.keys(json).length === 0) return false;
        for (const key of Object.keys(json)) {
          const data = json[key];
          if (data.type === "stereotype") {
            results.push(
              await fetchVocabulary(
                [data.sourceIRI],
                true,
                AppSettings.contextEndpoint
              )
            );
            WorkspaceVocabularies[
              getVocabularyFromScheme(data.sourceIRI)
            ].labels = initLanguageObject(key);
            results.push(
              await fetchBaseOntology(
                AppSettings.contextEndpoint,
                data.sourceIRI,
                Stereotypes,
                [data.classIRI],
                data.values
                  ? createValues(data.values, data.prefixes)
                  : undefined
              )
            );
            results.push(
              await fetchBaseOntology(
                AppSettings.contextEndpoint,
                data.sourceIRI,
                Links,
                [data.relationshipIRI],
                data.values
                  ? createValues(data.values, data.prefixes)
                  : undefined
              )
            );
            checkLabels();
            results.push(
              await fetchSubClassesAndCardinalities(
                AppSettings.contextEndpoint,
                data.sourceIRI,
                Object.keys(Stereotypes),
                Object.keys(Links)
              )
            );
            Object.keys(Links).forEach((link) => {
              if (!Links[link].defaultSourceCardinality.checkCardinalities()) {
                Links[link].defaultSourceCardinality = new Cardinality(
                  AppSettings.defaultCardinalitySource.getFirstCardinality(),
                  AppSettings.defaultCardinalitySource.getSecondCardinality()
                );
              }
              if (!Links[link].defaultTargetCardinality.checkCardinalities()) {
                Links[link].defaultTargetCardinality = new Cardinality(
                  AppSettings.defaultCardinalityTarget.getFirstCardinality(),
                  AppSettings.defaultCardinalityTarget.getSecondCardinality()
                );
              }
            });
            for (const iri of Object.keys(Links)) {
              if (!(iri in EquivalentClasses)) continue;
              for (const eq of EquivalentClasses[iri]) {
                if (eq in Links) continue;
                Links[eq] = Links[iri];
              }
            }
            return results.every((bool) => bool);
          }
        }
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
    activateEquivalentClasses(Links);
    activateEquivalentClasses(Stereotypes);
    return true;
  } else {
    throw new Error(Locale[AppSettings.interfaceLanguage].vocabularyNotFound);
  }
}

function activateEquivalentClasses(iris: typeof Links | typeof Stereotypes) {
  for (const iri in iris) {
    if (!(iri in EquivalentClasses)) continue;
    for (const eq of EquivalentClasses[iri]) {
      if (eq in iris) continue;
      iris[eq] = iris[iri];
    }
  }
}
