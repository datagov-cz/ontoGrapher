import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ElementPanel from "../panels/ElementPanel";
import DiagramCanvas from "./DiagramCanvas";
import * as Locale from "../locale/LocaleMain.json";
import * as VariableLoader from "../var/VariableLoader";
import {Languages, ProjectSettings} from "../var/Variables";
import {DiagramModel} from "./DiagramModel";

interface DiagramAppProps{
    readonly?: boolean;
}

interface DiagramAppState{
    // projectName: {[key:string]: string};
    // projectDescription: {[key:string]: string};
    projectLanguage: string;
    saveString: string;
    //theme: "light" | "dark";
}

require("../scss/style.scss");

export default class DiagramApp extends React.Component<DiagramAppProps, DiagramAppState>{
    private readonly canvas: React.RefObject<DiagramCanvas>;
    public model: DiagramModel;

    constructor(props: DiagramAppProps) {
        super(props);

        this.canvas = React.createRef();
        this.model = new DiagramModel();

        VariableLoader.initVars();

        this.state = ({
            // projectName: VariableLoader.initLanguageObject(Locale.untitledProject),
            // projectDescription: VariableLoader.initLanguageObject(""),
            //theme: "light",
            projectLanguage: Object.keys(Languages)[0],
            saveString: ""
        });


        document.title = ProjectSettings.name[this.state.projectLanguage] + " | " + Locale.ontoGrapher;
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.newProject = this.newProject.bind(this);
        //this.saveOGsettings = this.saveOGsettings.bind(this);
        this.loadProject = this.loadProject.bind(this);
        this.saveProject = this.saveProject.bind(this);
        this.saveProjectSettings = this.saveProjectSettings.bind(this);
    }

    componentDidMount(): void {
    }

    handleChangeLanguage(languageCode: string){
        this.setState({projectLanguage: languageCode});
        document.title = ProjectSettings.name[languageCode] + " | " + Locale.ontoGrapher;
    }

    //TODO: unfinished function
    newProject(){
        VariableLoader.initProjectSettings();
        this.setState({projectLanguage: Object.keys(Languages)[0]});
    }

    //TODO: unfinished function
    loadProject(loadString: string){

    }

    //TODO: unfinished function
    saveProject(){
        this.setState({saveString: ""});
    }

    //TODO: unfinished function
    saveProjectSettings(save: {[key:string]: string}){
        // this.setState({
        //     projectName: save.projectName
        // });
    }

    // saveOGsettings(input: any){
    //     this.setState({
    //         theme: input.theme
    //     })
    // }

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
            <ElementPanel/>
            <DiagramCanvas
                ref={this.canvas}
                model={this.model}
            />
        </div>);
  }
}