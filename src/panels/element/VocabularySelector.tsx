import React from "react";
import Select from "react-select";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import {
  AppSettings,
  PackageRoot,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { CacheSearchVocabularies } from "../../datatypes/CacheSearchResults";
import { Locale } from "../../config/Locale";

interface Props {
  filter: (schemes: string[]) => void;
  values: { label: string; value: string }[];
  projectLanguage: string;
}

interface State {}

export class VocabularySelector extends React.Component<Props, State> {
  buildOptions(): {
    label: string;
    options: { value: string; label: string }[];
  }[] {
    const existingOptions = Object.keys(WorkspaceVocabularies)
      .filter((scheme) =>
        PackageRoot.children.find(
          (pkg) => getVocabularyFromScheme(pkg.scheme) === scheme
        )
      )
      .map((scheme) => {
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
    const existing = { label: "Ze seznamu", options: existingOptions };
    const other = { label: "Ostatní slovníky", options: otherOptions };
    return [existing, other];
  }

  render() {
    return (
      <Select
        isMulti={true}
        isSearchable={true}
        className={"luceneSelect"}
        options={this.buildOptions()}
        placeholder={
          Locale[AppSettings.viewLanguage].filterVocabulariesPlaceholder
        }
        value={this.props.values}
        onChange={(value) =>
          // @ts-ignore
          this.props.filter(value.map((value) => value.value))
        }
      />
    );
  }
}
