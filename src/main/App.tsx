import React from "react";
import MenuPanel from "../panels/MenuPanel";
import VocabularyPanel from "../panels/VocabularyPanel";
import DiagramCanvas from "./DiagramCanvas";
import {
  AppSettings,
  Diagrams,
  FolderRoot,
  Languages,
  WorkspaceElements,
  WorkspaceLinks,
} from "../config/Variables";
import DetailPanel from "../panels/DetailPanel";
import { getVocabulariesFromRemoteJSON } from "../interface/JSONInterface";
import { initVars } from "../function/FunctionEditVars";
import { getContext } from "../interface/ContextInterface";
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
  setSchemeColors,
} from "../function/FunctionGetVars";
import { getSettings } from "../queries/get/InitQueries";
import { updateLegacyWorkspace } from "../queries/update/legacy/UpdateLegacyWorkspaceQueries";
import { updateWorkspaceContext } from "../queries/update/UpdateMiscQueries";
import {
  CreationModals,
  ElemCreationConfiguration,
  LinkCreationConfiguration,
} from "../components/modals/CreationModals";
import { ContextLoadingStrategy, ElemCreationStrategy } from "../config/Enum";
import { getElementPosition } from "../function/FunctionElem";
import { finishUpdatingLegacyWorkspace } from "../queries/update/legacy/FinishUpdatingLegacyWorkspaceQueries";
import { updateCreateDiagram } from "../queries/update/UpdateDiagramQueries";
import { en } from "../locale/en";
import { reconstructApplicationContextWithDiagrams } from "../queries/update/UpdateReconstructAppContext";

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
      projectLanguage: AppSettings.selectedLanguage,
      viewLanguage: AppSettings.viewLanguage,
      loading: true,
      status: Locale[AppSettings.viewLanguage].loading,
      freeze: true,
      validation: false,
      retry: false,
      tooltip: false,
      newElemConfiguration: {
        strategy: ElemCreationStrategy.DEFAULT,
        position: { x: 0, y: 0 },
        connections: [],
        header: "",
        pkg: FolderRoot,
      },
      newLinkConfiguration: { sourceID: "", targetID: "" },
    };
    document.title = Locale[AppSettings.viewLanguage].ontoGrapher;
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    this.loadVocabularies = this.loadVocabularies.bind(this);
    this.handleStatus = this.handleStatus.bind(this);
    this.validate = this.validate.bind(this);
    this.performTransaction = this.performTransaction.bind(this);
  }

  componentDidMount(): void {
    this.loadWorkspace();
  }

  loadWorkspace() {
    const isURL = require("is-url");
    const urlParams = new URLSearchParams(window.location.search);
    let contextIRI = urlParams.get("workspace");
    if (contextIRI && isURL(contextIRI)) {
      contextIRI = decodeURIComponent(contextIRI);
      if (contextIRI.includes("/diagram-")) {
        this.loadVocabularies(contextIRI, AppSettings.contextEndpoint);
      } else this.loadVocabularies(contextIRI, AppSettings.contextEndpoint);
    } else {
      this.handleStatus(
        false,
        Locale[AppSettings.viewLanguage].pleaseReload,
        true
      );
    }
  }

  handleChangeLanguage(languageCode: string) {
    this.setState({ projectLanguage: languageCode });
    AppSettings.selectedLanguage = languageCode;
    document.title =
      AppSettings.name[languageCode] +
      " | " +
      Locale[AppSettings.viewLanguage].ontoGrapher;
    graph.getElements().forEach((cell) => {
      if (WorkspaceElements[cell.id]) {
        drawGraphElement(cell, languageCode, AppSettings.representation);
      }
    });
    graph.getLinks().forEach((cell) => {
      if (WorkspaceLinks[cell.id]) {
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
      Locale[AppSettings.viewLanguage].updating,
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
            Locale[AppSettings.viewLanguage].errorUpdating,
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

  checkLastViewedVersion() {
    const lastViewedVersion = window.localStorage.getItem("lastViewedVersion");
    if (!lastViewedVersion || lastViewedVersion !== getLastChangeDay()) {
      this.setState({ tooltip: true });
      window.setTimeout(() => this.setState({ tooltip: false }), 5000);
    }
    window.localStorage.setItem("lastViewedVersion", getLastChangeDay());
  }

  loadVocabularies(contextIRI: string, contextEndpoint: string) {
    AppSettings.contextEndpoint = contextEndpoint;
    AppSettings.contextIRI = contextIRI;
    getVocabulariesFromRemoteJSON(
      "https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/main/src/config/Vocabularies.json"
    ).then((result) => {
      if (result) {
        getSettings(AppSettings.contextEndpoint).then(async (result) => {
          if (result !== undefined) {
            await this.handleLoadingStrategy(result);
          } else {
            this.handleLoadingError();
            return;
          }
          this.handleChangeLanguage(Object.keys(Languages)[0]);
          document.title =
            AppSettings.name[this.state.projectLanguage] +
            " | " +
            Locale[AppSettings.viewLanguage].ontoGrapher;
          setSchemeColors(AppSettings.viewColorPool);
          changeDiagrams(Diagrams.findIndex((diag) => diag && diag.active));
          this.itemPanel.current?.update();
          this.handleStatus(
            false,
            Locale[AppSettings.viewLanguage].workspaceReady,
            false
          );
          this.checkLastViewedVersion();
        });
      } else {
        this.handleLoadingError();
      }
    });
  }

  async handleLoadingStrategy(strategy: ContextLoadingStrategy | undefined) {
    if (strategy !== ContextLoadingStrategy.DEFAULT)
      this.handleStatus(
        true,
        Locale[AppSettings.viewLanguage].updatingWorkspaceVersion,
        true
      );
    switch (strategy) {
      case ContextLoadingStrategy.UPDATE_LEGACY_WORKSPACE:
        const queries = await updateLegacyWorkspace(
          AppSettings.contextIRI,
          AppSettings.contextEndpoint
        );
        if (
          !(await processTransaction(
            AppSettings.contextEndpoint,
            qb.constructQuery(qb.combineQueries(...queries))
          ))
        ) {
          this.handleLoadingError();
          return;
        }
        break;
      case ContextLoadingStrategy.RECONSTRUCT_WORKSPACE:
        if (
          !(await processTransaction(
            AppSettings.contextEndpoint,
            qb.constructQuery(await reconstructApplicationContextWithDiagrams())
          ))
        ) {
          this.handleLoadingError();
          return;
        }
        break;
      default:
        break;
    }
    if (AppSettings.initWorkspace) {
      if (
        !(await processTransaction(
          AppSettings.contextEndpoint,
          qb.constructQuery(updateWorkspaceContext(), updateCreateDiagram(0))
        ))
      ) {
        this.handleLoadingError();
        return;
      }
    }
    this.handleResumeLoading();
    const success = await getContext(
      AppSettings.contextIRI,
      AppSettings.contextEndpoint
    );
    if (success) {
      if (
        !AppSettings.initWorkspace &&
        ContextLoadingStrategy.UPDATE_LEGACY_WORKSPACE === strategy
      ) {
        if (
          !(await processTransaction(
            AppSettings.contextEndpoint,
            qb.constructQuery(
              qb.combineQueries(...(await finishUpdatingLegacyWorkspace()))
            )
          ))
        ) {
          this.handleLoadingError();
          return;
        }
        this.handleResumeLoading();
      }
    } else {
      this.handleLoadingError();
      return;
    }
  }

  handleLoadingError(message: keyof typeof en = "connectionError") {
    this.handleStatus(false, Locale[AppSettings.viewLanguage][message], true);
  }

  handleResumeLoading() {
    this.handleStatus(true, Locale[AppSettings.viewLanguage].loading, true);
  }

  handleWorkspaceReady(message: keyof typeof en = "savedChanges") {
    this.handleStatus(false, Locale[AppSettings.viewLanguage][message], false);
  }

  validate() {
    this.setState({ validation: !this.state.validation });
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

  handleUpdateDetailPanel(id?: string) {
    if (id) this.detailPanel.current?.update(id);
    else this.detailPanel.current?.hide();
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
          update={() => {
            this.itemPanel.current?.update();
          }}
          closeDetailPanel={() => {
            this.detailPanel.current?.hide();
            resetDiagramSelection();
          }}
          freeze={this.state.freeze}
          validate={this.validate}
          handleStatus={this.handleStatus}
          performTransaction={this.performTransaction}
          tooltip={this.state.tooltip}
        />
        <VocabularyPanel
          ref={this.itemPanel}
          projectLanguage={this.state.projectLanguage}
          freeze={this.state.freeze}
          update={() => {
            this.detailPanel.current?.hide();
            resetDiagramSelection();
          }}
          performTransaction={this.performTransaction}
          updateDetailPanel={(id: string) => {
            this.handleUpdateDetailPanel(id);
          }}
        />
        <DiagramPanel
          freeze={this.state.freeze}
          update={() => {
            this.itemPanel.current?.update();
            this.detailPanel.current?.hide();
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
          updateDetailPanel={(id: string) => {
            this.handleUpdateDetailPanel(id);
          }}
          updateDiagramCanvas={() => {
            this.canvas.current?.setState({ modalAddElem: true });
          }}
          handleCreation={(source: string) => {
            this.handleCreation({
              strategy: ElemCreationStrategy.INTRINSIC_TROPE_TYPE,
              connections: [source],
              pkg:
                FolderRoot.children.find((pkg) =>
                  pkg.elements.includes(source)
                ) || FolderRoot,
              position: getElementPosition(source),
              header:
                Locale[AppSettings.viewLanguage].modalNewIntrinsicTropeTitle,
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
          updateDetailPanel={(id?: string) => {
            this.handleUpdateDetailPanel(id);
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
          performTransaction={this.performTransaction}
          projectLanguage={this.state.projectLanguage}
          update={() => this.itemPanel.current?.update()}
        />
      </div>
    );
  }
}
