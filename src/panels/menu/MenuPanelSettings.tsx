import React from 'react';
import {NavDropdown} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import * as LocaleMain from "../../locale/LocaleMain.json";
import SettingsStereotypeModal from "./settings/SettingsStereotypeModal";
import SettingsAttributeTypeModal from "./settings/SettingsAttributeTypeModal";
import SettingsCardinalityModal from "./settings/SettingsCardinalityModal";
import SettingsLanguageModal from "./settings/SettingsLanguageModal";
import SettingsLinksModal from "./settings/SettingsLinksModal";

interface Props {
    projectLanguage:string;
}

interface State {
    modalAttributeType: boolean;
    modalCardinality: boolean;
    modalLanguage: boolean;
    modalLink: boolean;
    modalStereotype: boolean;
}

export default class MenuPanelSettings extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            modalAttributeType: false,
            modalCardinality: false,
            modalLanguage: false,
            modalLink: false,
            modalStereotype: false
        }
    }

    render() {
        return (<NavDropdown title={LocaleMenu.settings} id="basic-nav-dropdown">

            <NavDropdown.Item
                onClick={() => {
                    this.setState({modalStereotype: true})
                }}
            >{LocaleMain.menuPanelStereotypes}</NavDropdown.Item>
            <SettingsStereotypeModal modal={this.state.modalStereotype} close={() => {
                this.setState({modalStereotype: false})
            }} projectLanguage={this.props.projectLanguage}/>

            <NavDropdown.Item
                onClick={() => {
                    this.setState({modalLink: true})
                }}
            >{LocaleMain.menuPanelLinks}</NavDropdown.Item>
            <SettingsLinksModal modal={this.state.modalLink} close={() => {
                this.setState({modalLink: false})
            }} projectLanguage={this.props.projectLanguage}/>


            <NavDropdown.Item
                onClick={() => {
                    this.setState({modalLanguage: true})
                }}
            >{LocaleMain.menuPanelLanguages}</NavDropdown.Item>
            <SettingsLanguageModal modal={this.state.modalLanguage} close={() => {
                this.setState({modalLanguage: false})
            }}/>


            <NavDropdown.Item
                onClick={() => {
                    this.setState({modalCardinality: true})
                }}
            >{LocaleMain.menuPanelCardinalities}</NavDropdown.Item>
            <SettingsCardinalityModal modal={this.state.modalCardinality} close={() => {
                this.setState({modalCardinality: false})
            }}/>


            <NavDropdown.Item
                onClick={() => {
                    this.setState({modalAttributeType: true})
                }}
            >{LocaleMain.menuPanelAttributeTypes}</NavDropdown.Item>
            <SettingsAttributeTypeModal modal={this.state.modalAttributeType} close={() => {
                this.setState({modalAttributeType: false})
            }}/>


        </NavDropdown>);
    }
}