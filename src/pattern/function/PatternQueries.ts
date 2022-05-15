import { Instances, Patterns } from "./PatternTypes";
import { processQuery } from "../../interface/TransactionInterface";
import { Environment } from "../../config/Environment";
import { parsePrefix } from "../../function/FunctionEditVars";
import { LinkType } from "../../config/Enum";
import { AppSettings, WorkspaceTerms } from "../../config/Variables";

// export async function callSuggestionAlgorithm(): Promise<string[]> {
//   const ret = [];
//
//   return ret;
// }

export async function retrievePatternAndInstanceData(): Promise<boolean> {
  const patterns = await retrievePatterns();
  const instances = await retrieveInstances();
  Object.assign(Patterns, patterns);
  Object.assign(Instances, instances);
  return true;
}

export async function retrievePatterns(
  iris?: string[]
): Promise<typeof Patterns> {
  const patterns: typeof Patterns = {};
  const parameters: {
    [key: string]: {
      [key: string]: {
        type: string;
        optional: boolean;
        multiple: boolean;
      };
    };
  } = {};
  const internalPatterns: {
    [key: string]: {
      s: string;
      p: string;
      o: string;
    }[];
  } = {};
  const query = [
    "select distinct * where {",
    "?pattern a ottr:Pattern.",
    "?pattern skos:prefLabel ?title.",
    "?pattern dc:creator ?creator.",
    "optional {?pattern dc:description ?description}",
    "?pattern pav:createdOn ?creationDate.",
    "?pattern ottr:parameters (",
    "optional {",
    "?parameter ottr:type ?type",
    "}",
    "optional {",
    "?parameter ottr:type ( ?multiple ?type)",
    "}",
    "?parameter ottr:variable ?variable.",
    "optional {?parameter ottr:modifier ?optional}",
    ").",
    "?pattern ottr:pattern ?internalPattern.",
    "?internalPattern ottr:of ?internalPatternType",
    "?internalPattern ottr:values (",
    "?internalPattern1 ?internalPattern2 ?internalPattern3",
    ").",
    "optional {?internalPattern ottr:modifier ?internalPatternModifier}",
    iris ? "values ?pattern {<" + iris.join("> <") + ">}" : "",
    "}",
  ].join(`
  `);
  await processQuery(`${Environment.pattern}/query`, query)
    .then((r) => r.json())
    .then((data) => {
      for (const result of data.results.bindings) {
        const iri = result.pattern.value;
        if (!(iri in patterns)) {
          patterns[iri] = {
            title: "",
            author: "",
            date: "",
            description: "",
            terms: {},
            conns: {},
          };
        }
        patterns[iri].title = result.title.value;
        patterns[iri].author = result.creator.value;
        patterns[iri].date = result.creationDate.value;
        parameters[iri][result.variable.value] = {
          type: result.type.value,
          optional: !!result.optional,
          multiple: !!result.multiple,
        };
        internalPatterns[iri][result.internalPattern.value] = {
          s: result.internalPattern1.value,
          p: result.internalPattern2.value,
          o: result.internalPattern3.value,
        };
      }
    });
  const terms: {
    [key: string]: {
      [key: string]: {
        name: string;
        types: string[];
        parameter?: boolean;
        optional?: boolean;
        multiple?: boolean;
      };
    };
  } = {};
  const conns: {
    [key: string]: {
      [key: string]: {
        name: string;
        to: string;
        from: string;
        sourceCardinality: string;
        targetCardinality: string;
        linkType: LinkType;
      };
    };
  } = {};
  for (const pattern of Object.keys(patterns)) {
    for (const triple of Object.values(internalPatterns[pattern])) {
      if (triple.p === parsePrefix("og", "term"))
        terms[pattern][triple.s] = {
          name: "",
          types: [""],
          parameter: true,
          optional: parameters[pattern][triple.s].optional,
          multiple: parameters[pattern][triple.s].multiple,
        };
      if (triple.p === parsePrefix("og", "conn"))
        conns[pattern][triple.s] = {
          name: "",
          to: "",
          from: "",
          sourceCardinality: "0",
          targetCardinality: "0",
          linkType: 0,
        };
    }
  }
  for (const pattern of Object.keys(patterns)) {
    for (const triple of Object.values(internalPatterns[pattern])) {
      if (triple.p === parsePrefix("rdf", "type"))
        terms[pattern][triple.s].name = triple.o;
      if (triple.p === parsePrefix("og", "name")) {
        if (triple.s in terms) terms[pattern][triple.s].name = triple.o;
        if (triple.s in conns) conns[pattern][triple.s].name = triple.o;
      }
      if (triple.p === parsePrefix("og", "sc")) {
        conns[pattern][triple.s].sourceCardinality = triple.o;
      }
      if (triple.p === parsePrefix("og", "tc")) {
        conns[pattern][triple.s].targetCardinality = triple.o;
      }
      if (triple.p === parsePrefix("og", "type")) {
        conns[pattern][triple.s].linkType = parseInt(triple.o, 10);
      }
      if (triple.p === parsePrefix("og", "to")) {
        conns[pattern][triple.s].to = triple.o;
      }
      if (triple.p === parsePrefix("og", "from")) {
        conns[pattern][triple.s].from = triple.o;
      }
    }
  }
  for (const pattern of Object.keys(terms)) {
    patterns[pattern].terms = terms[pattern];
    patterns[pattern].conns = conns[pattern];
  }
  return patterns;
}

export async function retrieveInstances(
  iris?: string[]
): Promise<typeof Instances> {
  const instances: typeof Instances = {};
  const query = [
    "select distinct * where {",
    "?instance ottr:of ?pattern.",
    "?instance og:context ?context.",
    "?instance og:position-x ?x.",
    "?instance og:position-y ?y.",
    "ottr:values ( ?value )",
    "optional {?value rdf:rest*/rdf:first ?valueMember}",
    iris ? "values ?instance {<" + iris.join("> <") + ">}" : "",
    "}",
  ].join(`
  `);
  await processQuery(`${Environment.pattern}/query`, query)
    .then((r) => r.json())
    .then((data) => {
      for (const result of data.results.bindings) {
        if (result.context.value !== AppSettings.contextIRI) continue;
        if (!result.instance.value)
          instances[result.instance.value] = {
            x: parseInt(result.x.value, 10),
            y: parseInt(result.y.value, 10),
            iri: result.pattern.value,
            terms: {},
            conns: {},
          };
        if (result.valueMember) {
          if (
            result.valueMember.value in WorkspaceTerms &&
            WorkspaceTerms[result.valueMember.value].types.includes(
              parsePrefix("z-sgov-pojem", "typ-vztahu")
            )
          ) {
            instances[result.instance.value].conns[result.valueMember.value] =
              result.valueMember.value;
          }
          if (
            result.valueMember.value in WorkspaceTerms &&
            !WorkspaceTerms[result.valueMember.value].types.includes(
              parsePrefix("z-sgov-pojem", "typ-vztahu")
            )
          ) {
            instances[result.instance.value].terms[result.valueMember.value] =
              result.valueMember.value;
          }
        }
        if (
          result.value.value in WorkspaceTerms &&
          WorkspaceTerms[result.value.value].types.includes(
            parsePrefix("z-sgov-pojem", "typ-vztahu")
          )
        ) {
          instances[result.instance.value].conns[result.value.value] =
            result.value.value;
        }
        if (
          result.value.value in WorkspaceTerms &&
          !WorkspaceTerms[result.value.value].types.includes(
            parsePrefix("z-sgov-pojem", "typ-vztahu")
          )
        ) {
          instances[result.instance.value].terms[result.value.value] =
            result.value.value;
        }
      }
    });
  return instances;
}
