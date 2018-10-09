import React from 'react';
import ReactDOM from 'react-dom';
import {DiagramCanvas} from "./diagram/DiagramCanvas";
import {StereotypePanel} from "./panel/StereotypePanel";
import {MenuPanel} from "./panel/MenuPanel";
import {StereotypePanelItem} from "./panel/StereotypePanelItem";

require("./sass/main.scss");

class App extends React.Component {
	constructor(props){
		super(props);
	}
	render() {
		return (
            <div className="content">

				<StereotypePanel>
                    <StereotypePanelItem model={{type: "category"}} name="Category" color="white"/>
                    <StereotypePanelItem model={{type: "common"}} name="Common" color="white"/>
					<StereotypePanelItem model={{type: "collective"}} name="Collective" color="white"/>
                    <StereotypePanelItem model={{type: "kind"}} name="Kind" color="white"/>
                    <StereotypePanelItem model={{type: "mixin"}} name="Mixin" color="white"/>
                    <StereotypePanelItem model={{type: "mode"}} name="Mode" color="white"/>
                    <StereotypePanelItem model={{type: "phase"}} name="Phase" color="white"/>
                    <StereotypePanelItem model={{type: "quality"}} name="Quality" color="white"/>
                    <StereotypePanelItem model={{type: "quantity"}} name="Quantity" color="white"/>
                    <StereotypePanelItem model={{type: "relator"}} name="Relator" color="white"/>
                    <StereotypePanelItem model={{type: "role"}} name="Role" color="white"/>
                    <StereotypePanelItem model={{type: "roleMixin"}} name="RoleMixin" color="white"/>
                    <StereotypePanelItem model={{type: "subkind"}} name="SubKind" color="white"/>
				</StereotypePanel>
				<DiagramCanvas/>
            </div>
		);
	}
}
ReactDOM.render(<App />,document.getElementById('app'));