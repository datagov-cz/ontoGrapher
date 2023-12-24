import { Locale } from "../config/Locale";
import {
  AppSettings,
  EquivalentClasses,
  Languages,
  Links,
  Stereotypes,
  WorkspaceVocabularies,
} from "../config/Variables";
import { createValues } from "../function/FunctionCreateVars";
import { initLanguageObject } from "../function/FunctionEditVars";
import { getVocabularyFromScheme } from "../function/FunctionGetVars";
import {
  fetchBaseOntology,
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
          WorkspaceVocabularies[
            getVocabularyFromScheme(data.sourceIRI)
          ].hidden = true;
          results.push(
            await fetchBaseOntology(
              AppSettings.contextEndpoint,
              data.sourceIRI,
              Stereotypes,
              [data.classIRI],
              data.values ? createValues(data.values, data.prefixes) : undefined
            )
          );
          results.push(
            await fetchBaseOntology(
              AppSettings.contextEndpoint,
              data.sourceIRI,
              Links,
              [data.relationshipIRI],
              data.values ? createValues(data.values, data.prefixes) : undefined
            )
          );
          for (const link in Links) {
            for (const lang in Languages) {
              if (!Links[link].labels[lang]) {
                const label = link.lastIndexOf("/");
                Links[link].labels[lang] = link.substring(label + 1);
              }
            }
          }
          for (const iri of Object.keys(Links)) {
            if (!(iri in EquivalentClasses)) continue;
            for (const eq of EquivalentClasses[iri]) {
              if (eq in Links) continue;
              Links[eq] = Links[iri];
            }
          }
          return results.every((bool) => bool);
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
