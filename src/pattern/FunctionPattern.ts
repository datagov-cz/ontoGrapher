import { Patterns } from "./PatternTypes";

export function produceOttrPattern(pattern: string) {
  return [
    `<${pattern}> a ottr:Pattern.`,
    `<${pattern}> skos:prefLabel "${Patterns[pattern].title}".`,
    `<${pattern}> dc:creator "${Patterns[pattern].author}".`,
    `<${pattern}> pav:createdOn "${Patterns[pattern].date}"^xsd:dateTime.`,
    `<${pattern}> dc:description "${Patterns[pattern].description}".`,
    `<${pattern}> ottr:parameters (`,
    ...Object.keys(Patterns[pattern].terms)
      .filter((t) => Patterns[pattern].terms[t].parameter)
      .map((t) =>
        [
          "[",
          Patterns[pattern].terms[t].multiple
            ? `ottr:type (ottr:NEList ${
                Patterns[pattern].terms[t].types.length > 0
                  ? `<${Patterns[pattern].terms[t].types[0]}>`
                  : "ottr:IRI"
              })`
            : "",
          !Patterns[pattern].terms[t].multiple
            ? `ottr:type ${
                Patterns[pattern].terms[t].types.length > 0
                  ? `<${Patterns[pattern].terms[t].types[0]}>`
                  : "ottr:IRI"
              };`
            : "",
          Patterns[pattern].terms[t].optional
            ? "ottr:modifier ottr:optional;"
            : "",
          `ottr:variable _:b${t}]`,
        ].join("")
      ),
    ...Object.keys(Patterns[pattern].terms)
      .filter((t) => !Patterns[pattern].terms[t].parameter)
      .map((t) =>
        ["[", `ottr:type xsd:string;`, `ottr:variable _:b${t}]`].join("")
      ),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return ["[", `ottr:type xsd:string;`, `ottr:variable _:b${c}]`].join("");
    }),
    ");",
    ...Object.keys(Patterns[pattern].terms).map((t) =>
      [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${t} a og:term)`,
        "];",
      ].join("")
    ),
    ...Object.keys(Patterns[pattern].terms).map((t) =>
      [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${t} og:name "${Patterns[pattern].terms[t].name}")`,
        "];",
      ].join("")
    ),
    ...Object.keys(Patterns[pattern].terms)
      .filter((t) => Patterns[pattern].terms[t].types.length > 0)
      .map((t) =>
        [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${t} a "${Patterns[pattern].terms[t].types[0]}")`,
          "];",
        ].join("")
      ),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${c} a og:conn)`,
        "];",
      ].join("");
    }),
    ...Object.keys(Patterns[pattern].conns).map((c) => {
      return [
        "ottr:pattern [ottr:of ottr:Triple;",
        `ottr:values (_:b${c} og:name "${Patterns[pattern].conns[c].name}")`,
        "];",
      ].join("");
    }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:from _:${Patterns[pattern].conns[c].from})`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:to _:${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (_:b${c} og:from _:b${Patterns[pattern].conns[c].from}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:to _:b${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          !Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:from _:b${Patterns[pattern].conns[c].from}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (_:b${c} og:to _:b${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          !Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (_:b${c} og:from _:b${Patterns[pattern].conns[c].from}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          "ottr:modifier ottr:cross;",
          `ottr:values (_:b${c} og:to _:b${Patterns[pattern].conns[c].to})`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:sc "${Patterns[pattern].conns[c].sourceCardinality}")`,
          "];",
        ].join("");
      }),
    ...Object.keys(Patterns[pattern].conns)
      .filter(
        (c) =>
          Patterns[pattern].terms[Patterns[pattern].conns[c].to].multiple &&
          Patterns[pattern].terms[Patterns[pattern].conns[c].from].multiple
      )
      .map((c) => {
        return [
          "ottr:pattern [ottr:of ottr:Triple;",
          `ottr:values (_:b${c} og:tc "${Patterns[pattern].conns[c].targetCardinality}")`,
          "];",
        ].join("");
      }),
  ].join("");
}
