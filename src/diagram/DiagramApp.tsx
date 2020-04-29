import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ElementPanel from "../panels/ElementPanel";
import DiagramCanvas from "./DiagramCanvas";
import * as Locale from "../locale/LocaleMain.json";
import {Links, PackageRoot, ProjectElements, ProjectSettings} from "../config/Variables";
import DetailPanel from "../panels/DetailPanel";
import {getVocabulariesFromRemoteJSON} from "../interface/JSONInterface";
import {
    addDomainOfIRIs,
    getModelName,
    getStereotypeList,
    initLanguageObject,
    initVars
} from "../function/FunctionEditVars";
import {getContext} from "../interface/ContextInterface";
import {graph} from "../graph/graph";

interface DiagramAppProps {
    readOnly?: boolean;
    loadDefaultVocabularies?: boolean;
}

interface DiagramAppState {
    selectedLink: string;
    detailPanelHidden: boolean;
    projectLanguage: string;
    loading: boolean;
}

require("../scss/style.scss");

export default class DiagramApp extends React.Component<DiagramAppProps, DiagramAppState> {
    private readonly canvas: React.RefObject<DiagramCanvas>;
    private readonly elementPanel: React.RefObject<ElementPanel>;
    private readonly detailPanel: React.RefObject<DetailPanel>;
    private readonly menuPanel: React.RefObject<MenuPanel>;

    constructor(props: DiagramAppProps) {
        super(props);

        this.canvas = React.createRef();
        this.elementPanel = React.createRef();
        this.detailPanel = React.createRef();
        this.menuPanel = React.createRef();

        initVars();

        ProjectSettings.status = "";

        this.state = ({
            projectLanguage: ProjectSettings.selectedLanguage,
            selectedLink: ProjectSettings.selectedLink,
            detailPanelHidden: false,
            loading: true
        });

        document.title = Locale.ontoGrapher;
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.newProject = this.newProject.bind(this);
        this.loadProject = this.loadProject.bind(this);
        this.saveProject = this.saveProject.bind(this);
        this.prepareDetails = this.prepareDetails.bind(this);
        this.loadVocabularies = this.loadVocabularies.bind(this);
    }

    handleChangeLanguage(languageCode: string) {
        this.setState({projectLanguage: languageCode});
        ProjectSettings.selectedLanguage = languageCode;
        document.title = ProjectSettings.name[languageCode] + " | " + Locale.ontoGrapher;
        graph.getCells().forEach((cell) => {
            if (ProjectElements[cell.id]) {

                if (ProjectElements[cell.id].active) {
                    cell.prop('attrs/label/text', getStereotypeList(ProjectElements[cell.id].iri, languageCode).map((str) => "«" + str.toLowerCase() + "»\n").join("") + ProjectElements[cell.id].names[languageCode]);
                } else {
                    cell.prop('attrs/label/text', getModelName(ProjectElements[cell.id].iri, languageCode));
                }
            }
        });
    }

    loadVocabularies(contextIRI: string, contextEndpoint: string, reload: boolean = false) {
        if (reload) {
            this.newProject();
            this.setState({loading: true});
            ProjectSettings.status = Locale.loading;
        }
        getVocabulariesFromRemoteJSON("https://raw.githubusercontent.com/opendata-mvcr/ontoGrapher/jointjs/src/config/Vocabularies.json", () => {
        }).then(() => {
            this.handleChangeSelectedLink(Object.keys(Links)[0]);
            getContext(
                contextIRI,
                contextEndpoint,
                "application/json",
                () => {
                }
            ).then(() => {
                this.forceUpdate();
                this.elementPanel.current?.update();
                ProjectSettings.selectedPackage = PackageRoot.children[0];
                PackageRoot.labels = initLanguageObject(Locale.root);
                this.setState({loading: false});
                addDomainOfIRIs();
                document.title = ProjectSettings.name[this.state.projectLanguage] + " | " + Locale.ontoGrapher;
                ProjectSettings.status = ProjectSettings.status === Locale.loadingError ? Locale.loadingError : "";
            })
        });
    }

    componentDidMount(): void {
        if (this.props.loadDefaultVocabularies) {
            this.loadVocabularies(
                "http://example.org/pracovni-prostor/metadatový-kontext-123"
                , "https://onto.fel.cvut.cz:7200/repositories/kodi-pracovni-prostor-sample");
        }
    }

    prepareDetails(id: string) {
        this.detailPanel.current?.prepareDetails(id);
    }

    handleChangeSelectedLink(linkType: string) {
        this.setState({selectedLink: linkType});
        ProjectSettings.selectedLink = linkType;
    }

    hide(id: string, diagram: number) {
        ProjectElements[id].hidden[diagram] = true;
    }

    render() {
        return (<div className={"app"}>
            <MenuPanel
                ref={this.menuPanel}
                loading={this.state.loading}
                newProject={this.newProject}
                projectLanguage={this.state.projectLanguage}
                saveProject={this.saveProject}
                loadProject={this.loadProject}
                loadContext={this.loadVocabularies}
                handleChangeLanguage={this.handleChangeLanguage}
                update={() => {
                    this.elementPanel.current?.update();
                }}
            />
            <ElementPanel
                ref={this.elementPanel}
                projectLanguage={this.state.projectLanguage}
                handleChangeSelectedLink={this.handleChangeSelectedLink}
                selectedLink={this.state.selectedLink}
            />
            <DetailPanel
                ref={this.detailPanel}
                projectLanguage={this.state.projectLanguage}
                resizeElem={(id: string) => {
                    this.canvas.current?.resizeElem(id)
                }}
                update={() => {
                    this.elementPanel.current?.forceUpdate()
                }}
            />
            <DiagramCanvas
                hide={this.hide}
                ref={this.canvas}
                selectedLink={this.state.selectedLink}
                projectLanguage={this.state.projectLanguage}
                prepareDetails={this.prepareDetails}
                hideDetails={() => {
                    this.detailPanel.current?.hide();
                }}
                addCell={() => {
                    this.elementPanel.current?.forceUpdate();
                }}
            />
        </div>);
    }
}
