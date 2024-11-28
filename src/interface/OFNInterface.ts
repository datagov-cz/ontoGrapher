import isUrl from "is-url";
import { Representation } from "../config/Enum";
import { LanguageObject } from "../config/Languages";
import { RepresentationConfig } from "../config/logic/RepresentationConfig";
import {
  Prefixes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../config/Variables";
import { parsePrefix } from "../function/FunctionEditVars";
import { getParentOfIntrinsicTropeType } from "../function/FunctionGetVars";
import { qb } from "../queries/QueryBuilder";

export function loadOFNVocabulary(file: File) {
  // debugger;
  // const reader = new FileReader();
  // reader.onload = () => {
  //   const N3 = require("n3");
  //   const parser = new N3.Parser();
  //   parser.parse(reader.result, (error: Error, quad: Quad) => {
  //     if (quad) {
  //     }
  //     if (error) console.error(error);
  //   });
  // };
  // reader.readAsText(file);
}

export function saveOFNVocabulary(vocabulary: string): Blob {
  const fileID = "data:text/csv;charset=utf-8";
  const addStatement = (s: string, p: string, o: string, option?: boolean) =>
    qb.s(s, p, o, option) + (option || option === undefined ? " \n" : "");
  const mapLanguageObject = (lo: LanguageObject) =>
    Object.keys(lo)
      .filter((l) => lo[l])
      .map((l) => qb.ll(lo[l], l));

  if (WorkspaceVocabularies[vocabulary].readOnly) return new Blob([]);
  const vocabularyTerms = Object.keys(WorkspaceTerms).filter(
    (t) => WorkspaceElements[t].vocabulary === vocabulary
  );
  if (vocabularyTerms.length === 0) return new Blob([]);
  let vExport = "";
  // Prefixes
  Object.entries(Prefixes).forEach(
    ([k, v]) => (vExport += `@prefix ${k}: ${qb.i(v)}. \n`)
  );
  // Vocabulary info
  // Type
  if (
    vocabularyTerms.find(
      (t) =>
        WorkspaceTerms[t].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        ) ||
        WorkspaceTerms[t].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vztahu")
        )
    )
  )
    vExport += addStatement(qb.i(vocabulary), "rdf:type", "owl:Ontology");
  else
    vExport += addStatement(qb.i(vocabulary), "rdf:type", "skos:ConceptScheme");
  // Name
  const vocabularyNames = mapLanguageObject(
    WorkspaceVocabularies[vocabulary].labels
  );
  vExport += addStatement(
    qb.i(vocabulary),
    "skos:prefLabel",
    qb.a(vocabularyNames),
    vocabularyNames.length > 0
  );
  // Terms
  for (const term of vocabularyTerms) {
    let tExport = "";
    // Type
    const termType = WorkspaceTerms[term].types.filter((t) =>
      RepresentationConfig[Representation.FULL].visibleStereotypes.includes(t)
    );
    if (termType.includes(parsePrefix("z-sgov-pojem", "typ-objektu"))) {
      tExport += addStatement(qb.i(term), "rdf:type", "owl:Class");
      // Subclass
      for (const subClass of WorkspaceTerms[term].subClassOf) {
        tExport += addStatement(qb.i(term), "rdfs:subClassOf", qb.i(subClass));
      }
    } else if (
      termType.includes(parsePrefix("z-sgov-pojem", "typ-vlastnosti"))
    ) {
      const tropeDomain = getParentOfIntrinsicTropeType(term);
      if (tropeDomain.length !== 1) {
        console.warn(`Corresponding object type to trope ${term} not found.`);
        continue;
      }
      tExport += addStatement(qb.i(term), "rdf:type", "owl:DatatypeProperty");
      // Subclass
      for (const subClass of WorkspaceTerms[term].subClassOf) {
        tExport += addStatement(
          qb.i(term),
          "rdfs:subPropertyOf",
          qb.i(subClass)
        );
      }
      // Domain
      tExport += addStatement(qb.i(term), "rdfs:domain", qb.i(tropeDomain[0]));
    } else if (termType.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))) {
      const linkID = Object.keys(WorkspaceLinks).find(
        (id) => WorkspaceLinks[id].iri === term
      );
      if (!linkID) {
        console.warn(`Corresponding link ID to ${term} not found.`);
        continue;
      }
      tExport += addStatement(qb.i(term), "rdf:type", "owl:ObjectProperty");
      // Subclass
      for (const subClass of WorkspaceTerms[term].subClassOf) {
        tExport += addStatement(
          qb.i(term),
          "rdfs:subPropertyOf",
          qb.i(subClass)
        );
      }
      // Domain
      tExport += addStatement(
        qb.i(term),
        "rdfs:domain",
        qb.i(WorkspaceLinks[linkID].source)
      );
      // Range
      tExport += addStatement(
        qb.i(term),
        "rdfs:range",
        qb.i(WorkspaceLinks[linkID].target)
      );
    } else {
      console.warn(`${term} not recognized as a valid term.`);
      continue;
    }
    // Scheme
    tExport += addStatement(qb.i(term), "skos:inScheme", qb.i(vocabulary));
    // Name
    const termNames = mapLanguageObject(WorkspaceTerms[term].labels);
    tExport += addStatement(
      qb.i(term),
      "skos:prefLabel",
      qb.a(termNames),
      termNames.length > 0
    );
    // Description
    const termDescriptions = mapLanguageObject(
      WorkspaceTerms[term].descriptions
    );
    tExport += addStatement(
      qb.i(term),
      "dc:description",
      qb.a(termDescriptions),
      termDescriptions.length > 0
    );
    // Definition
    const termDefinitions = mapLanguageObject(WorkspaceTerms[term].definitions);
    tExport += addStatement(
      qb.i(term),
      "skos:definition",
      qb.a(termDefinitions),
      termDefinitions.length > 0
    );
    // Source
    if (isUrl(WorkspaceTerms[term].source))
      tExport += addStatement(
        qb.i(term),
        "dc:conformsTo",
        qb.i(WorkspaceTerms[term].source)
      );
    else if (!!!WorkspaceTerms[term].source)
      tExport += addStatement(
        qb.i(term),
        "dc:conformsTo",
        qb.ll(WorkspaceTerms[term].source),
        WorkspaceTerms[term].source.length > 0
      );
    vExport += tExport;
  }

  return new Blob([vExport], { type: fileID });
}
