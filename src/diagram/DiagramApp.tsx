import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ItemPanel from "../panels/ItemPanel";
import DiagramCanvas from "./DiagramCanvas";
import * as Locale from "../locale/LocaleMain.json";
import {
	Languages,
	Links,
	PackageRoot,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes
} from "../config/Variables";
import DetailPanel from "../panels/DetailPanel";
import {getVocabulariesFromRemoteJSON} from "../interface/JSONInterface";
import {initLanguageObject, initVars} from "../function/FunctionEditVars";
import {getContext} from "../interface/ContextInterface";
import {graph} from "../graph/Graph";
import {loadProject, newProject} from "../function/FunctionProject";
import {nameGraphElement, nameGraphLink, unHighlightAll} from "../function/FunctionGraph";
import {PackageNode} from "../datatypes/PackageNode";
import {createNewScheme, setupDiagrams} from "../function/FunctionCreateVars";
import {getElementsConfig, getLinksConfig} from "../interface/SPARQLInterface";
import {initRestrictions} from "../function/FunctionRestriction";
import {updateProjectSettings} from "../interface/TransactionInterface";
import ValidationPanel from "../panels/ValidationPanel";

interface DiagramAppProps {
	readOnly?: boolean;
	loadDefaultVocabularies?: boolean;
	contextIRI?: string,
	contextEndpoint?: string
}

interface DiagramAppState {
	selectedLink: string;
	detailPanelHidden: boolean;
	projectLanguage: string;
	loading: boolean;
	status: string;
	error: boolean;
	retry: boolean;
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
			selectedLink: ProjectSettings.selectedLink,
			detailPanelHidden: false,
			loading: true,
			status: Locale.loading,
			error: false,
			retry: false,
			widthLeft: 300,
			widthRight: 0,
			validation: false,
		});
		document.title = Locale.ontoGrapher;
		this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
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
			let diagram = contextIRI.substring(contextIRI.lastIndexOf("/"));
			let match = diagram.match(/(\d+)/);
			let diagramNumber;
			if (match) diagramNumber = parseInt(match[0], 10);
			this.loadVocabularies(contextIRI, "https://graphdb.onto.fel.cvut.cz/repositories/kodi-uloziste-dev", false, diagramNumber ? diagramNumber : 0);
		} else if (this.props.contextIRI && this.props.contextEndpoint) {
			this.loadVocabularies(this.props.contextIRI, this.props.contextEndpoint);
		} else {
			this.newProject();
			getVocabulariesFromRemoteJSON("https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/latest/src/config/Vocabularies.json").then((result) => {
				if (result) {
					this.forceUpdate();
					this.elementPanel.current?.update();
					this.handleChangeLoadingStatus(false, "", false);
				} else this.handleChangeLoadingStatus(false, Locale.pleaseReload, false)
			})
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
		this.setState({
			projectLanguage: Object.keys(Languages)[0],
			selectedLink: Object.keys(Links)[0]
		});
		this.elementPanel.current?.update();
	}

	handleChangeLoadingStatus(loading: boolean, status: string, error: boolean) {
		this.setState({
			loading: loading,
			status: status,
			error: error,
		})
		if (error || !loading) this.setState({retry: false});
	}

	loadProject(loadString: string) {
		this.newProject();
		loadProject(loadString);
		this.setState({
			selectedLink: ProjectSettings.selectedLink,
			projectLanguage: ProjectSettings.selectedLanguage
		});
		this.elementPanel.current?.update();
	}

	loadVocabularies(contextIRI: string, contextEndpoint: string, reload: boolean = false, diagram: number = 0) {
		this.setState({loading: true, status: Locale.loading});
		if (reload) this.newProject();
		getVocabulariesFromRemoteJSON("https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/latest/src/config/Vocabularies.json").then(() => {
			this.handleChangeSelectedLink(Object.keys(Links)[0]);
			getContext(
				contextIRI,
				contextEndpoint,
				"application/json",
				(message: string) => {
					if (message === Locale.loadingError) {
						this.handleChangeLoadingStatus(false, Locale.pleaseReload, false)
					}
				}
            ).then(async () => {
                if (!this.state.error) {
					this.selectDefaultPackage();
					document.title = ProjectSettings.name[this.state.projectLanguage] + " | " + Locale.ontoGrapher;
					ProjectSettings.contextEndpoint = contextEndpoint;
					ProjectSettings.contextIRI = contextIRI
					this.handleChangeLanguage(Object.keys(Languages)[0]);
					initRestrictions();
					await getElementsConfig(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint)
					await getLinksConfig(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint)
					await setupDiagrams(diagram);
					await updateProjectSettings(contextIRI, contextEndpoint, DiagramApp.name);
					this.forceUpdate();
					this.elementPanel.current?.update();
					this.handleChangeLoadingStatus(false, "", false);
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
		ProjectSettings.selectedPackage = new PackageNode(initLanguageObject(Locale.untitledPackage), PackageRoot, false, createNewScheme());
	}

	handleChangeSelectedLink(linkType: string) {
		this.setState({selectedLink: linkType});
		ProjectSettings.selectedLink = linkType;
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
				loadingError={this.state.error}
				retry={() => {
					this.setState({retry: true});
				}}
				validate={this.validate}
			/>
			<ItemPanel
				ref={this.elementPanel}
				handleWidth={(width: number) => {
					this.setState({widthLeft: width})
				}}
				projectLanguage={this.state.projectLanguage}
				handleChangeSelectedLink={this.handleChangeSelectedLink}
				selectedLink={this.state.selectedLink}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				retry={this.state.retry}
			/>
			<DetailPanel
				ref={this.detailPanel}
				projectLanguage={this.state.projectLanguage}
				resizeElem={(id: string) => {
					this.canvas.current?.resizeElem(id);
				}}
				update={() => {
					this.elementPanel.current?.forceUpdate();
				}}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				retry={this.state.retry}
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
				selectedLink={this.state.selectedLink}
				projectLanguage={this.state.projectLanguage}
				prepareDetails={(id: string) => {
					this.detailPanel.current?.prepareDetails(id);
				}}
				hideDetails={() => {
					this.detailPanel.current?.hide();
				}}
				updateElementPanel={() => {
					this.elementPanel.current?.forceUpdate();
				}}
				handleChangeLoadingStatus={this.handleChangeLoadingStatus}
				retry={this.state.retry}
			/>
		</div>);
	}
}
