import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ItemPanel from "../panels/ItemPanel";
import DiagramCanvas from "./DiagramCanvas";
import {Languages, ProjectElements, ProjectLinks, ProjectSettings} from "../config/Variables";
import DetailPanel from "../panels/DetailPanel";
import {getVocabulariesFromRemoteJSON} from "../interface/JSONInterface";
import {initVars} from "../function/FunctionEditVars";
import {getContext} from "../interface/ContextInterface";
import {graph} from "../graph/Graph";
import {nameGraphLink} from "../function/FunctionGraph";
import {setupDiagrams} from "../function/FunctionCreateVars";
import {getElementsConfig, getLinksConfig, getSettings} from "../interface/SPARQLInterface";
import {initRestrictions} from "../function/FunctionRestriction";
import {mergeTransactions, processTransaction, updateProjectSettings} from "../interface/TransactionInterface";
import ValidationPanel from "../panels/ValidationPanel";
import DiagramPanel from "../panels/DiagramPanel";
import {setSchemeColors} from "../function/FunctionGetVars";
import {updateLinks} from "../function/FunctionConstruct";
import {Locale} from "../config/Locale";
import {drawGraphElement, unHighlightAll} from "../function/FunctionDraw";

interface DiagramAppProps {
	readOnly?: boolean;
	loadDefaultVocabularies?: boolean;
	contextIRI?: string,
	contextEndpoint?: string
}

interface DiagramAppState {
	detailPanelHidden: boolean;
	projectLanguage: string;
	viewLanguage: string,
	loading: boolean;
	status: string;
	error: boolean;
	widthLeft: number;
	widthRight: number;
	validation: boolean;
	retry: boolean;
}

require("../scss/style.scss");

export default class DiagramApp extends React.Component<DiagramAppProps, DiagramAppState> {
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

		this.state = ({
			projectLanguage: ProjectSettings.selectedLanguage,
			viewLanguage: ProjectSettings.viewLanguage,
			detailPanelHidden: false,
			loading: true,
			status: Locale[ProjectSettings.viewLanguage].loading,
			error: false,
			widthLeft: 300,
			widthRight: 0,
			validation: false,
			retry: false,
		});
		document.title = Locale[ProjectSettings.viewLanguage].ontoGrapher;
		this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
		this.loadVocabularies = this.loadVocabularies.bind(this);
		this.handleChangeLoadingStatus = this.handleChangeLoadingStatus.bind(this);
		this.validate = this.validate.bind(this);
	}

	componentDidMount(): void {
		const isURL = require('is-url');
		let urlParams = new URLSearchParams(window.location.search);
		let contextIRI = urlParams.get('workspace');
		if (contextIRI && isURL(contextIRI)) {
			contextIRI = decodeURIComponent(contextIRI);
			if (contextIRI.includes("/diagram-")) {
				let diagram = contextIRI.substring(contextIRI.lastIndexOf("/"));
				let match = diagram.match(/(\d+)/);
				let diagramNumber;
				if (match) diagramNumber = parseInt(match[0], 10);
				this.loadVocabularies(contextIRI, "https://graphdb.onto.fel.cvut.cz/repositories/kodi-uloziste-dev", diagramNumber ? diagramNumber : 0);
			} else this.loadVocabularies(contextIRI, "https://graphdb.onto.fel.cvut.cz/repositories/kodi-uloziste-dev", 0);
		} else if (this.props.contextIRI && this.props.contextEndpoint) {
			this.loadVocabularies(this.props.contextIRI, this.props.contextEndpoint);
		} else {
			this.handleChangeLoadingStatus(false, Locale[ProjectSettings.viewLanguage].errorMissingWorkspace, true, false);
		}
	}

	handleChangeLanguage(languageCode: string) {
		this.setState({projectLanguage: languageCode});
		ProjectSettings.selectedLanguage = languageCode;
		document.title = ProjectSettings.name[languageCode] + " | " + Locale[ProjectSettings.viewLanguage].ontoGrapher;
		graph.getElements().forEach((cell) => {
			if (ProjectElements[cell.id]) {
				drawGraphElement(cell, languageCode, ProjectSettings.representation);
			}
		});
		graph.getLinks().forEach((cell) => {
			if (ProjectLinks[cell.id]) {
				nameGraphLink(cell, languageCode);
			}
		})
	}

	handleChangeLoadingStatus(loading: boolean, status: string, error: boolean, retry: boolean = true) {
		this.setState({
			loading: loading,
			status: status,
			error: error,
			retry: retry
		});
	}

	loadVocabularies(contextIRI: string, contextEndpoint: string, diagram: number = 0) {
		this.handleChangeLoadingStatus(true, Locale[ProjectSettings.viewLanguage].loading, true, false);
		getVocabulariesFromRemoteJSON("https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/latest/src/config/Vocabularies.json").then(() => {
			getContext(
				contextIRI,
				contextEndpoint,
				"application/json"
			).then(async (result) => {
				if (result) {
					document.title = ProjectSettings.name[this.state.projectLanguage] + " | " + Locale.ontoGrapher;
					ProjectSettings.contextEndpoint = contextEndpoint;
					ProjectSettings.contextIRI = contextIRI;
					this.handleChangeLanguage(Object.keys(Languages)[0]);
					let res = await Promise.all([
						getElementsConfig(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint),
						getLinksConfig(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint),
						getSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint)]);
					this.handleChangeLoadingStatus(true, ProjectSettings.initialized ?
						"Updating ontoGrapher data..." :
						"Initializing ontoGrapher data (this will only be done once)...", true, false);
					initRestrictions();
					setSchemeColors(ProjectSettings.viewColorPool);
					res.push(
						await processTransaction(ProjectSettings.contextEndpoint,
							mergeTransactions(updateProjectSettings(contextIRI), updateLinks())));
					if (res.every(bool => bool)) {
						setupDiagrams(diagram);
						this.forceUpdate();
						this.itemPanel.current?.forceUpdate();
						this.handleChangeLoadingStatus(false, "✔ Workspace ready.", false, false);
					} else
						this.handleChangeLoadingStatus(false, Locale[ProjectSettings.viewLanguage].pleaseReload, false)
				} else {
					this.handleChangeLoadingStatus(false, Locale[ProjectSettings.viewLanguage].pleaseReload, false)
				}
            })
        });
	}

	validate() {
		this.setState({validation: true});
	}

	render() {
		return (<div className={"app"}>
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
					unHighlightAll();
				}}
				error={this.state.error}
				validate={this.validate}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
			/>
			<ItemPanel
				ref={this.itemPanel}
				handleWidth={(width: number) => {
					this.setState({widthLeft: width})
				}}
				projectLanguage={this.state.projectLanguage}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				error={this.state.error}
				update={() => {
					this.detailPanel.current?.hide();
					unHighlightAll();
				}}
			/>
			<DiagramPanel
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				error={this.state.error}
				update={() => {
					this.itemPanel.current?.forceUpdate();
					this.detailPanel.current?.hide();
				}}
			/>
			<DetailPanel
				error={this.state.error}
				ref={this.detailPanel}
				projectLanguage={this.state.projectLanguage}
				update={() => {
					this.itemPanel.current?.forceUpdate();
					this.detailPanel.current?.forceUpdate();
				}}
				resizeElem={(id: string) => {
					this.canvas.current?.resizeElem(id);
				}}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				handleWidth={(width: number) => {
					this.setState({widthRight: width})
				}}
			/>
			{this.state.validation && <ValidationPanel
                widthLeft={this.state.widthLeft}
                widthRight={this.state.widthRight}
                close={() => {
					this.setState({validation: false});
					unHighlightAll();
				}}
                projectLanguage={this.state.projectLanguage}
            />}
			<DiagramCanvas
				ref={this.canvas}
				projectLanguage={this.state.projectLanguage}
				prepareDetails={(id: string) => {
					this.detailPanel.current?.prepareDetails(id);
					this.setState({widthRight: 300});
				}}
				hideDetails={() => {
					this.detailPanel.current?.hide();
					this.setState({widthRight: 0});
				}}
				updateElementPanel={() => {
					this.itemPanel.current?.update();
				}}
				updateDetailPanel={() => {
					this.detailPanel.current?.update();
				}}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				error={this.state.error}
			/>
		</div>);
	}
}
