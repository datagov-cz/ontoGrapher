import React, { useState } from "react";
import {
  Modal,
  Tabs,
  Tab,
  InputGroup,
  Form,
  Button,
  ListGroup,
} from "react-bootstrap";
import { Flags } from "../../../../components/LanguageSelector";
import { ElemCreationStrategy, LinkType } from "../../../../config/Enum";
import { Languages } from "../../../../config/Languages";
import {
  AppSettings,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { createTerm } from "../../../../function/FunctionCreateElem";
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
  getNewLink,
  getVocabularyFromScheme,
} from "../../../../function/FunctionGetVars";
import { updateConnection } from "../../../../function/FunctionLink";
import { getLabelOrBlank } from "../../../../function/FunctionGetVars";
import { graph } from "../../../../graph/Graph";
import { ListLanguageControls } from "../ListLanguageControls";
import { Locale } from "../../../../config/Locale";
import classNames from "classnames";

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
  const [error, setError] = useState<string>(
    Locale[AppSettings.interfaceLanguage].modalNewElemError
  );

  const getUnusedTropes: () => string[] = () => {
    return Object.keys(WorkspaceTerms)
      .filter((term) =>
        WorkspaceTerms[term].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      )
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
  return (
    <Modal
      show={props.modalTropes}
      onEntering={() => {
        setInput(initLanguageObject(""));
        setActivatedInputs([props.selectedLanguage]);
        setAvailableTropes(getUnusedTropes());
      }}
      centered
      keyboard
      onEscapeKeyDown={() => props.hideModal()}
      onHide={() => props.hideModal()}
    >
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          defaultActiveKey={"0"}
          activeKey={activeKey}
          onSelect={(key) => setActiveKey(key as string)}
        >
          <Tab eventKey={"new"} title={"new"}>
            <p>Jméno pro novou vlastnost</p>
            {activatedInputs.map((lang, i) => (
              <InputGroup>
                <InputGroup.Text>
                  <img
                    className="flag"
                    src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${Flags[lang]}.svg`}
                    alt={Languages[lang]}
                  />
                </InputGroup.Text>
                <Form.Control
                  value={input[lang]}
                  className={classNames(
                    getListClassNamesObject(activatedInputs, i)
                  )}
                  placeholder={Languages[lang]}
                  onChange={(event) =>
                    setInput((prev) => ({
                      ...prev,
                      [i]: event.currentTarget.value,
                    }))
                  }
                />
              </InputGroup>
            ))}
            <ListLanguageControls
              removeAction={() => {}}
              tooltipText={""}
              unfilledLanguages={Object.keys(Languages).filter(
                (l) => !activatedInputs.includes(l)
              )}
              addLanguageInput={(lang: string) =>
                setActivatedInputs((prev) => [...prev, lang])
              }
            />
          </Tab>
          <Tab eventKey={"existing"} title={"exist"}>
            <p>Jméno pro novou vlastnost</p>
            <ListGroup className="tropeList">
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
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.hideModal()}>
          Close
        </Button>
        <Button variant="primary" onClick={() => save()}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
