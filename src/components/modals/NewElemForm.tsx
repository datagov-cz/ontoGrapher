import { Locale } from "../../config/Locale";
import {
  AppSettings,
  FolderRoot,
  Languages,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Alert, Form, InputGroup } from "react-bootstrap";
import { getVocabularyFromScheme } from "../../function/FunctionGetVars";
import { createNewElemIRI } from "../../function/FunctionCreateVars";
import React from "react";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { VocabularyNode } from "../../datatypes/VocabularyNode";

interface Props {
  lockVocabulary: boolean;
  projectLanguage: string;
  termName: ReturnType<typeof initLanguageObject>;
  selectedVocabulary: VocabularyNode;
  errorText: string;
  setTermName: (s: string, l: string) => void;
  setSelectedVocabulary: (p: VocabularyNode) => void;
  setErrorText: (s: string) => void;
}

export const NewElemForm: React.FC<Props> = (props) => {
  const checkExists: (scheme: string, name: string) => boolean = (
    scheme: string,
    name: string
  ) => {
    const newIRI = createNewElemIRI(scheme, name);
    return (
      Object.keys(WorkspaceTerms)
        .filter((iri) => WorkspaceTerms[iri].inScheme === scheme)
        .find(
          (iri) =>
            (iri === newIRI &&
              Object.keys(WorkspaceElements).find(
                (elem) =>
                  WorkspaceElements[elem].active &&
                  WorkspaceElements[elem].iri === iri
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
    if (names[AppSettings.canvasLanguage] === "") {
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
      createNewElemIRI(scheme, names[AppSettings.canvasLanguage]) ===
      WorkspaceVocabularies[getVocabularyFromScheme(scheme)].namespace
    ) {
      errorText =
        Locale[AppSettings.interfaceLanguage].modalNewElemCharacterError;
    }
    return errorText;
  };

  const handleChangeSelect = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const pkg = FolderRoot.children.find(
      (pkg) => pkg.labels[props.projectLanguage] === event.currentTarget.value
    );
    if (pkg) props.setSelectedVocabulary(pkg);
    props.setErrorText(
      checkNames(props.selectedVocabulary.scheme, props.termName)
    );
  };

  return (
    <div>
      <p>{Locale[AppSettings.interfaceLanguage].modalNewElemDescription}</p>
      {Object.keys(Languages).map((lang) => (
        <div key={lang}>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id={"inputGroupPrepend" + lang}>
                {Languages[lang] +
                  (lang === AppSettings.canvasLanguage ? "*" : "")}
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              id={"newElemLabelInput" + lang}
              type="text"
              value={props.termName[lang]}
              required={lang === AppSettings.defaultLanguage}
              onChange={(event) => {
                props.setTermName(event.currentTarget.value, lang);
                props.setErrorText(
                  checkNames(props.selectedVocabulary.scheme, props.termName)
                );
              }}
            />
          </InputGroup>
        </div>
      ))}
      <br />
      <Form.Group controlId="exampleForm.ControlSelect1">
        <Form.Label>
          {Locale[AppSettings.interfaceLanguage].selectVocabulary}
        </Form.Label>
        <Form.Control
          as="select"
          value={props.selectedVocabulary.labels[props.projectLanguage]}
          onChange={(event) => handleChangeSelect(event)}
          disabled={props.lockVocabulary}
        >
          {FolderRoot.children
            .filter(
              (pkg) =>
                !WorkspaceVocabularies[getVocabularyFromScheme(pkg.scheme)]
                  .readOnly
            )
            .map((pkg, i) => (
              <option key={i} value={pkg.labels[props.projectLanguage]}>
                {pkg.labels[props.projectLanguage]}
              </option>
            ))}
        </Form.Control>
      </Form.Group>
      {!props.errorText && (
        <Alert variant={"primary"}>{`${
          Locale[AppSettings.interfaceLanguage].modalNewElemIRI
        }
					${createNewElemIRI(
            props.selectedVocabulary.scheme,
            props.termName[AppSettings.defaultLanguage]
          )}`}</Alert>
      )}
      {props.errorText && <Alert variant="danger">{props.errorText}</Alert>}
    </div>
  );
};
