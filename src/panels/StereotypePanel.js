import React from 'react';
import {StereotypePanelItem} from "./StereotypePanelItem";
import {StereotypePool} from "../config/StereotypePool";


export class StereotypePanel extends React.Component{
    constructor(props: StereotypePanelItem) {
        super(props);
        this.stereotypeList = StereotypePool.map((stereotype) =>
            <StereotypePanelItem key={stereotype.toUpperCase()} model={{type: stereotype.toLowerCase()}} name={stereotype} color="white"/>
        );
    }
    render(){
        return(
            <div className="stereotypePanel">
                {this.stereotypeList}
            </div>
        );
    }

}

StereotypePanel.defaultProps = {};