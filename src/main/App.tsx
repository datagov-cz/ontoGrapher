import React from "react";
import MenuPanel from "../panels/MenuPanel";
import VocabularyPanel from "../panels/VocabularyPanel";
import DiagramCanvas from "./DiagramCanvas";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import DetailPanel from "../panels/DetailPanel";
import { getVocabulariesFromRemoteJSON } from "../interface/JSONInterface";
import { initVars } from "../function/FunctionEditVars";
import {
  retrieveContextData,
  retrieveInfoFromURLParameters,
  retrieveVocabularyData,
  updateContexts,
} from "../interface/ContextInterface";
import { graph } from "../graph/Graph";
import { nameGraphLink } from "../function/FunctionGraph";
import {
  abortTransaction,
  processTransaction,
} from "../interface/TransactionInterface";
import ValidationPanel from "../panels/ValidationPanel";
import DiagramPanel from "../panels/DiagramPanel";
import { Locale } from "../config/Locale";
import { drawGraphElement, unHighlightAll } from "../function/FunctionDraw";
import {
  changeDiagrams,
  resetDiagramSelection,
} from "../function/FunctionDiagram";
import { qb } from "../queries/QueryBuilder";
import {
  getLastChangeDay,
  getLinkOrVocabElem,
  getLocalStorageKey,
  getVocabularyFromScheme,
  setSchemeColors,
} from "../function/FunctionGetVars";
import {
  CreationModals,
  ElemCreationConfiguration,
  LinkCreationConfiguration,
  PatternCreationConfiguration,
} from "../components/modals/CreationModals";
import { DetailPanelMode, ElemCreationStrategy } from "../config/Enum";
import { getElementPosition } from "../function/FunctionElem";
import { en } from "../locale/en";
import { StoreAlerts } from "../config/Store";
import { CriticalAlertModal } from "../components/modals/CriticalAlertModal";
import {
  retrievePatternAndInstanceData,
  sendInstance,
  sendPattern,
} from "../pattern/function/PatternQueries";
import { callCriticalAlert } from "../config/CriticalAlertData";

interface DiagramAppProps {}

interface DiagramAppState {
  projectLanguage: string;
  viewLanguage: string;
  loading: boolean;
  status: string;
  freeze: boolean;
  validation: boolean;
  retry: boolean;
  tooltip: boolean;
  newElemConfiguration: ElemCreationConfiguration;
  newLinkConfiguration: LinkCreationConfiguration;
  newPatternConfiguration: PatternCreationConfiguration;
  showCriticalAlert: boolean;
}

require("../scss/style.scss");

export default class App extends React.Component<
  DiagramAppProps,
  DiagramAppState
> {
  private readonly canvas: React.RefObject<DiagramCanvas>;
  private readonly itemPanel: React.RefObject<VocabularyPanel>;
  private readonly detailPanel: React.RefObject<DetailPanel>;
  private readonly menuPanel: React.RefObject<MenuPanel>;
  private readonly validationPanel: React.RefObject<ValidationPanel>;

  constructor(props: DiagramAppProps) {
    super(props);

    this.canvas = React.createRef();
    this.itemPanel = React.createRef();
    this.detailPanel = React.createRef();
    this.menuPanel = React.createRef();
    this.validationPanel = React.createRef();

    initVars();

    window.onbeforeunload = () => {
      if (AppSettings.lastTransactionID) return "Transaction in progress";
    };

    window.onpagehide = () => {
      if (AppSettings.lastTransactionID)
        abortTransaction(AppSettings.lastTransactionID);
    };

    this.state = {
      projectLanguage: AppSettings.canvasLanguage,
      viewLanguage: AppSettings.interfaceLanguage,
      loading: true,
      status: Locale[AppSettings.interfaceLanguage].loading,
      freeze: true,
      validation: false,
      retry: false,
      tooltip: false,
      newElemConfiguration: {
        strategy: ElemCreationStrategy.DEFAULT,
        position: { x: 0, y: 0 },
        connections: [],
        header: "",
        vocabulary: "",
      },
      newLinkConfiguration: { sourceID: "", targetID: "" },
      newPatternConfiguration: { elements: [] },
      showCriticalAlert: false,
    };
    document.title = Locale[AppSettings.interfaceLanguage].ontoGrapher;
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    this.handleChangeInterfaceLanguage =
      this.handleChangeInterfaceLanguage.bind(this);
    this.handleStatus = this.handleStatus.bind(this);
    this.validate = this.validate.bind(this);
    this.performTransaction = this.performTransaction.bind(this);
    this.performInstanceTransaction =
      this.performInstanceTransaction.bind(this);
    this.performPatternTransaction = this.performPatternTransaction.bind(this);

    StoreAlerts.subscribe(
      (s) => s.showCriticalAlert,
      (state) => {
        this.setState({ showCriticalAlert: state, freeze: state });
        if (!state) {
          this.itemPanel.current?.update();
          this.menuPanel.current?.update();
        }
      }
    );
  }

  componentDidMount(): void {
    this.loadAndPrepareData().then((r) => {
      if (r)
        this.handleStatus(
          false,
          Locale[AppSettings.interfaceLanguage].workspaceReady,
          false
        );
      else this.handleLoadingError();
    });
  }

  async loadAndPrepareData(): Promise<boolean> {
    const process0 = await getVocabulariesFromRemoteJSON(
      "https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/main/src/config/Vocabularies.json"
    );
    if (!process0) return false;
    const process1 = retrieveInfoFromURLParameters();
    if (!process1) return false;
    const process2 = await retrieveVocabularyData();
    if (!process2) return false;
    const process3 = await updateContexts();
    if (!process3) return false;
    const process4 = await retrieveContextData();
    if (!process4) return false;
    const process5 = await retrievePatternAndInstanceData();
    if (!process5) return false;
    this.handleChangeLanguage(AppSettings.canvasLanguage);
    document.title =
      AppSettings.name[this.state.projectLanguage] +
      " | " +
      Locale[AppSettings.interfaceLanguage].ontoGrapher;
    setSchemeColors(AppSettings.viewColorPool);
    changeDiagrams();
    this.itemPanel.current?.update();
    this.checkLastViewedVersion();
    this.handleStatus(
      false,
      Locale[AppSettings.interfaceLanguage].workspaceReady,
      false
    );
    callCriticalAlert({
      acceptFunction: () => {},
      waitForFunctionBeforeModalClose: false,
      acceptLabel: "",
      modalSize: undefined,
      innerContent: (
        <div>
          <p>
            Vítejte ve verzi OntoGrapheru vytvořené pro testování implementace
            šablon (Ontology Design Pattern)! Mockrát děkuji, že jste si pro
            test udělali čas - mělo by vám to zabrat kolem patnácti minut. Pro
            návod, testovací scénář a formulář pro záznam zpětné vazby prosím
            navštivte <a href={"./testing.html"}>stránku pro testování</a>.
          </p>
          <p>
            Ráda bych poprosila, abyste zpětnou vazbu odeslali do 20. května
            (pátek) ve 20:00. Pokud při vašem testování naleznete fatální chybu,
            která vám zabraňuje pokračovat, nahlaste ji prosím přes žluté
            tlačítko vpravo nahoře (Report an issue/Nahlásit chybu). V této
            verzi vás toto tlačítko přesměruje na speciální issue šablonu
            sepsanou pro tuto verzi - jakoukoliv komunikaci kolem issue budu
            provádět na stránce issue.
          </p>
          <span className={"right"}>- Alice B.</span>
        </div>
      ),
    });
    return true;
  }

  handleChangeInterfaceLanguage(languageCode: string) {
    AppSettings.interfaceLanguage = languageCode;
    this.forceUpdate();
    this.menuPanel.current?.forceUpdate();
    this.validationPanel.current?.forceUpdate();
    this.itemPanel.current?.forceUpdate();
    this.detailPanel.current?.forceUpdate();
  }

  handleChangeLanguage(languageCode: string) {
    this.setState({ projectLanguage: languageCode });
    AppSettings.canvasLanguage = languageCode;
    document.title =
      AppSettings.name[languageCode] +
      " | " +
      Locale[AppSettings.interfaceLanguage].ontoGrapher;
    graph.getElements().forEach((cell) => {
      if (cell.id in WorkspaceElements) {
        drawGraphElement(cell, languageCode, AppSettings.representation);
      }
    });
    graph.getLinks().forEach((cell) => {
      if (cell.id in WorkspaceLinks) {
        nameGraphLink(
          cell,
          getLinkOrVocabElem(WorkspaceLinks[cell.id].iri).labels,
          languageCode
        );
      }
    });
  }

  performTransaction(...queries: string[]) {
    const queriesTrimmed = queries.filter((q) => q);
    if (queriesTrimmed.length === 0) {
      this.handleWorkspaceReady();
      return;
    }
    const transaction = qb.constructQuery(...queriesTrimmed);
    this.handleStatus(
      true,
      Locale[AppSettings.interfaceLanguage].updating,
      false,
      false
    );
    processTransaction(AppSettings.contextEndpoint, transaction).then(
      (result) => {
        if (result) {
          this.handleWorkspaceReady();
        } else {
          this.handleStatus(
            false,
            Locale[AppSettings.interfaceLanguage].errorUpdating,
            true,
            true
          );
        }
      }
    );
  }

  performPatternTransaction(iri: string) {
    this.handleStatus(
      true,
      Locale[AppSettings.interfaceLanguage].updating,
      false,
      false
    );
    sendPattern(iri).then((result) => {
      if (result) {
        this.handleWorkspaceReady();
      } else {
        this.handleStatus(
          false,
          Locale[AppSettings.interfaceLanguage].errorUpdating,
          true,
          true
        );
      }
    });
  }

  performInstanceTransaction(iri: string) {
    this.handleStatus(
      true,
      Locale[AppSettings.interfaceLanguage].updating,
      false,
      false
    );
    sendInstance(iri).then((result) => {
      if (result) {
        this.handleWorkspaceReady();
      } else {
        this.handleStatus(
          false,
          Locale[AppSettings.interfaceLanguage].errorUpdating,
          true,
          true
        );
      }
    });
  }

  handleStatus(
    loading: boolean,
    status: string,
    freeze: boolean,
    retry: boolean = false
  ) {
    this.setState({
      loading: loading,
      status: status,
      freeze: freeze,
      retry: retry,
    });
  }

  checkLastViewedVersion() {
    const lastViewedVersion = window.localStorage.getItem(
      getLocalStorageKey("lastViewedVersion")
    );
    if (!lastViewedVersion || lastViewedVersion !== getLastChangeDay()) {
      this.setState({ tooltip: true });
      window.setTimeout(() => this.setState({ tooltip: false }), 5000);
    }
    window.localStorage.setItem(
      getLocalStorageKey("lastViewedVersion"),
      getLastChangeDay()
    );
  }

  handleLoadingError(message: keyof typeof en = "connectionError") {
    this.handleStatus(
      false,
      Locale[AppSettings.interfaceLanguage][message],
      true
    );
  }

  handleWorkspaceReady(message: keyof typeof en = "savedChanges") {
    this.handleStatus(
      false,
      Locale[AppSettings.interfaceLanguage][message],
      false
    );
  }

  validate() {
    this.setState({ validation: !this.state.validation });
  }

  handleCreation(
    configuration:
      | ElemCreationConfiguration
      | LinkCreationConfiguration
      | PatternCreationConfiguration
  ) {
    if ("strategy" in configuration) {
      this.setState({ newElemConfiguration: configuration });
    } else if ("sourceID" in configuration) {
      this.setState({ newLinkConfiguration: configuration });
    } else if ("elements" in configuration) {
      this.setState({ newPatternConfiguration: configuration });
    }
  }

  handleUpdateDetailPanel(mode: DetailPanelMode, id?: string) {
    this.detailPanel.current?.prepareDetails(mode, id);
    this.validationPanel.current?.forceUpdate();
  }

  render() {
    return (
      <div className={"app"}>
        <MenuPanel
          ref={this.menuPanel}
          retry={this.state.retry}
          loading={this.state.loading}
          status={this.state.status}
          projectLanguage={this.state.projectLanguage}
          handleChangeLanguage={this.handleChangeLanguage}
          handleChangeInterfaceLanguage={this.handleChangeInterfaceLanguage}
          update={() => {
            this.itemPanel.current?.update();
          }}
          closeDetailPanel={() => {
            this.handleUpdateDetailPanel(DetailPanelMode.HIDDEN);
            resetDiagramSelection();
          }}
          updateDetailPanel={() =>
            this.handleUpdateDetailPanel(DetailPanelMode.PATTERN)
          }
          freeze={this.state.freeze}
          validate={this.validate}
          handleStatus={this.handleStatus}
          performTransaction={this.performTransaction}
          performPatternTransaction={this.performPatternTransaction}
          tooltip={this.state.tooltip}
        />
        <VocabularyPanel
          ref={this.itemPanel}
          projectLanguage={this.state.projectLanguage}
          freeze={this.state.freeze}
          update={() => {
            this.handleUpdateDetailPanel(DetailPanelMode.HIDDEN);
            resetDiagramSelection();
          }}
          performTransaction={this.performTransaction}
          updateDetailPanel={(id: string) => {
            this.handleUpdateDetailPanel(DetailPanelMode.TERM, id);
          }}
        />
        <DiagramPanel
          freeze={this.state.freeze}
          update={() => {
            this.itemPanel.current?.update();
            this.handleUpdateDetailPanel(DetailPanelMode.HIDDEN);
            this.menuPanel.current?.update();
          }}
          performTransaction={this.performTransaction}
        />
        <DetailPanel
          freeze={this.state.freeze}
          ref={this.detailPanel}
          projectLanguage={this.state.projectLanguage}
          update={(id?: string) => {
            this.itemPanel.current?.update(id);
            this.detailPanel.current?.forceUpdate();
          }}
          performTransaction={this.performTransaction}
          updateDiagramCanvas={() => {
            this.canvas.current?.setState({ modalAddElem: true });
          }}
          handleCreation={(source: string) => {
            this.handleCreation({
              strategy: ElemCreationStrategy.INTRINSIC_TROPE_TYPE,
              connections: [source],
              vocabulary: getVocabularyFromScheme(
                WorkspaceTerms[source].inScheme
              ),
              position: getElementPosition(source),
              header:
                Locale[AppSettings.interfaceLanguage]
                  .modalNewIntrinsicTropeTitle,
            });
          }}
        />
        {this.state.validation && (
          <ValidationPanel
            ref={this.validationPanel}
            close={() => {
              this.setState({ validation: false });
              unHighlightAll();
            }}
            projectLanguage={this.state.projectLanguage}
          />
        )}
        <DiagramCanvas
          ref={this.canvas}
          projectLanguage={this.state.projectLanguage}
          updateElementPanel={(id?: string, redoCacheSearch?: boolean) => {
            this.itemPanel.current?.update(id, redoCacheSearch);
          }}
          updateDetailPanel={(mode: DetailPanelMode, id?: string) => {
            this.handleUpdateDetailPanel(mode, id);
          }}
          freeze={this.state.freeze}
          performTransaction={this.performTransaction}
          handleStatus={this.handleStatus}
          handleCreation={(configuration) => {
            this.handleCreation(configuration);
          }}
        />
        <CreationModals
          elemConfiguration={this.state.newElemConfiguration}
          linkConfiguration={this.state.newLinkConfiguration}
          patternConfiguration={this.state.newPatternConfiguration}
          performInstanceTransaction={this.performInstanceTransaction}
          performPatternTransaction={this.performPatternTransaction}
          performTransaction={this.performTransaction}
          projectLanguage={this.state.projectLanguage}
          update={() => this.itemPanel.current?.update()}
        />
        <CriticalAlertModal show={this.state.showCriticalAlert} />
      </div>
    );
  }
}
