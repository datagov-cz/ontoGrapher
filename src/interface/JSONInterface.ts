import isUrl from "is-url";
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
  let vocabularyJSON: { [key: string]: any } = {};
  if (isUrl(pathToJSON))
    vocabularyJSON = await fetch(pathToJSON)
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);
        return false;
      });
  else vocabularyJSON = require("../config/Vocabularies.json");
  if (!vocabularyJSON)
    throw new Error(Locale[AppSettings.interfaceLanguage].vocabularyNotFound);
  const results: boolean[] = [];
  if (Object.keys(vocabularyJSON).length === 0) return false;
  for (const key of Object.keys(vocabularyJSON)) {
    const data = vocabularyJSON[key];
    results.push(
      await fetchVocabulary([data.sourceIRI], true, AppSettings.contextEndpoint)
    );
    WorkspaceVocabularies[getVocabularyFromScheme(data.sourceIRI)].labels =
      initLanguageObject(key);
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
  activateEquivalentClasses(Links);
  activateEquivalentClasses(Stereotypes);
  return true;
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
