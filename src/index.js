import React from 'react';
import ReactDOM from 'react-dom';
import {DiagramCanvas} from "./diagram/DiagramCanvas";
import {StereotypePanel} from "./panels/StereotypePanel";
import {MenuPanel} from "./panels/MenuPanel";
import {StereotypePanelItem} from "./panels/StereotypePanelItem";
import {StereotypePool} from "./config/StereotypePool";
import {Defaults} from "./config/Defaults";

require("./sass/main.scss");

class App extends React.Component {
	constructor(props){
		super(props);
        this.state = {
            selectedLink: Defaults.selectedLink,
            firstCardinality: Defaults.cardinality,
            secondCardinality: Defaults.cardinality,
            language: Defaults.language
        };

        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.handleChangeFirstCardinality = this.handleChangeFirstCardinality.bind(this);
        this.handleChangeSecondCardinality = this.handleChangeSecondCardinality.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);

        this.serialize = this.serialize.bind(this);
        this.deserialize = this.deserialize.bind(this);
        this.export = this.export.bind(this);
    }

    handleChangeSelectedLink(event) {
        this.setState({selectedLink: event.target.value});
        this.diagramCanvas.engine.getDiagramModel().selectedLink = event.target.value;
    }

    handleChangeFirstCardinality(event) {
        this.setState({firstCardinality: event.target.value});
        this.diagramCanvas.engine.getDiagramModel().firstCardinality = event.target.value;
    }

    handleChangeSecondCardinality(event) {
        this.setState({secondCardinality: event.target.value});
        this.diagramCanvas.engine.getDiagramModel().secondCardinality = event.target.value;
    }

    handleChangeLanguage(event) {
        this.setState({language: event.target.value});
        this.diagramCanvas.engine.getDiagramModel().language = event.target.value;
    }

    serialize(){
        this.diagramCanvas.serialize();
    }

    deserialize(){
        this.diagramCanvas.deserialize();
    }

    export(){
	    this.diagramCanvas.export();
    }

	render() {
		return (
            <div className="content">
				<MenuPanel
                    handleChangeSelectedLink={this.handleChangeSelectedLink}
                    handleChangeFirstCardinality={this.handleChangeFirstCardinality}
                    handleChangeSecondCardinality={this.handleChangeSecondCardinality}
                    handleChangeLanguage={this.handleChangeLanguage}
                    selectedLink={this.state.selectedLink}
                    firstCardinality={this.state.firstCardinality}
                    secondCardinality={this.state.secondCardinality}
                    language={this.state.language}
                    handleSerialize={this.serialize}
                    handleDeserialize={this.deserialize}
                    handleExport={this.export}
                />
				<StereotypePanel/>
				<DiagramCanvas
                    ref={instance => {this.diagramCanvas = instance;}}
                    selectedLink={this.state.selectedLink}
                    firstCardinality={this.state.firstCardinality}
                    secondCardinality={this.state.secondCardinality}
                    language={this.state.language}
                />
            </div>
		);
	}
}
ReactDOM.render(<App />,document.getElementById('app'));