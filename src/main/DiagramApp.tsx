import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ItemPanel from "../panels/ItemPanel";
import DiagramCanvas from "./DiagramCanvas";
import {Languages, PackageRoot, ProjectElements, ProjectLinks, ProjectSettings, Schemes} from "../config/Variables";
import DetailPanel from "../panels/DetailPanel";
import {getVocabulariesFromRemoteJSON} from "../interface/JSONInterface";
import {addRelationships, initLanguageObject, initVars} from "../function/FunctionEditVars";
import {getContext} from "../interface/ContextInterface";
import {graph} from "../graph/Graph";
import {loadProject, newProject} from "../function/FunctionProject";
import {nameGraphElement, nameGraphLink, unHighlightAll} from "../function/FunctionGraph";
import {PackageNode} from "../datatypes/PackageNode";
import {createNewScheme, setupDiagrams} from "../function/FunctionCreateVars";
import {getElementsConfig, getLinksConfig, getSettings} from "../interface/SPARQLInterface";
import {initConnections, initRestrictions} from "../function/FunctionRestriction";
import {updateProjectSettings} from "../interface/TransactionInterface";
import ValidationPanel from "../panels/ValidationPanel";
import DiagramPanel from "../panels/DiagramPanel";
import {Locale} from "../config/Locale";
import {getBrowserLanguage} from "../function/FunctionGetVars";

interface DiagramAppProps {
	readOnly?: boolean;
	loadDefaultVocabularies?: boolean;
	contextIRI?: string,
	contextEndpoint?: string
}

interface DiagramAppState {
	detailPanelHidden: boolean;
	projectLanguage: string;
	loading: boolean;
	status: string;
	error: boolean;
	widthLeft: number;
	widthRight: number;
	validation: boolean;
}

require("../scss/style.scss");

export default class DiagramApp extends React.Component<DiagramAppProps, DiagramAppState> {
	private readonly canvas: React.RefObject<DiagramCanvas>;
	private readonly elementPanel: React.RefObject<ItemPanel>;
	private readonly detailPanel: React.RefObject<DetailPanel>;
	private readonly menuPanel: React.RefObject<MenuPanel>;

	constructor(props: DiagramAppProps) {
		super(props);

		this.canvas = React.createRef();
		this.elementPanel = React.createRef();
		this.detailPanel = React.createRef();
		this.menuPanel = React.createRef();

		initVars();

		this.state = ({
			projectLanguage: ProjectSettings.selectedLanguage,
			detailPanelHidden: false,
			loading: true,
			status: Locale[ProjectSettings.selectedLanguage].loading,
			error: false,
			widthLeft: 300,
			widthRight: 0,
			validation: false,
		});
		document.title = Locale[this.state.projectLanguage].ontoGrapher;
		this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
		this.newProject = this.newProject.bind(this);
		this.loadProject = this.loadProject.bind(this);
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
			if (contextIRI.includes("/diagram-")){
				let diagram = contextIRI.substring(contextIRI.lastIndexOf("/"));
				let match = diagram.match(/(\d+)/);
				let diagramNumber;
				if (match) diagramNumber = parseInt(match[0], 10);
				this.loadVocabularies(contextIRI, "https://graphdb.onto.fel.cvut.cz/repositories/kodi-uloziste-dev", false, diagramNumber ? diagramNumber : 0);
			} else this.loadVocabularies(contextIRI, "https://graphdb.onto.fel.cvut.cz/repositories/kodi-uloziste-dev", false, 0);
		} else if (this.props.contextIRI && this.props.contextEndpoint) {
			this.loadVocabularies(this.props.contextIRI, this.props.contextEndpoint);
		} else {
			this.newProject();
			this.handleChangeLoadingStatus(false, "", false);
		}
	}

	handleChangeLanguage(languageCode: string) {
		this.setState({projectLanguage: languageCode});
		ProjectSettings.selectedLanguage = languageCode;
		document.title = ProjectSettings.name[languageCode] + " | " + Locale.ontoGrapher;
		graph.getElements().forEach((cell) => {
			if (ProjectElements[cell.id]) {
				nameGraphElement(cell, languageCode);
			}
		});
		graph.getLinks().forEach((cell) => {
			if (ProjectLinks[cell.id]) {
				nameGraphLink(cell, languageCode);
			}
		})
	}

	newProject() {
		newProject();
		let userLang = getBrowserLanguage();
		this.setState({
			projectLanguage: userLang in Languages ? userLang : "en",
		});
		this.elementPanel.current?.forceUpdate();
	}

	handleChangeLoadingStatus(loading: boolean, status: string, error: boolean) {
		this.setState({
			loading: loading,
			status: status,
			error: error,
		});
	}

	loadProject(loadString: string) {
		this.newProject();
		loadProject(loadString);
		this.setState({projectLanguage: ProjectSettings.selectedLanguage});
		this.elementPanel.current?.forceUpdate();
	}

	loadVocabularies(contextIRI: string, contextEndpoint: string, reload: boolean = false, diagram: number = 0) {
		this.setState({loading: true, status: Locale[this.state.projectLanguage].loading});
		if (reload) this.newProject();
		getVocabulariesFromRemoteJSON("https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/latest/src/config/Vocabularies.json").then(() => {
			getContext(
				contextIRI,
				contextEndpoint,
				"application/json",
				(message: string) => {
					if (message === Locale[this.state.projectLanguage].loadingError) {
						this.handleChangeLoadingStatus(false, Locale[this.state.projectLanguage].pleaseReload, false)
					}
				}
            ).then(async () => {
                if (!this.state.error) {
					this.selectDefaultPackage();
					document.title = ProjectSettings.name[this.state.projectLanguage] + " | " + Locale.ontoGrapher;
					ProjectSettings.contextEndpoint = contextEndpoint;
					ProjectSettings.contextIRI = contextIRI
					this.handleChangeLanguage(Object.keys(Languages)[0]);
					await getElementsConfig(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint);
					await getLinksConfig(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint);
					await getSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint);
					this.handleChangeLoadingStatus(true, ProjectSettings.initialized ?
						Locale[this.state.projectLanguage].updatingData : Locale[this.state.projectLanguage].initializingData, false);
					initRestrictions();
					addRelationships();
					initConnections();
					await setupDiagrams(diagram);
					await updateProjectSettings(contextIRI, contextEndpoint);
					this.forceUpdate();
					this.elementPanel.current?.forceUpdate();
					this.handleChangeLoadingStatus(false, Locale[this.state.projectLanguage].workspaceReady, false);
				}
            })
        });
	}

	selectDefaultPackage() {
		for (let pkg of PackageRoot.children) {
			if (pkg.scheme && !Schemes[pkg.scheme].readOnly) {
				ProjectSettings.selectedPackage = pkg;
				return;
			}
		}
		ProjectSettings.selectedPackage = new PackageNode(initLanguageObject(Locale[this.state.projectLanguage].untitledPackage), PackageRoot, false, createNewScheme());
	}

	validate() {
		this.setState({validation: true});
	}

	render() {
		return (<div className={"app"}>
			<MenuPanel
				ref={this.menuPanel}
				loading={this.state.loading}
				newProject={this.newProject}
				status={this.state.status}
				projectLanguage={this.state.projectLanguage}
				loadProject={this.loadProject}
				loadContext={this.loadVocabularies}
				handleChangeLanguage={this.handleChangeLanguage}
				update={() => {
					this.elementPanel.current?.update();
				}}
				closeDetailPanel={() => {
					this.detailPanel.current?.hide();
					unHighlightAll();
				}}
				loadingError={this.state.error}
				validate={this.validate}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
			/>
			<ItemPanel
				ref={this.elementPanel}
				handleWidth={(width: number) => {
					this.setState({widthLeft: width})
				}}
				projectLanguage={this.state.projectLanguage}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
			/>
			<DiagramPanel
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				projectLanguage={this.state.projectLanguage}/>
			<DetailPanel
				ref={this.detailPanel}
				projectLanguage={this.state.projectLanguage}
				resizeElem={(id: string) => {
					this.canvas.current?.resizeElem(id);
				}}
				update={() => {
					this.elementPanel.current?.forceUpdate();
					this.detailPanel.current?.forceUpdate();
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
				updateElementPanel={(position?: { x: number, y: number }) => {
					this.elementPanel.current?.update(position);
					this.detailPanel.current?.update();
				}}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
			/>
		</div>);
	}
}
