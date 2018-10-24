import React from 'react';
import {CustomDiagramModel} from "../diagram/CustomDiagramModel";
import {Defaults} from "../config/Defaults";
import {LinkPool} from "../config/LinkPool";
import {LanguagePool} from "../config/LanguagePool";
import {CardinalityPool} from "../config/CardinalityPool";
import {Locale} from "../config/Locale";

export class MenuPanel extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedLink: Defaults.selectedLink,
            firstCardinality: Defaults.cardinality,
            secondCardinality: Defaults.cardinality,
            language: Defaults.language
        };

        this.linkPool = [];
        for (let link in LinkPool) {
            this.linkPool.push(<option key={link} value={link}>{link}</option>);
        }

        this.languagePool = [];
        for (let language in LanguagePool) {
            this.languagePool.push(<option key={language} value={language}>{LanguagePool[language]}</option>)
        }

        this.cardinalityPool = [];
        for (let cardinality of CardinalityPool){
            this.cardinalityPool.push(<option key={cardinality} value={cardinality}>{cardinality}</option>);
        }

        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.handleChangeFirstCardinality = this.handleChangeFirstCardinality.bind(this);
        this.handleChangeSecondCardinality = this.handleChangeSecondCardinality.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    }

    handleChangeSelectedLink(event) {
        this.props.selectedLink(event.target.value);
        this.setState({selectedLink: event.target.value});
    }

    handleChangeFirstCardinality(event) {
        this.props.firstCardinality(event.target.value);
        this.setState({firstCardinality: event.target.value});
    }

    handleChangeSecondCardinality(event) {
        this.props.secondCardinality(event.target.value);
        this.setState({secondCardinality: event.target.value});
    }

    handleChangeLanguage(event) {
        this.props.language(event.target.value);
        this.setState({language: event.target.value});
    }

    render(){
        return(
            <div className="menuPanel">
                <span className="logo">ontoUML diagram app</span>
                <select value={this.state.selectedLink} onChange={this.handleChangeSelectedLink}>
                    {this.linkPool}
                </select>
                <select value={this.state.firstCardinality} onChange={this.handleChangeFirstCardinality}>
                    {this.cardinalityPool}
                </select>
                <select value={this.state.secondCardinality} onChange={this.handleChangeSecondCardinality}>
                    {this.cardinalityPool}
                </select>
                <select value={this.state.language} onChange={this.handleChangeLanguage}>
                    {this.languagePool}
                </select>
                <button onClick={event => {
                    console.log(JSON.stringify(this.engine.diagramModel.serializeDiagram()));
                }}>{Locale.menuPanelSave}
                </button>
                <button onClick={event => {
                    let str = prompt(Locale.menuPanelInsertJSON);
                    this.registerFactories();
                    let model = new CustomDiagramModel();
                    model.deSerializeDiagram(JSON.parse(str), this.engine);
                    this.engine.setDiagramModel(model);
                    alert(Locale.menuPanelLoaded);
                    this.forceUpdate();
                }}>{Locale.menuPanelLoad}
                </button>
            </div>
        );
    }

}