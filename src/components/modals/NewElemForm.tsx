import classNames from "classnames";
import * as _ from "lodash";
import React, { useEffect, useState } from "react";
import { Alert, Form, InputGroup } from "react-bootstrap";
import Select, { SingleValue } from "react-select";
import { Environment } from "../../config/Environment";
import { LanguageObject, Languages } from "../../config/Languages";
import { Locale } from "../../config/Locale";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { createNewElemIRI } from "../../function/FunctionCreateVars";
import { getListClassNamesObject } from "../../function/FunctionDraw";
import { initLanguageObject } from "../../function/FunctionEditVars";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
} from "../../function/FunctionGetVars";
import { en } from "../../locale/en";
import { ListLanguageControls } from "../../panels/detail/components/items/ListLanguageControls";
import { Flags } from "../LanguageSelector";

interface Props {
  termName: LanguageObject;
  selectedVocabulary: string;
  errorText: string;
  setTermName: (s: string, l: string) => void;
  setSelectedVocabulary?: (p: string) => void;
  setErrorText: (s: string) => void;
  newElemDescription?: keyof typeof en;
}

export const NewElemForm: React.FC<Props> = (props) => {
  const [activatedInputs, setActivatedInputs] = useState<string[]>([]);

  useEffect(() => {
    setActivatedInputs([Environment.language]);
  }, []);

  const checkExists: (scheme: string, name: string) => boolean = (
    scheme: string,
    name: string
  ) => {
    const newIRI = createNewElemIRI(scheme, name);
    return (
      Object.keys(WorkspaceTerms)
        .filter(
          (iri) =>
            WorkspaceTerms[iri].inScheme === scheme &&
            WorkspaceElements[iri].active
        )
        .find(
          (iri) =>
            (iri === newIRI &&
              Object.keys(WorkspaceElements).find(
                (elem) => WorkspaceElements[elem].active && elem === iri
              )) ||
            Object.values(WorkspaceTerms[iri].labels).find(
              (label) =>
                label.trim().toLowerCase() === name.trim().toLowerCase()
            )
        ) !== undefined
    );
  };

  const checkNames = (
    scheme: string,
    names: ReturnType<typeof initLanguageObject>
  ) => {
    let errorText = "";
    if (names[Environment.language] === "") {
      errorText = Locale[AppSettings.interfaceLanguage].modalNewElemError;
    } else if (Object.values(names).find((name) => checkExists(scheme, name))) {
      errorText = Locale[AppSettings.interfaceLanguage].modalNewElemExistsError;
    } else if (
      Object.values(names).find(
        (name) => name && (name.length < 2 || name.length > 150)
      )
    ) {
      errorText = Locale[AppSettings.interfaceLanguage].modalNewElemLengthError;
    } else if (
      createNewElemIRI(scheme, names[Environment.language]) ===
      WorkspaceVocabularies[getVocabularyFromScheme(scheme)].namespace
    ) {
      errorText =
        Locale[AppSettings.interfaceLanguage].modalNewElemCharacterError;
    }
    return errorText;
  };

  const handleChangeSelect = (
    option: SingleValue<{ value: string; label: string }>
  ) => {
    if (!option) return;
    const pkg = Object.keys(WorkspaceVocabularies).find(
      (pkg) => pkg === option.value
    );
    if (pkg && props.setSelectedVocabulary) {
      props.setSelectedVocabulary(pkg);
      props.setErrorText(
        checkNames(WorkspaceVocabularies[option.value].glossary, props.termName)
      );
    } else {
      console.error(`Vocabulary ${pkg} not found within the vocabulary list.`);
      props.setErrorText(
        checkNames(
          WorkspaceVocabularies[props.selectedVocabulary].glossary,
          props.termName
        )
      );
    }
  };

  return (
    <div>
      <p>
        {
          Locale[AppSettings.interfaceLanguage][
            props.newElemDescription ?? "modalNewElemDescription"
          ]
        }
      </p>
      {activatedInputs.map((lang, i) => (
        <InputGroup key={i}>
          <InputGroup.Text>
            <img
              className="flag"
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${Flags[lang]}.svg`}
              alt={Languages[lang]}
            />
            {lang === Environment.language && <strong>*</strong>}
          </InputGroup.Text>
          <Form.Control
            value={props.termName[lang]}
            className={classNames(getListClassNamesObject(activatedInputs, i))}
            placeholder={Languages[lang]}
            onChange={(event) => {
              props.setTermName(event.target.value, lang);
              props.setErrorText(
                checkNames(
                  WorkspaceVocabularies[props.selectedVocabulary].glossary,
                  { ...props.termName, [lang]: event.target.value }
                )
              );
            }}
          />
        </InputGroup>
      ))}
      <ListLanguageControls
        removeAction={() => {
          const removeLang = _.last(activatedInputs);
          props.setTermName("", removeLang!);
          setActivatedInputs((prev) => _.dropRight(prev, 1));
        }}
        tooltipText={Locale[AppSettings.interfaceLanguage].addLanguage}
        unfilledLanguages={Object.keys(Languages).filter(
          (l) => !activatedInputs.includes(l)
        )}
        addLanguageInput={(lang: string) =>
          setActivatedInputs((prev) => [...prev, lang])
        }
        disableAddControl={
          activatedInputs.length === Object.keys(Languages).length
        }
        disableRemoveControl={activatedInputs.length === 1}
      />
      <br />
      <Form.Group controlId="vocabularySelect">
        <Form.Label>
          {Locale[AppSettings.interfaceLanguage].selectVocabulary}
        </Form.Label>
        <Select
          isSearchable
          // isDisabled={
          //   !!!props.setSelectedVocabulary ||
          //   Object.keys(WorkspaceVocabularies).filter(
          //     (vocab) => !WorkspaceVocabularies[vocab].readOnly
          //   ).length <= 1
          // }
          options={Object.keys(WorkspaceVocabularies)
            .filter((vocab) => !WorkspaceVocabularies[vocab].readOnly)
            .map((vocab) => ({
              value: vocab,
              label: getLabelOrBlank(
                WorkspaceVocabularies[vocab].labels,
                AppSettings.canvasLanguage
              ),
            }))}
          value={{
            value: props.selectedVocabulary,
            label:
              props.selectedVocabulary in WorkspaceVocabularies
                ? getLabelOrBlank(
                    WorkspaceVocabularies[props.selectedVocabulary].labels,
                    AppSettings.canvasLanguage
                  )
                : "",
          }}
          onChange={(option) => handleChangeSelect(_.clone(option))}
        />
      </Form.Group>
      <br />
      {!props.errorText && (
        <Alert variant={"primary"}>{`${
          Locale[AppSettings.interfaceLanguage].modalNewElemIRI
        }
					${createNewElemIRI(
            WorkspaceVocabularies[props.selectedVocabulary].glossary,
            props.termName[Environment.language]
          )}`}</Alert>
      )}
      {props.errorText && <Alert variant="danger">{props.errorText}</Alert>}
    </div>
  );
};
