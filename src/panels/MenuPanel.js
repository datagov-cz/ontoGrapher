import React from 'react';
import {LinkPool} from "../config/LinkPool";
import {LanguagePool} from "../config/LanguagePool";
import {CardinalityPool} from "../config/CardinalityPool";
import {Locale} from "../config/Locale";
import {ButtonGroup, DropdownButton, FormControl, MenuItem} from "react-bootstrap";
import EditableLabel from 'react-inline-editing';
import Button from "react-bootstrap/es/Button";


export class MenuPanel extends React.Component {
    constructor(props) {
        super(props);
/*
        this.linkPool = [];
        for (let link in LinkPool) {
            this.linkPool.push(<option key={link} value={link}>{link}</option>);
        }
*/
        this.languagePool = [];
        for (let language in LanguagePool) {
            this.languagePool.push(<option key={language} value={language}>{LanguagePool[language]}</option>)
        }
/*
        this.cardinalityPool = [];
        for (let cardinality of CardinalityPool) {
            this.cardinalityPool.push(<option key={cardinality} value={cardinality}>{cardinality}</option>);
        }
*/
    }

    // TODO: Make it so that an empty name can be retitled again
    // TODO: Make settings modal dialogues and confirmations
    // TODO: Help portal
    render() {
        if (this.props.readOnly){
            return (
                <div className="menuPanel">

                    <span className="left">
                        {this.props.name}
                    </span>
                    <ButtonGroup>
                        <DropdownButton title={Locale.menuPanelView} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem eventKey="1">{Locale.menuPanelCenter}</MenuItem>
                            <MenuItem eventKey="2">{Locale.menuPanelZoom}</MenuItem>
                        </DropdownButton>
                    </ButtonGroup>
                    <span className="right">
                {Locale.selectedLanguage+": "}
                        <FormControl componentClass="select" bsSize="small" value={this.props.language}
                                     onChange={this.props.handleChangeLanguage}>
                    {this.languagePool}
                </FormControl>
</span>

                </div>
            );
        } else {
            return (
                <div className="menuPanel">

                    <EditableLabel
                        labelClassName='nameLabel'
                        inputClassName='nameInput'
                        inputPlaceHolder={Locale.detailPanelName}
                        text={this.props.name}
                        onFocusOut={this.props.handleChangeName}
                    />
                    <ButtonGroup>

                        <DropdownButton title={Locale.menuPanelFile} bsSize="small" id={Locale.menuPanelFile}>
                            <MenuItem onClick={this.props.handleNew} eventKey="1">{Locale.menuPanelNew}</MenuItem>
                            <MenuItem onClick={this.props.handleDeserialize} eventKey="1">{Locale.menuPanelLoad}</MenuItem>
                            <MenuItem onClick={this.props.handleSerialize} eventKey="2">{Locale.menuPanelSave}</MenuItem>
                            <MenuItem onClick={this.props.handleExport} eventKey="3">{Locale.menuPanelExport}</MenuItem>
                        </DropdownButton>
                        <DropdownButton title={Locale.menuPanelView} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem eventKey="1">{Locale.menuPanelCenter}</MenuItem>
                            <MenuItem eventKey="2">{Locale.menuPanelZoom}</MenuItem>
                        </DropdownButton>
                        <DropdownButton title={Locale.menuPanelSettings} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem eventKey="1">{Locale.menuPanelGeneral}</MenuItem>
                            <MenuItem eventKey="2">{Locale.menuPanelSources}</MenuItem>
                            <MenuItem eventKey="3">{Locale.menuPanelLanguages}</MenuItem>
                        </DropdownButton>
                        <Button bsSize="small">
                            {Locale.menuPanelHelp}
                        </Button>
                    </ButtonGroup>
                    <span className="right">
                {Locale.selectedLanguage+": "}
                        <FormControl componentClass="select" bsSize="small" value={this.props.language}
                                     onChange={this.props.handleChangeLanguage}>
                    {this.languagePool}
                </FormControl>
</span>

                </div>
            );
        }

    }

}