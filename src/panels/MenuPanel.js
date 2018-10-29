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

    }

    render(){
        return(
            <div className="menuPanel">
                <span className="logo">ontoUML diagram app</span>
                <select value={this.props.selectedLink} onChange={this.props.handleChangeSelectedLink}>
                    {this.linkPool}
                </select>
                <select value={this.props.firstCardinality} onChange={this.props.handleChangeFirstCardinality}>
                    {this.cardinalityPool}
                </select>
                <select value={this.props.secondCardinality} onChange={this.props.handleChangeSecondCardinality}>
                    {this.cardinalityPool}
                </select>
                <select value={this.props.language} onChange={this.props.handleChangeLanguage}>
                    {this.languagePool}
                </select>
                <button onClick={this.props.handleSerialize}>{Locale.menuPanelSave}
                </button>
                <button onClick={this.props.handleDeserialize}>{Locale.menuPanelLoad}
                </button>
            </div>
        );
    }

}