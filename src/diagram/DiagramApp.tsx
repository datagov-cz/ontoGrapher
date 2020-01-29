import React from 'react';
import MenuPanel from "../panels/MenuPanel";
import ElementPanel from "../panels/ElementPanel";
import DiagramCanvas from "./DiagramCanvas";
import * as Locale from "../locale/Locale.json";

interface DiagramAppProps{
    readonly?: boolean;
}

interface DiagramAppState{
    projectName: string;
}

require("../scss/diagram/DiagramApp.scss");

export default class DiagramApp extends React.Component<DiagramAppProps, DiagramAppState>{
    constructor(props: DiagramAppProps) {
        super(props);
        this.state = ({
            projectName: Locale.untitledProject
        });
    }


    render(){
        return(<div className={"test"}>
            <MenuPanel
                projectName={this.state.projectName}
            />
            <ElementPanel/>
            <DiagramCanvas/>
        </div>);
  }
}