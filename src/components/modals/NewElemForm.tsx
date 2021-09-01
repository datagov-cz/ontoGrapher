import { Locale } from "../../config/Locale";
import {
  AppSettings,
  Languages,
  PackageRoot,
  WorkspaceElements,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../config/Variables";
import { Alert, Form, InputGroup } from "react-bootstrap";
import { getVocabularyFromScheme } from "../../function/FunctionGetVars";
import { createNewElemIRI } from "../../function/FunctionCreateVars";
import React from "react";
import { initLanguageObject } from "../../function/FunctionEditVars";
import { PackageNode } from "../../datatypes/PackageNode";

interface Props {
  lockPackage: boolean;
  projectLanguage: string;
  termName: ReturnType<typeof initLanguageObject>;
  selectedPackage: PackageNode;
  errorText: string;
  setTermName: (s: string, l: string) => void;
  setSelectedPackage: (p: PackageNode) => void;
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
    if (names[AppSettings.selectedLanguage] === "") {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemError;
    } else if (Object.values(names).find((name) => checkExists(scheme, name))) {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemExistsError;
    } else if (
      Object.values(names).find(
        (name) => name && (name.length < 2 || name.length > 150)
      )
    ) {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemLengthError;
    } else if (
      createNewElemIRI(scheme, names[AppSettings.selectedLanguage]) ===
      WorkspaceVocabularies[getVocabularyFromScheme(scheme)].namespace
    ) {
      errorText = Locale[AppSettings.viewLanguage].modalNewElemCharacterError;
    }
    return errorText;
  };

  const handleChangeSelect = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const pkg = PackageRoot.children.find(
      (pkg) => pkg.labels[props.projectLanguage] === event.currentTarget.value
    );
    if (pkg) props.setSelectedPackage(pkg);
    props.setErrorText(
      checkNames(props.selectedPackage.scheme, props.termName)
    );
  };

  return (
    <div>
      <p>{Locale[AppSettings.viewLanguage].modalNewElemDescription}</p>
      {Object.keys(Languages).map((lang) => (
        <div key={lang}>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id={"inputGroupPrepend" + lang}>
                {Languages[lang] +
                  (lang === AppSettings.selectedLanguage ? "*" : "")}
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
                  checkNames(props.selectedPackage.scheme, props.termName)
                );
              }}
            />
          </InputGroup>
        </div>
      ))}
      <br />
      <Form.Group controlId="exampleForm.ControlSelect1">
        <Form.Label>
          {Locale[AppSettings.viewLanguage].selectPackage}
        </Form.Label>
        <Form.Control
          as="select"
          value={props.selectedPackage.labels[props.projectLanguage]}
          onChange={(event) => handleChangeSelect(event)}
          disabled={props.lockPackage}
        >
          {PackageRoot.children
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
          Locale[AppSettings.viewLanguage].modalNewElemIRI
        }
					${createNewElemIRI(
            props.selectedPackage.scheme,
            props.termName[AppSettings.defaultLanguage]
          )}`}</Alert>
      )}
      {props.errorText && <Alert variant="danger">{props.errorText}</Alert>}
    </div>
  );
};
