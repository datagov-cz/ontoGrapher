import {
  AppSettings,
  Links,
  Stereotypes,
  WorkspaceVocabularies,
} from "../config/Variables";
import { Vocabularies } from "../config/Vocabularies";
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

export async function getVocabularies(): Promise<boolean> {
  const results: boolean[] = [];
  for (const [key, data] of Object.entries(Vocabularies)) {
    if (data.type === "stereotype") {
      results.push(
        await fetchVocabulary(
          [data.sourceIRI],
          true,
          AppSettings.contextEndpoint
        )
      );
      WorkspaceVocabularies[getVocabularyFromScheme(data.sourceIRI)].labels =
        initLanguageObject(key);
      results.push(
        await fetchBaseOntology(
          AppSettings.contextEndpoint,
          data.sourceIRI,
          Stereotypes,
          data.classIRI,
          data.values ? createValues(data.values, data.prefixes) : undefined
        )
      );
      results.push(
        await fetchBaseOntology(
          AppSettings.contextEndpoint,
          data.sourceIRI,
          Links,
          data.relationshipIRI,
          data.values ? createValues(data.values, data.prefixes) : undefined
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
    }
  }
  return results.every((bool) => bool);
}
