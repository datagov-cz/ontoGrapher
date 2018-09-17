import React from 'react';
import {StereotypePanelItem} from "./StereotypePanelItem";

export interface StereotypePanelProps {}
export interface StereotypePanelState {}

export class StereotypePanel extends React.Component{
    constructor(props: StereotypePanelItem) {
        super(props);
        this.state = {};
    }
    render(){
        return(
            <div className="stereotypePanel">
                {this.props.children}
            </div>
        );
    }

}

StereotypePanel.defaultProps = {};