import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ElementPanel from "../panels/ElementPanel";
import DiagramCanvas from "./DiagramCanvas";
import * as Locale from "../locale/LocaleMain.json";
import * as VariableLoader from "../var/VariableLoader";
import {
    AttributeTypePool, CardinalityPool,
    Diagrams,
    graph,
    Languages,
    Links, MandatoryAttributePool, ModelElements, PackageRoot,
    ProjectElements, ProjectLinks,
    ProjectSettings, StereotypeCategories,
    StereotypePoolPackage, Stereotypes, ViewSettings
} from "../var/Variables";
import {DiagramModel} from "./DiagramModel";
import DetailPanel from "../panels/DetailPanel";
import {getVocabulariesFromJSONSource} from "../interface/JSONInterface";
import * as SemanticWebInterface from "../interface/SemanticWebInterface";
import PropTypes from "prop-types";
import {Defaults} from "../config/Defaults";
import {testing} from "../misc/Helper";
import {PackageNode} from "../components/PackageNode";

interface DiagramAppProps{
    readonly?: boolean;
    loadClasses?: string;
    loadClassesName?: string;
    classIRI?: string;
    loadLanguage?: string;
    loadRelationshipsName?: string;
    loadRelationships?: string;
    relationshipIRI?: string;
    loadDefaultVocabularies?: boolean;
}

interface DiagramAppState{
    // projectName: {[key:string]: string};
    // projectDescription: {[key:string]: string};
    projectLanguage: string;
    saveString: string;
    selectedLink: string;
    detailPanelHidden: boolean;
    //theme: "light" | "dark";
}

require("../scss/style.scss");

export default class DiagramApp extends React.Component<DiagramAppProps, DiagramAppState>{
    private readonly canvas: React.RefObject<DiagramCanvas>;
    private readonly elementPanel: React.RefObject<ElementPanel>;
    private readonly detailPanel: React.RefObject<DetailPanel>;

    constructor(props: DiagramAppProps) {
        super(props);

        this.canvas = React.createRef();
        this.elementPanel = React.createRef();
        this.detailPanel = React.createRef();

        VariableLoader.initVars();

        this.state = ({
            // projectName: VariableLoader.initLanguageObject(Locale.untitledProject),
            // projectDescription: VariableLoader.initLanguageObject(""),
            //theme: "light",
            projectLanguage: Object.keys(Languages)[0],
            selectedLink: Object.keys(Links)[0],
            saveString: "",
            detailPanelHidden: false
        });


        document.title = ProjectSettings.name[this.state.projectLanguage] + " | " + Locale.ontoGrapher;
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.newProject = this.newProject.bind(this);
        //this.saveOGsettings = this.saveOGsettings.bind(this);
        this.loadProject = this.loadProject.bind(this);
        this.saveProject = this.saveProject.bind(this);
        //this.saveProjectSettings = this.saveProjectSettings.bind(this);
        //this.handleChangeSelectedModel = this.handleChangeSelectedModel.bind(this);
        this.prepareDetails = this.prepareDetails.bind(this);
    }

    componentDidMount(): void {
        if (typeof this.props.loadClasses === "string"){
            SemanticWebInterface.fetchClasses(this.props.loadClassesName, this.props.loadClasses, this.props.classIRI, true, this.props.loadLanguage, ()=>{
                this.forceUpdate();
            });
        }
        if (typeof this.props.loadRelationships === "string"){
            SemanticWebInterface.fetchRelationships(this.props.loadRelationshipsName, this.props.loadRelationships, this.props.relationshipIRI, true, this.props.loadLanguage, ()=>{
                this.forceUpdate();
            });
        }
        if (this.props.loadDefaultVocabularies){
            getVocabulariesFromJSONSource(Defaults.defaultVocabularies, ()=>{
                this.forceUpdate();
                this.handleChangeSelectedLink(Object.keys(Links)[0]);
                
                this.elementPanel.current?.update();
            });
        }

        testing();
    }

    prepareDetails(id: string){
        this.detailPanel.current?.prepareDetails(id);
    }
    //
    // handleChangeSelectedModel(model: string){
    //     console.log(model);
    //     this.setState({selectedModel: model});
    // }

    handleChangeLanguage(languageCode: string){
        this.setState({projectLanguage: languageCode});
        document.title = ProjectSettings.name[languageCode] + " | " + Locale.ontoGrapher;
        graph.getCells().forEach((cell) => {
            cell.prop('attrs/label/text', ProjectElements[cell.id].names[languageCode]);
        });
    }

    newProject(){
        VariableLoader.initProjectSettings();
        this.setState({projectLanguage: Object.keys(Languages)[0],
            selectedLink: Object.keys(Links)[0],
            saveString: ""});
        Diagrams.length = 0;
        Diagrams.push([Locale.untitled, {}]);
        StereotypeCategories.length = 0;
        Object.keys(ProjectElements).forEach(el => delete ProjectElements[el]);
        Object.keys(ProjectLinks).forEach(el => delete ProjectLinks[el]);
        PackageRoot.elements = [];
        PackageRoot.children = [];
        this.elementPanel.current?.update();
    }

    loadProject(loadString: string){
        let save = JSON.parse(loadString);
        this.newProject();
        this.setState({
            selectedLink: save.selectedLink,
            projectLanguage: save.projectLanguage
        });
        for (let key in save.projectElements){
            ProjectElements[key] = save.projectElements[key];
        }
        for (let key in save.projectLinks){
            ProjectLinks[key] = save.projectLinks[key];
        }
        ProjectSettings.name = save.projectSettings.name;
        ProjectSettings.description = save.projectSettings.description;
        ProjectSettings.selectedModel = save.projectSettings.selectedModel;
        save.diagrams.forEach((diagram: { [key: string]: any; })=>{Diagrams.push(diagram)});
        PackageRoot.children = save.packageRoot.children;
        PackageRoot.elements = save.packageRoot.elements;
        this.elementPanel.current?.update();

    }

    saveProject(){
        let save = {
            projectElements: ProjectElements,
            projectLinks: ProjectLinks,
            projectSettings: ProjectSettings,
            selectedLink: this.state.selectedLink,
            projectLanguage: this.state.projectLanguage,
            diagrams: Diagrams,
            //viewSettings: ViewSettings,
            packageRoot: {
                children: PackageRoot.children,
                elements: PackageRoot.elements
            },
            // //loaded things
            // stereotypes: Stereotypes,
            // stereotypeCategories: StereotypeCategories,
            // modelElements: ModelElements,
            // links: Links,
            // languages: Languages,
            // properties: MandatoryAttributePool,
            // attributes: AttributeTypePool,
            // cardinalities: CardinalityPool,
        };
        this.setState({saveString: JSON.stringify(save)});
    }
    //
    //
    // saveProjectSettings(save: {[key:string]: string}){
    //     // this.setState({
    //     //     projectName: save.projectName
    //     // });
    // }

    handleChangeSelectedLink(linkType: string) {
        this.setState({selectedLink: linkType});
    }

    // saveOGsettings(input: any){
    //     this.setState({
    //         theme: input.theme
    //     })
    // }

    hide(id:string, diagram: number){
        ProjectElements[id].hidden[diagram] = true;
    }

    render(){
        return(<div className={"app"}>
            <MenuPanel
                newProject={this.newProject}
                projectLanguage={this.state.projectLanguage}
                saveProject={this.saveProject}
                loadProject={this.loadProject}
                //saveProjectSettings={this.saveProjectSettings}
                saveString={this.state.saveString}
                //theme={this.state.theme}
                handleChangeLanguage={this.handleChangeLanguage}
                //saveOGSettings={this.saveOGsettings}
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
            />
            <DiagramCanvas
                hide={this.hide}
                ref={this.canvas}
                selectedLink={this.state.selectedLink}
                projectLanguage={this.state.projectLanguage}
                prepareDetails={this.prepareDetails}
                hideDetails={() => {this.detailPanel.current?.hide();}}
                addCell={() => {this.elementPanel.current?.forceUpdate();}}
            />
        </div>);
  }
}
