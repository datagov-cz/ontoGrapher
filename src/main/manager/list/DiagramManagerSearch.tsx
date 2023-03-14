import Select, { MultiValue } from "react-select";
import _ from "lodash";
import React from "react";
import { InputGroup, Form } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { AppSettings, WorkspaceVocabularies } from "../../../config/Variables";
import { getLabelOrBlank } from "../../../function/FunctionGetVars";
import SearchIcon from "@mui/icons-material/Search";

type VocabularyOptions = MultiValue<{
  label: string;
  value: string;
}>;

interface Props {
  search: string;
  setSearch: (search: string) => void;
  searchVocabularies: VocabularyOptions;
  setSearchVocabularies: (search: VocabularyOptions) => void;
  availableVocabularies: string[];
  projectLanguage: string;
}

export const DiagramManagerSearch: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <InputGroup>
        <InputGroup.Text className="top-item" id="inputGroupPrepend">
          <SearchIcon />
        </InputGroup.Text>
        <Form.Control
          className="top-item"
          type="search"
          id={"searchInput"}
          placeholder={Locale[AppSettings.interfaceLanguage].searchStereotypes}
          aria-describedby="inputGroupPrepend"
          value={props.search}
          onChange={(evt) => props.setSearch(evt.currentTarget.value)}
        />
      </InputGroup>
      <Select
        isMulti
        isSearchable
        noOptionsMessage={() => Locale[AppSettings.interfaceLanguage].noOptions}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            borderTopLeftRadius: "0",
            borderTopRightRadius: "0",
          }),
          multiValue: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: WorkspaceVocabularies[state.data.value].color,
            borderRadius: "10px",
          }),
        }}
        options={props.availableVocabularies.map((vocab) => {
          return {
            value: vocab,
            label: getLabelOrBlank(
              WorkspaceVocabularies[vocab].labels,
              props.projectLanguage
            ),
          };
        })}
        value={props.searchVocabularies}
        placeholder={
          Locale[AppSettings.interfaceLanguage].filterVocabulariesPlaceholder
        }
        onChange={(option) => props.setSearchVocabularies(_.clone(option))}
      />
    </div>
  );
};
