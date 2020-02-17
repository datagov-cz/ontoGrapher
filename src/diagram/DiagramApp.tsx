import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ElementPanel from "../panels/ElementPanel";
import DiagramCanvas from "./DiagramCanvas";
import * as Locale from "../locale/LocaleMain.json";
import * as VariableLoader from "../var/VariableLoader";
import {Languages} from "../var/Variables";

interface DiagramAppProps{
    readonly?: boolean;
}

interface DiagramAppState{
    projectName: string;
    projectLanguage: string;
    theme: "light" | "dark";
}

require("../scss/style.scss");

export default class DiagramApp extends React.Component<DiagramAppProps, DiagramAppState>{
    constructor(props: DiagramAppProps) {
        super(props);

        VariableLoader.initVars();

        this.state = ({
            projectName: Locale.untitledProject,
            theme: "light",
            projectLanguage: Object.keys(Languages)[0]
        });


        document.title = this.state.projectName + " | " + Locale.ontoGrapher;
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.newProject = this.newProject.bind(this);
        this.saveOGsettings = this.saveOGsettings.bind(this);
    }

    componentDidMount(): void {
    }

    handleChangeLanguage(languageCode: string){
        this.setState({projectLanguage: languageCode});
    }

    newProject(){
        this.setState({projectName: Locale.untitledProject,
        projectLanguage: Object.keys(Languages)[0]});
    }

    saveOGsettings(input: any){
        this.setState({
            theme: input.theme
        })
    }

    render(){
        return(<div className={"app"}>
            <MenuPanel
                newProject={this.newProject}
                projectName={this.state.projectName}
                projectLanguage={this.state.projectLanguage}
                theme={this.state.theme}
                handleChangeLanguage={this.handleChangeLanguage}
                saveOGSettings={this.saveOGsettings}
            />
            <ElementPanel/>
            <DiagramCanvas/>
        </div>);
  }
}