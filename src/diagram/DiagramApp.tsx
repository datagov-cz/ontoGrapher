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
import {graph} from "../graph/graph";
import {loadProject, newProject} from "../function/FunctionProject";
import {nameGraphElement, nameGraphLink} from "../function/FunctionGraph";
import {PackageNode} from "../datatypes/PackageNode";
import {createNewScheme, setupDiagrams} from "../function/FunctionCreateVars";
import {getElementsConfig, getLinksConfig} from "../interface/SPARQLInterface";
import {initRestrictions} from "../function/FunctionRestriction";

interface DiagramAppProps {
	readOnly?: boolean;
	loadDefaultVocabularies?: boolean;
}

interface DiagramAppState {
	selectedLink: string;
	detailPanelHidden: boolean;
	projectLanguage: string;
	loading: boolean;
	status: string;
	error: boolean;
	retry: boolean;
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
		});
		document.title = Locale.ontoGrapher;
		this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
		this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
		this.newProject = this.newProject.bind(this);
		this.loadProject = this.loadProject.bind(this);
		this.loadVocabularies = this.loadVocabularies.bind(this);
		this.handleChangeLoadingStatus = this.handleChangeLoadingStatus.bind(this);
	}

	componentDidMount(): void {
		if (this.props.loadDefaultVocabularies) {
			this.loadVocabularies(
				"http://example.org/pracovni-prostor/metadatový-kontext-123"
				, "http://localhost:7200/repositories/kodi-pracovni-prostor-validace");
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

	loadVocabularies(contextIRI: string, contextEndpoint: string, reload: boolean = false) {
		if (reload) {
			this.newProject();
			this.setState({loading: true, status: Locale.loading});
		}
		getVocabulariesFromRemoteJSON("https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/master/src/config/Vocabularies.json", () => {
		}).then(() => {
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
			).then(() => {
				if (!this.state.error) {
					this.selectDefaultPackage();
					document.title = ProjectSettings.name[this.state.projectLanguage] + " | " + Locale.ontoGrapher;
					ProjectSettings.contextEndpoint = contextEndpoint;
					ProjectSettings.contextIRI = contextIRI
					this.handleChangeLanguage(Object.keys(Languages)[0]);
					initRestrictions();
					getElementsConfig(ProjectSettings.contextEndpoint).then((result) => {
						if (result) getLinksConfig(ProjectSettings.contextEndpoint).then((result) => {
							if (result) setupDiagrams().then((result) => {
								if (result) {
									this.forceUpdate();
									this.elementPanel.current?.update();
									this.handleChangeLoadingStatus(false, "", false);
								}
							});
						});
					});
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
			/>
			<ItemPanel
				ref={this.elementPanel}
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
			/>
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
