import React from 'react';
import Locale from './locale/Locale.json';
import {Button} from "react-bootstrap";
import MenuPanel from "./panels/MenuPanel";
import ElementPanel from "./panels/ElementPanel";
import DiagramCanvas from "./diagram/DiagramCanvas";

interface OntoGrapherProps{
}

interface OntoGrapherState{

}

export default class OntoGrapher extends React.Component<OntoGrapherProps, OntoGrapherState>{
    constructor(props: OntoGrapherProps) {
        super(props);
        this.state = ({});
    }


    render(){
        return(<div>
            <MenuPanel/>
            <ElementPanel/>
            <DiagramCanvas/>
        </div>);
  }
}