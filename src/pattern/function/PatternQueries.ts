import { Instances, Patterns } from "./PatternTypes";
import { processQuery } from "../../interface/TransactionInterface";
import { Environment } from "../../config/Environment";
import { parsePrefix } from "../../function/FunctionEditVars";
import { LinkType } from "../../config/Enum";
import { AppSettings } from "../../config/Variables";
import { INSERT } from "@tpluscode/sparql-builder";
import { produceOttrInstance, produceOttrPattern } from "./FunctionPattern";
import { qb } from "../../queries/QueryBuilder";

export async function sendPattern(iri: string): Promise<boolean> {
  return await fetch(`${Environment.pattern}/update`, {
    method: "POST",
    body: encodeURIComponent(
      qb.constructQuery(INSERT.DATA`${produceOttrPattern(iri)}`.build())
    ),
  }).then((r) => r.ok);
}

export async function sendInstance(iri: string): Promise<boolean> {
  return await fetch(`${Environment.pattern}/update`, {
    method: "POST",
    body: qb.constructQuery(INSERT.DATA`${produceOttrInstance(iri)}`.build()),
  }).then((r) => r.ok);
}

export async function retrievePatternAndInstanceData(): Promise<boolean> {
  const patterns = await retrievePatterns();
  Object.assign(Patterns, patterns);
  const instances = await retrieveInstances();
  Object.assign(Instances, instances);
  console.log(patterns, instances);
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
    "?pattern ottr:parameters ?parameterList.",
    "?parameterList rdf:rest*/rdf:first ?parameter.",
    "optional {",
    "?parameter ottr:type ?type",
    "filter(!isBlank(?type))",
    "}",
    "optional {",
    "?parameter ottr:type ?multipleList.",
    "?multipleList rdf:rest*/rdf:first ?multipleType.",
    "filter(?multipleType not in (ottr:NEList))",
    "}",
    "?parameter ottr:variable ?variable.",
    "optional {?parameter ottr:modifier ?optional}",
    "?pattern ottr:pattern ?internalPattern.",
    "?internalPattern ottr:of ?internalPatternType.",
    "?internalPattern ottr:values (",
    "?internalPattern1 ?internalPattern2 ?internalPattern3",
    ").",
    "optional {?internalPattern ottr:modifier ?internalPatternModifier}",
    iris ? "values ?pattern {<" + iris.join("> <") + ">}" : "",
    "}",
  ].join(`
  `);
  await processQuery(`${Environment.pattern}/query`, qb.constructQuery(query))
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
        if (!(iri in parameters)) parameters[iri] = {};
        const type = result.type
          ? result.type.value
          : result.multipleType.value;
        parameters[iri][result.variable.value] = {
          type: type === parsePrefix("ottr", "IRI") ? "" : type,
          optional: !!result.optional,
          multiple: !!result.multipleList,
        };
        if (!(iri in internalPatterns)) internalPatterns[iri] = [];
        internalPatterns[iri].push({
          s: result.internalPattern1.value,
          p: result.internalPattern2.value,
          o: result.internalPattern3.value,
        });
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
    terms[pattern] = {};
    conns[pattern] = {};
    for (const triple of Object.values(internalPatterns[pattern])) {
      if (triple.o === parsePrefix("og", "term"))
        terms[pattern][triple.s] = {
          name: "",
          types: [""],
          parameter: true,
          optional: parameters[pattern][triple.s].optional,
          multiple: parameters[pattern][triple.s].multiple,
        };
      if (triple.o === parsePrefix("og", "conn"))
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
        if (triple.s in terms[pattern])
          terms[pattern][triple.s].types = [triple.o];
      if (triple.p === parsePrefix("og", "name")) {
        if (triple.s in terms[pattern])
          terms[pattern][triple.s].name = triple.o;
        if (triple.s in conns[pattern])
          conns[pattern][triple.s].name = triple.o;
      }
      if (triple.p === parsePrefix("og", "sc")) {
        conns[pattern][triple.s].sourceCardinality = triple.o;
      }
      if (triple.p === parsePrefix("og", "tc")) {
        conns[pattern][triple.s].targetCardinality = triple.o;
      }
      if (triple.p === parsePrefix("og", "linkType")) {
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
  debugger;
  const instances: typeof Instances = {};
  const query1 = [
    "select ?instance ?pattern ?context ?x ?y ?name where {",
    "?instance ottr:of ?pattern.",
    "?instance og:context ?context.",
    "?instance og:position-x ?x.",
    "?instance og:position-y ?y.",
    "?instance og:name ?names.",
    "optional {?names rdf:rest*/rdf:first ?name}",
    iris ? "values ?instance {<" + iris.join("> <") + ">}" : "",
    "}",
  ].join(`
  `);
  const names: { [key: string]: string[] } = {};
  const things: { [key: string]: string[] } = {};
  await processQuery(`${Environment.pattern}/query`, qb.constructQuery(query1))
    .then((r) => r.json())
    .then((data) => {
      for (const result of data.results.bindings) {
        if (result.context.value !== AppSettings.contextIRI) continue;
        if (!(result.pattern.value in Patterns)) continue;
        if (!(result.instance.value in instances)) {
          instances[result.instance.value] = {
            x: parseInt(result.x.value, 10),
            y: parseInt(result.y.value, 10),
            iri: result.pattern.value,
            terms: {},
            conns: {},
          };
          names[result.instance.value] = [];
          things[result.instance.value] = [];
        }
        if (result.name) {
          names[result.instance.value].push(result.name.value);
          if (
            !(result.name.value in instances[result.instance.value].terms) &&
            result.name.value in Patterns[result.pattern.value].terms
          )
            instances[result.instance.value].terms[result.name.value] = [];
          if (
            !(result.name.value in instances[result.instance.value].conns) &&
            result.name.value in Patterns[result.pattern.value].conns
          )
            instances[result.instance.value].conns[result.name.value] = [];
        }
      }
    });
  const query2 = [
    "select distinct ?instance ?valueMember where {",
    "?instance ottr:values ?value.",
    "optional {?value rdf:rest*/rdf:first ?valueMember}",
    "values ?instance {<" + Object.keys(instances).join("> <") + ">}",
    "}",
  ].join(`
  `);
  await processQuery(`${Environment.pattern}/query`, qb.constructQuery(query2))
    .then((r) => r.json())
    .then((data) => {
      for (const result of data.results.bindings) {
        if (result.valueMember) {
          things[result.instance.value].push(result.valueMember.value);
        }
      }
    });
  for (const instance of Object.keys(instances)) {
    if (
      Object.values(things[instance]).length !==
      Object.values(names[instance]).length
    ) {
      delete instances[instance];
      continue;
    }
    for (const thing of things[instance]) {
      const index = things[instance].indexOf(thing);
      const name = names[instance][index];
      if (name in Patterns[instances[instance].iri].terms)
        instances[instance].terms[name].push(thing);
      if (name in Patterns[instances[instance].iri].conns)
        instances[instance].conns[name].push(thing);
    }
  }
  return instances;
}
