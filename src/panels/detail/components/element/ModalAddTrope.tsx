import classNames from "classnames";
import * as _ from "lodash";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Form,
  InputGroup,
  ListGroup,
  Modal,
  Tab,
  Tabs,
} from "react-bootstrap";
import { Flags } from "../../../../components/LanguageSelector";
import { ElemCreationStrategy, LinkType } from "../../../../config/Enum";
import { Languages } from "../../../../config/Languages";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { createTerm } from "../../../../function/FunctionCreateElem";
import { createNewElemIRI } from "../../../../function/FunctionCreateVars";
import { highlightElement } from "../../../../function/FunctionDiagram";
import {
  drawGraphElement,
  getListClassNamesObject,
  redrawElement,
} from "../../../../function/FunctionDraw";
import {
  initLanguageObject,
  parsePrefix,
  trimLanguageObjectInput,
} from "../../../../function/FunctionEditVars";
import { getElementPosition } from "../../../../function/FunctionElem";
import {
  getLabelOrBlank,
  getNewLink,
  getVocabularyFromScheme,
  isTermReadOnly,
} from "../../../../function/FunctionGetVars";
import { updateConnection } from "../../../../function/FunctionLink";
import { graph } from "../../../../graph/Graph";
import { ListLanguageControls } from "../items/ListLanguageControls";

interface Props {
  modalTropes: boolean;
  hideModal: Function;
  selectedLanguage: string;
  performTransaction: (...queries: string[]) => void;
  update: Function;
  id: string;
}

export const ModalAddTrope: React.FC<Props> = (props: Props) => {
  const [input, setInput] = useState<{ [key: string]: string }>({});
  const [activatedInputs, setActivatedInputs] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string>("new");
  const [selectedTrope, setSelectedTrope] = useState<string>("");
  const [availableTropes, setAvailableTropes] = useState<string[]>([]);
  const [vocabulary, setVocabulary] = useState<string>("");
  const [error, setError] = useState<string>(
    Locale[AppSettings.interfaceLanguage].modalNewElemError
  );

  useEffect(() => {
    if (!vocabulary) return;
    const s = WorkspaceVocabularies[vocabulary].glossary;
    const i = input;
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
                  (elem) => WorkspaceElements[elem].active && elem === iri
                )) ||
              Object.values(WorkspaceTerms[iri].labels).find(
                (label) =>
                  label.trim().toLowerCase() === name.trim().toLowerCase()
              )
          ) !== undefined
      );
    };
    let errorText = "";
    if (i[AppSettings.canvasLanguage] === "") {
      errorText = Locale[AppSettings.interfaceLanguage].modalNewElemError;
    } else if (Object.values(i).find((name) => checkExists(s, name))) {
      errorText = Locale[AppSettings.interfaceLanguage].modalNewElemExistsError;
    } else if (
      Object.values(i).find(
        (name) => name && (name.length < 2 || name.length > 150)
      )
    ) {
      errorText = Locale[AppSettings.interfaceLanguage].modalNewElemLengthError;
    } else if (
      createNewElemIRI(s, i[AppSettings.canvasLanguage]) ===
      WorkspaceVocabularies[getVocabularyFromScheme(s)].namespace
    ) {
      errorText =
        Locale[AppSettings.interfaceLanguage].modalNewElemCharacterError;
    }
    setError(errorText);
  }, [input, vocabulary]);

  const getUnusedTropes: () => string[] = () => {
    return Object.keys(WorkspaceTerms)
      .filter((term) =>
        WorkspaceTerms[term].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      )
      .filter((t) => !isTermReadOnly(t))
      .filter(
        (t) =>
          !Object.keys(WorkspaceLinks).find(
            (l) =>
              WorkspaceLinks[l].source === t || WorkspaceLinks[l].target === t
          )
      );
  };

  const save = () => {
    if (activeKey === "new") {
      props.performTransaction(
        ...createTerm(
          trimLanguageObjectInput(input),
          getVocabularyFromScheme(WorkspaceTerms[props.id].inScheme),
          ElemCreationStrategy.INTRINSIC_TROPE_TYPE,
          getElementPosition(props.id),
          [props.id]
        )
      );
      const elem = graph.getElements().find((elem) => elem.id === props.id);
      if (elem) {
        drawGraphElement(
          elem,
          props.selectedLanguage,
          AppSettings.representation
        );
        highlightElement(props.id);
      }
      props.update();
    }
    if (activeKey === "existing") {
      const link = getNewLink(LinkType.DEFAULT);
      props.performTransaction(
        ...updateConnection(
          props.id,
          selectedTrope,
          link.id as string,
          LinkType.DEFAULT,
          parsePrefix("z-sgov-pojem", "má-vlastnost"),
          true
        )
      );
      redrawElement(props.id, props.selectedLanguage);
    }
    props.hideModal();
  };

  const isDisabled: () => boolean = () => {
    if (activeKey === "new") return !!error;
    if (activeKey === "exist") return !selectedTrope;
    return true;
  };

  return (
    <Modal
      show={props.modalTropes}
      onEntering={() => {
        if (!vocabulary) {
          const vocab = Object.keys(WorkspaceVocabularies).find(
            (vocab) => !WorkspaceVocabularies[vocab].readOnly
          );
          if (!vocab) props.hideModal();
          else setVocabulary(vocab);
        }
        setError(Locale[AppSettings.interfaceLanguage].modalNewElemError);
        setInput(initLanguageObject(""));
        setActivatedInputs([props.selectedLanguage]);
        setAvailableTropes(getUnusedTropes());
        setSelectedTrope("");
      }}
      centered
      keyboard
      onEscapeKeyDown={() => props.hideModal()}
      onHide={() => props.hideModal()}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {Locale[AppSettings.interfaceLanguage].assignTropeHeader}
          {getLabelOrBlank(
            WorkspaceTerms[props.id].labels,
            props.selectedLanguage
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          defaultActiveKey={"0"}
          activeKey={activeKey}
          onSelect={(key) => setActiveKey(key as string)}
        >
          <Tab
            title={Locale[AppSettings.interfaceLanguage].createTrope}
            eventKey={"new"}
          >
            <br />
            <p>
              {Locale[AppSettings.interfaceLanguage].modalNewTropeDescription}
            </p>
            {activatedInputs.map((lang, i) => (
              <InputGroup>
                <InputGroup.Text>
                  <img
                    className="flag"
                    src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${Flags[lang]}.svg`}
                    alt={Languages[lang]}
                  />
                  {lang === AppSettings.canvasLanguage ? "*" : ""}
                </InputGroup.Text>
                <Form.Control
                  value={input[lang]}
                  className={classNames(
                    getListClassNamesObject(activatedInputs, i)
                  )}
                  placeholder={Languages[lang]}
                  onChange={(event) => {
                    setInput((prev) => ({
                      ...prev,
                      [lang]: event.target.value,
                    }));
                  }}
                />
              </InputGroup>
            ))}
            <ListLanguageControls
              removeAction={() => {
                const removeLang = _.last(activatedInputs);
                setInput((prev) => ({
                  ...prev,
                  [removeLang!]: "",
                }));
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
            {!error && (
              <Alert variant={"primary"}>{`${
                Locale[AppSettings.interfaceLanguage].modalNewElemIRI
              }
					${createNewElemIRI(
            WorkspaceVocabularies[vocabulary].glossary,
            input[AppSettings.defaultLanguage]
          )}`}</Alert>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
          </Tab>
          <Tab
            title={Locale[AppSettings.interfaceLanguage].assignExistingTrope}
            eventKey={"exist"}
          >
            <p />
            {availableTropes.length === 0 && (
              <Alert variant="warning">
                {Locale[AppSettings.interfaceLanguage].noExistingTropes}
              </Alert>
            )}
            <div className="tropeList">
              <ListGroup>
                {availableTropes.map((t) => (
                  <ListGroup.Item
                    action
                    variant="light"
                    active={t === selectedTrope}
                    onClick={() => {
                      setSelectedTrope(t);
                    }}
                  >
                    {getLabelOrBlank(
                      WorkspaceTerms[t].labels,
                      props.selectedLanguage
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
            {!selectedTrope && availableTropes.length > 0 && (
              <Alert variant="danger">
                {Locale[AppSettings.interfaceLanguage].mustAssignTropeConfirm}
              </Alert>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.hideModal()}>
          {Locale[AppSettings.interfaceLanguage].close}
        </Button>
        <Button
          variant="primary"
          disabled={isDisabled()}
          onClick={() => save()}
        >
          {Locale[AppSettings.interfaceLanguage].assignTropeConfirm}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
