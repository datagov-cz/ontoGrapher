import React, { useState } from "react";
import {
  Alert,
  Button,
  Form,
  ListGroup,
  Modal,
  Tab,
  Tabs,
} from "react-bootstrap";
import { NewElemForm } from "../../../../components/modals/NewElemForm";
import { ElemCreationStrategy, Representation } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { CellColors } from "../../../../config/visual/CellColors";
import { createTerm } from "../../../../function/FunctionCreateElem";
import {
  drawGraphElement,
  highlightCells,
  redrawElement,
} from "../../../../function/FunctionDraw";
import {
  initLanguageObject,
  parsePrefix,
  trimLanguageObjectInput,
} from "../../../../function/FunctionEditVars";
import { getElementPosition } from "../../../../function/FunctionElem";
import { filterEquivalent } from "../../../../function/FunctionEquivalents";
import {
  getLabelOrBlank,
  getVocabularyFromScheme,
  isTermReadOnly,
} from "../../../../function/FunctionGetVars";
import { saveNewLink } from "../../../../function/FunctionLink";
import { graph } from "../../../../graph/Graph";
import { updateProjectElementDiagram } from "../../../../queries/update/UpdateElementQueries";

interface Props {
  modalTropes: boolean;
  hideModal: Function;
  selectedLanguage: string;
  performTransaction: (...queries: string[]) => void;
  update: Function;
  term: string;
}

export const ModalAddTrope: React.FC<Props> = (props: Props) => {
  const [input, setInput] = useState<{ [key: string]: string }>({});
  const [activeKey, setActiveKey] = useState<string>("new");
  const [selectedTrope, setSelectedTrope] = useState<string>("");
  const [availableTropes, setAvailableTropes] = useState<string[]>([]);
  // Vocabulary intended to be unalterable by user
  const [vocabulary, setVocabulary] = useState<string>("");
  const [error, setError] = useState<string>(
    Locale[AppSettings.interfaceLanguage].modalNewElemError
  );
  const [tropeSearch, setTropeSearch] = useState<string>("");

  const getUnusedTropes: () => string[] = () =>
    Object.keys(WorkspaceTerms)
      .filter(
        (term) =>
          filterEquivalent(
            WorkspaceTerms[term].types,
            parsePrefix("z-sgov-pojem", "typ-vlastnosti")
          ) && WorkspaceElements[term].active
      )
      .filter((t) => !isTermReadOnly(t))
      .filter(
        (t) =>
          !Object.keys(WorkspaceLinks).find(
            (l) =>
              (WorkspaceLinks[l].source === t ||
                WorkspaceLinks[l].target === t) &&
              WorkspaceLinks[l].active
          )
      );

  const save = () => {
    if (activeKey === "new") {
      props.performTransaction(
        ...createTerm(
          trimLanguageObjectInput(input),
          getVocabularyFromScheme(WorkspaceTerms[props.term].inScheme),
          ElemCreationStrategy.INTRINSIC_TROPE_TYPE,
          getElementPosition(props.term),
          [props.term]
        )
      );
      const elem = graph.getElements().find((elem) => elem.id === props.term);
      if (elem) {
        drawGraphElement(
          elem,
          props.selectedLanguage,
          AppSettings.representation
        );
        highlightCells(CellColors.detail, props.term);
      }
      props.update();
    } else if (activeKey === "exist" && selectedTrope) {
      WorkspaceElements[selectedTrope].position[AppSettings.selectedDiagram] =
        getElementPosition(props.term);
      WorkspaceElements[selectedTrope].hidden[AppSettings.selectedDiagram] =
        false;
      props.performTransaction(
        ...saveNewLink(
          parsePrefix("z-sgov-pojem", "má-vlastnost"),
          props.term,
          selectedTrope,
          Representation.FULL
        ),
        updateProjectElementDiagram(AppSettings.selectedDiagram, selectedTrope)
      );
      redrawElement(props.term, props.selectedLanguage);
    } else {
      throw new Error("Invalid save request.");
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
        const vocab = getVocabularyFromScheme(
          WorkspaceTerms[props.term].inScheme
        );
        if (!vocab) props.hideModal();
        else setVocabulary(vocab);

        setError(Locale[AppSettings.interfaceLanguage].modalNewElemError);
        setInput(initLanguageObject(""));
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
            WorkspaceTerms[props.term].labels,
            props.selectedLanguage
          )}
        </Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
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
              <NewElemForm
                termName={input}
                selectedVocabulary={vocabulary}
                errorText={error}
                setTermName={(name, lang) =>
                  setInput((prevState) => ({ ...prevState, [lang]: name }))
                }
                setErrorText={(s) => setError(s)}
                newElemDescription="modalNewTropeDescription"
              />
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
              {availableTropes.length > 0 && (
                <Form.Control
                  value={tropeSearch}
                  onChange={(e) => setTropeSearch(e.target.value)}
                  placeholder={
                    Locale[AppSettings.interfaceLanguage].searchExistingTropes
                  }
                />
              )}
              <br />
              <div className="tropeList">
                <ListGroup>
                  {availableTropes
                    .filter((t) =>
                      getLabelOrBlank(
                        WorkspaceTerms[t].labels,
                        props.selectedLanguage
                      )
                        .toLowerCase()
                        .trim()
                        .includes(tropeSearch.toLowerCase().trim())
                    )
                    .sort()
                    .map((t) => (
                      <ListGroup.Item
                        action
                        variant="light"
                        key={t}
                        active={t === selectedTrope}
                        onClick={(event) => {
                          event.preventDefault();
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
              <br />
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
          <Button type="submit" variant="primary" disabled={isDisabled()}>
            {Locale[AppSettings.interfaceLanguage].assignTropeConfirm}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
