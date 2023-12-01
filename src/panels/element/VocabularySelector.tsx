import React from "react";
import Select from "react-select";
import { getLabelOrBlank } from "../../function/FunctionGetVars";
import { AppSettings, WorkspaceVocabularies } from "../../config/Variables";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { Locale } from "../../config/Locale";

interface Props {
  filter: (schemes: string[]) => void;
  values: { label: string; value: string }[];
  projectLanguage: string;
  availableVocabularies: string[];
  prepareToastCall: Function;
}

export class VocabularySelector extends React.Component<Props> {
  buildOptions(): {
    label: string;
    options: { value: string; label: string }[];
  }[] {
    const existingOptions = this.props.availableVocabularies.map((scheme) => {
      return {
        label: getLabelOrBlank(
          WorkspaceVocabularies[scheme].labels,
          this.props.projectLanguage
        ),
        value: scheme,
      };
    });
    const otherOptions = Object.keys(CacheSearchVocabularies).map((scheme) => {
      return {
        label: getLabelOrBlank(
          CacheSearchVocabularies[scheme].labels,
          this.props.projectLanguage
        ),
        value: scheme,
      };
    });
    const existing = {
      label: Locale[AppSettings.interfaceLanguage].fromList,
      options: existingOptions,
    };
    const other = {
      label: Locale[AppSettings.interfaceLanguage].otherVocabularies,
      options: otherOptions,
    };
    return [existing, other];
  }

  render() {
    return (
      <Select
        isMulti={true}
        isSearchable={true}
        noOptionsMessage={() => Locale[AppSettings.interfaceLanguage].noOptions}
        className={"luceneSelect"}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            borderTopLeftRadius: "0",
            borderTopRightRadius: "0",
          }),
        }}
        options={this.buildOptions()}
        placeholder={
          Locale[AppSettings.interfaceLanguage].filterVocabulariesPlaceholder
        }
        value={this.props.values}
        onChange={(value) => {
          this.props.filter(value.map((value) => value.value));
          this.props.prepareToastCall();
        }}
      />
    );
  }
}
