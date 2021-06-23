import React from "react";
import MenuPanel from "../panels/MenuPanel";
import ItemPanel from "../panels/ItemPanel";
import DiagramCanvas from "./DiagramCanvas";
import {
  AppSettings,
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
import { drawGraphElement } from "../function/FunctionDraw";
import {
  changeDiagrams,
  resetDiagramSelection,
} from "../function/FunctionDiagram";
import { qb } from "../queries/QueryBuilder";
import { getLastChangeDay, setSchemeColors } from "../function/FunctionGetVars";
import { getSettings } from "../queries/get/InitQueries";
import { updateLegacyWorkspace } from "../queries/update/legacy/UpdateLegacyWorkspaceQueries";
import { updateProjectSettings } from "../queries/update/UpdateMiscQueries";

interface DiagramAppProps {
  readOnly?: boolean;
  loadDefaultVocabularies?: boolean;
  contextIRI?: string;
  contextEndpoint?: string;
}

interface DiagramAppState {
  detailPanelHidden: boolean;
  projectLanguage: string;
  viewLanguage: string;
  loading: boolean;
  status: string;
  freeze: boolean;
  widthLeft: number;
  widthRight: number;
  validation: boolean;
  retry: boolean;
  tooltip: boolean;
}

require("../scss/style.scss");

export default class App extends React.Component<
  DiagramAppProps,
  DiagramAppState
> {
  private readonly canvas: React.RefObject<DiagramCanvas>;
  private readonly itemPanel: React.RefObject<ItemPanel>;
  private readonly detailPanel: React.RefObject<DetailPanel>;
  private readonly menuPanel: React.RefObject<MenuPanel>;

  constructor(props: DiagramAppProps) {
    super(props);

    this.canvas = React.createRef();
    this.itemPanel = React.createRef();
    this.detailPanel = React.createRef();
    this.menuPanel = React.createRef();

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
      detailPanelHidden: false,
      loading: true,
      status: Locale[AppSettings.viewLanguage].loading,
      freeze: true,
      widthLeft: 300,
      widthRight: 0,
      validation: false,
      retry: false,
      tooltip: false,
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
        const diagram = contextIRI.substring(contextIRI.lastIndexOf("/"));
        const match = diagram.match(/(\d+)/);
        let diagramNumber;
        if (match) diagramNumber = parseInt(match[0], 10);
        this.loadVocabularies(
          contextIRI,
          AppSettings.contextEndpoint,
          diagramNumber ? diagramNumber : 0
        );
      } else this.loadVocabularies(contextIRI, AppSettings.contextEndpoint, 0);
    } else if (this.props.contextIRI && this.props.contextEndpoint) {
      this.loadVocabularies(this.props.contextIRI, this.props.contextEndpoint);
    } else {
      this.handleStatus(
        false,
        Locale[AppSettings.viewLanguage].pleaseReload,
        true,
        false
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
        nameGraphLink(cell, languageCode);
      }
    });
  }

  performTransaction(...queries: string[]) {
    let transaction = qb.constructQuery(...queries);
    if (!transaction) return;
    this.handleStatus(true, Locale[AppSettings.viewLanguage].updating, false);
    processTransaction(AppSettings.contextEndpoint, transaction).then(
      (result) => {
        if (result) {
          this.handleStatus(
            false,
            Locale[AppSettings.viewLanguage].savedChanges,
            false
          );
        } else {
          this.handleStatus(
            false,
            Locale[AppSettings.viewLanguage].errorUpdating,
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
    retry: boolean = true
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

  loadVocabularies(
    contextIRI: string,
    contextEndpoint: string,
    diagram: number = 0
  ) {
    this.handleStatus(
      true,
      Locale[AppSettings.viewLanguage].loading,
      true,
      false
    );
    AppSettings.contextEndpoint = contextEndpoint;
    AppSettings.contextIRI = contextIRI;
    getVocabulariesFromRemoteJSON(
      "https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/main/src/config/Vocabularies.json"
    ).then((result) => {
      if (result) {
        getSettings(AppSettings.contextEndpoint).then(async () => {
          if (AppSettings.contextVersion < AppSettings.latestContextVersion) {
            const queries = await updateLegacyWorkspace(
              AppSettings.contextVersion,
              contextIRI,
              contextEndpoint,
              this.handleStatus
            );
            await processTransaction(
              AppSettings.contextEndpoint,
              qb.constructQuery(qb.combineQueries(...queries))
            );
            this.handleStatus(
              true,
              Locale[AppSettings.viewLanguage].loading,
              true,
              false
            );
          }
          if (AppSettings.initWorkspace)
            await this.performTransaction(updateProjectSettings(contextIRI, 0));
          const success = await getContext(contextIRI, contextEndpoint);
          if (success) {
            this.handleChangeLanguage(Object.keys(Languages)[0]);
            document.title =
              AppSettings.name[this.state.projectLanguage] +
              " | " +
              Locale[AppSettings.viewLanguage].ontoGrapher;
            setSchemeColors(AppSettings.viewColorPool);
            changeDiagrams(diagram);
            this.forceUpdate();
            this.itemPanel.current?.forceUpdate();
            this.handleStatus(
              false,
              Locale[AppSettings.viewLanguage].workspaceReady,
              false,
              false
            );
            this.checkLastViewedVersion();
          } else {
            this.handleStatus(
              false,
              Locale[AppSettings.viewLanguage].pleaseReload,
              false
            );
          }
        });
      } else
        this.handleStatus(
          false,
          Locale[AppSettings.viewLanguage].pleaseReload,
          false
        );
    });
  }

  validate() {
    this.setState({ validation: true });
  }

  handleUpdateDetailPanel(id?: string) {
    if (id) this.detailPanel.current?.update(id);
    else this.detailPanel.current?.hide();
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
        <ItemPanel
          ref={this.itemPanel}
          handleWidth={(width: number) => {
            this.setState({ widthLeft: width });
          }}
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
          handleWidth={(width: number) => {
            this.setState({ widthRight: width });
          }}
          performTransaction={this.performTransaction}
          updateDetailPanel={(id: string) => {
            this.handleUpdateDetailPanel(id);
          }}
          updateDiagramCanvas={() => {
            this.canvas.current?.setState({ modalAddElem: true });
          }}
        />
        {this.state.validation && (
          <ValidationPanel
            widthLeft={this.state.widthLeft}
            widthRight={this.state.widthRight}
            close={() => {
              this.setState({ validation: false });
              resetDiagramSelection();
            }}
            projectLanguage={this.state.projectLanguage}
          />
        )}
        <DiagramCanvas
          ref={this.canvas}
          projectLanguage={this.state.projectLanguage}
          updateElementPanel={(id?: string) => {
            this.itemPanel.current?.update(id);
          }}
          updateDetailPanel={(id?: string) => {
            this.handleUpdateDetailPanel(id);
          }}
          freeze={this.state.freeze}
          performTransaction={this.performTransaction}
          handleStatus={this.handleStatus}
        />
      </div>
    );
  }
}
