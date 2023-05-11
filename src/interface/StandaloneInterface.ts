import { AppSettings } from "../config/Variables";
import { CacheSearchVocabularies } from "../datatypes/CacheSearchResults";
import { initLanguageObject, parsePrefix } from "../function/FunctionEditVars";
import { fetchVocabularies } from "../queries/get/CacheQueries";
import { processQuery } from "./TransactionInterface";

export async function standaloneGetVocabularies(
  vocabularyContext: string = AppSettings.cacheContext
): Promise<boolean> {
  await fetchVocabularies(AppSettings.contextEndpoint, vocabularyContext);
}
