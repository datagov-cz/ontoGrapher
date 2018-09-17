import React from 'react';
import {MenuPanelItem} from "./MenuPanelItem";

export class MenuPanel extends React.Component{
    constructor(props: MenuPanelItem) {
        super(props);
    }

    render(){
        return(
            <div className="menuPanel">
                <button>one</button>
                <button>two</button>
            </div>
        );
    }

}