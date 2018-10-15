import React from 'react';
import ReactDOM from 'react-dom';
import {DiagramCanvas} from "./diagram/DiagramCanvas";
import {StereotypePanel} from "./panel/StereotypePanel";
import {MenuPanel} from "./panel/MenuPanel";
import {StereotypePanelItem} from "./panel/StereotypePanelItem";
import {StereotypePool} from "./diagram/StereotypePool";

require("./sass/main.scss");

class App extends React.Component {
	constructor(props){
		super(props);
	}
	render() {
	    const stereotypeList = StereotypePool.map((stereotype) =>
			<StereotypePanelItem key={stereotype.toUpperCase()} model={{type: stereotype.toLowerCase()}} name={stereotype} color="white"/>
		);
		return (
            <div className="content">

				<StereotypePanel>
					{stereotypeList}
				</StereotypePanel>
				<DiagramCanvas/>
            </div>
		);
	}
}
ReactDOM.render(<App />,document.getElementById('app'));