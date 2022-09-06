import {
  AppSettings,
  Links,
  Stereotypes,
  WorkspaceVocabularies,
} from "../config/Variables";
import { createValues } from "../function/FunctionCreateVars";
import {
  checkLabels,
  getVocabularyFromScheme,
} from "../function/FunctionGetVars";
import { Locale } from "../config/Locale";
import { checkDefaultCardinality } from "../function/FunctionLink";
import {
  fetchBaseOntology,
  fetchSubClassesAndCardinalities,
  fetchVocabulary,
} from "../queries/get/FetchQueries";
import { initLanguageObject } from "../function/FunctionEditVars";

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
              checkDefaultCardinality(link);
            });
            return results.every((bool) => bool);
          }
        }
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
    return true;
  } else {
    throw new Error(Locale[AppSettings.interfaceLanguage].vocabularyNotFound);
  }
}
