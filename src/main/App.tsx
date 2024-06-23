import hotkeys from "hotkeys-js";
import * as _ from "lodash";
import React from "react";
import {
  CreationModals,
  ElemCreationConfiguration,
  LinkCreationConfiguration,
} from "../components/modals/CreationModals";
import { CriticalAlertModal } from "../components/modals/CriticalAlertModal";
import {
  DetailPanelMode,
  ElemCreationStrategy,
  MainViewMode,
} from "../config/Enum";
import { Environment } from "../config/Environment";
import { Locale } from "../config/Locale";
import { StoreAlerts, StoreSettings } from "../config/Store";
import { callToast } from "../config/ToastData";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
} from "../config/Variables";
import { CellColors } from "../config/visual/CellColors";
import { dumpDebugData, loadDebugData } from "../function/FunctionDebug";
import { resetDiagramSelection } from "../function/FunctionDiagram";
import {
  drawGraphElement,
  highlightCells,
  unHighlightAll,
} from "../function/FunctionDraw";
import { initVars } from "../function/FunctionEditVars";
import {
  getLinkOrVocabElem,
  setSchemeColors,
} from "../function/FunctionGetVars";
import { nameGraphLink } from "../function/FunctionGraph";
import { graph } from "../graph/Graph";
import {
  checkForObsoleteDiagrams,
  retrieveContextData,
  retrieveInfoFromURLParameters,
  retrieveVocabularyData,
  updateContexts,
} from "../interface/ContextInterface";
import { getVocabulariesFromRemoteJSON } from "../interface/JSONInterface";
import {
  abortTransaction,
  processTransaction,
} from "../interface/TransactionInterface";
import { en } from "../locale/en";
import DetailPanel from "../panels/DetailPanel";
import DiagramPanel from "../panels/DiagramPanel";
import MenuPanel from "../panels/MenuPanel";
import ValidationPanel from "../panels/ValidationPanel";
import VocabularyPanel from "../panels/VocabularyPanel";
import { qb } from "../queries/QueryBuilder";
import { updateVocabularyAnnotations } from "../queries/update/UpdateChangeQueries";
import { updateDiagramMetadata } from "../queries/update/UpdateDiagramQueries";
import { MainView } from "./MainView";
import { ToastService } from "./ToastService";

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
  showCriticalAlert: boolean;
}

require("../scss/style.scss");

export default class App extends React.Component<
  DiagramAppProps,
  DiagramAppState
> {
  private readonly itemPanel: React.RefObject<VocabularyPanel>;
  private readonly detailPanel: React.RefObject<DetailPanel>;
  private readonly menuPanel: React.RefObject<MenuPanel>;
  private readonly validationPanel: React.RefObject<ValidationPanel>;
  private readonly diagramPanel: React.RefObject<DiagramPanel>;

  constructor(props: DiagramAppProps) {
    super(props);

    this.itemPanel = React.createRef();
    this.detailPanel = React.createRef();
    this.menuPanel = React.createRef();
    this.validationPanel = React.createRef();
    this.diagramPanel = React.createRef();

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
      showCriticalAlert: false,
    };
    document.title = Locale[AppSettings.interfaceLanguage].ontoGrapher;
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    this.handleChangeInterfaceLanguage =
      this.handleChangeInterfaceLanguage.bind(this);
    this.handleStatus = this.handleStatus.bind(this);
    this.performTransaction = this.performTransaction.bind(this);

    StoreAlerts.subscribe(
      (s) => s.showCriticalAlert,
      (state) => {
        this.setState({ showCriticalAlert: state, freeze: state });
        if (!state) {
          this.itemPanel.current?.update();
          this.menuPanel.current?.update();
          StoreSettings.update((s) => {
            s.mainViewMode = MainViewMode.MANAGER;
          });
        }
      }
    );
  }

  componentDidMount(): void {
    const finishUp = () => {
      hotkeys("ctrl+alt+d", () => dumpDebugData());
      checkForObsoleteDiagrams();
      this.handleChangeLanguage(AppSettings.canvasLanguage);
      setSchemeColors(AppSettings.viewColorPool);
      this.itemPanel.current?.update();
      StoreSettings.update((s) => {
        s.mainViewMode = MainViewMode.MANAGER;
      });
      this.handleWorkspaceReady();
      callToast("diagramsClosedByDefault");
    };
    if (Environment.debug && loadDebugData()) finishUp();
    else
      this.loadAndPrepareData().then((r) => {
        if (r) finishUp();
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
    const transaction = qb.constructQuery(
      ...queriesTrimmed,
      ..._.uniq(AppSettings.changedVocabularies).map((v) =>
        updateVocabularyAnnotations(v)
      ),
      ...(AppSettings.selectedDiagram
        ? [updateDiagramMetadata(AppSettings.selectedDiagram)]
        : [])
    );
    AppSettings.changedVocabularies = [];
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

  handleLoadingError(message: keyof typeof en = "connectionError") {
    this.handleStatus(
      false,
      Locale[AppSettings.interfaceLanguage][message],
      true
    );
  }

  handleWorkspaceReady() {
    this.handleStatus(false, "", false);
  }

  handleCreation(
    configuration: ElemCreationConfiguration | LinkCreationConfiguration
  ) {
    if ("strategy" in configuration) {
      this.setState({ newElemConfiguration: configuration });
    } else if ("sourceID" in configuration) {
      this.setState({ newLinkConfiguration: configuration });
    }
  }

  handleUpdateDetailPanel(mode: DetailPanelMode, id?: string) {
    StoreSettings.update((s) => {
      s.detailPanelMode = mode;
      s.detailPanelSelectedID = id ? id : "";
    });
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
          freeze={this.state.freeze}
          validate={() => this.setState({ validation: !this.state.validation })}
          handleStatus={this.handleStatus}
          performTransaction={this.performTransaction}
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
            highlightCells(CellColors.detail, id);
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
          ref={this.diagramPanel}
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
        <MainView
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
          update={(id?: string) => {
            this.itemPanel.current?.update(id);
            this.detailPanel.current?.forceUpdate();
            this.diagramPanel.current?.forceUpdate();
          }}
        />
        <CreationModals
          elemConfiguration={this.state.newElemConfiguration}
          linkConfiguration={this.state.newLinkConfiguration}
          performTransaction={this.performTransaction}
          projectLanguage={this.state.projectLanguage}
          update={() => this.itemPanel.current?.update()}
        />
        <ToastService />
        <CriticalAlertModal show={this.state.showCriticalAlert} />
      </div>
    );
  }
}
