import React from "react";
import Select from "react-select";
import { AppSettings, WorkspaceTerms } from "../../../config/Variables";
import { Locale } from "../../../config/Locale";
import { parsePrefix } from "../../../function/FunctionEditVars";
import { getLabelOrBlank } from "../../../function/FunctionGetVars";

type Props = {
  projectLanguage: string;
  iri: string;
  tropes: string[];
  handleChange: Function;
};

export const IntrinsicTropeTableSelect: React.FC<Props> = (props) => {
  const buildOptions: () => { label: string; value: string }[] = () => {
    return Object.keys(WorkspaceTerms)
      .filter((iri) =>
        WorkspaceTerms[iri].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      )
      .filter(
        (iri) =>
          WorkspaceTerms[iri].inScheme === WorkspaceTerms[props.iri].inScheme
      )
      .filter((iri) => !props.tropes.includes(iri))
      .map((iri) => {
        return {
          label: getLabelOrBlank(
            WorkspaceTerms[iri].labels,
            props.projectLanguage
          ),
          value: iri,
        };
      });
  };

  return (
    <Select
      isSearchable={true}
      className={"qualityTableSelect"}
      placeholder={Locale[AppSettings.viewLanguage].selectTropeTypePlaceholder}
      value={null}
      styles={{
        container: (base) => ({
          ...base,
          height: 30,
          minHeight: 30,
          fontSize: 12,
          padding: 0,
        }),
        control: (base) => ({
          ...base,
          height: 30,
          minHeight: 30,
          fontSize: 12,
          padding: 0,
        }),
        indicatorsContainer: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
          height: 25,
          minHeight: 25,
        }),
        indicatorSeparator: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
          height: 28,
          minHeight: 28,
        }),
        valueContainer: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
        }),
      }}
      options={buildOptions()}
      // @ts-ignore
      onChange={(value) => props.handleChange(value.value)}
    />
  );
};
