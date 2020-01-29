import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ElementPanel from "../panels/ElementPanel";
import DiagramCanvas from "./DiagramCanvas";
import * as Locale from "../locale/Locale.json";
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

require("../scss/diagram/DiagramApp.scss");

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
    }

    componentDidMount(): void {
    }

    handleChangeLanguage(languageCode: string){
        this.setState({projectLanguage: languageCode});
    }

    render(){
        return(<div className={"test"}>
            <MenuPanel
                projectName={this.state.projectName}
                projectLanguage={this.state.projectLanguage}
                theme={this.state.theme}
                handleChangeLanguage={this.handleChangeLanguage}
            />
            <ElementPanel/>
            <DiagramCanvas/>
        </div>);
  }
}