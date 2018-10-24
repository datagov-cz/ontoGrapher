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
    }

    handleChangeSelectedLink(str: string) {
        this.setState({selectedLink: str});
    }

    handleChangeFirstCardinality(str: string) {
        this.setState({firstCardinality: str});
    }

    handleChangeSecondCardinality(str: string) {
        this.setState({secondCardinality: str});
    }

    handleChangeLanguage(str: string) {
        this.setState({language: str});
    }

	render() {
		return (
            <div className="content">
				<MenuPanel
                    selectedLink={this.handleChangeSelectedLink}
                    firstCardinality={this.handleChangeFirstCardinality}
                    secondCardinality={this.handleChangeSecondCardinality}
                    language={this.handleChangeLanguage}
                />
				<StereotypePanel/>
				<DiagramCanvas
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