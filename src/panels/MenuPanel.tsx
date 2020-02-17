import React from 'react';
import {Form, Nav, Navbar} from "react-bootstrap";
import * as Locale from '../locale/LocaleMain.json';
import {Languages} from "../var/Variables";
import {NavbarText} from "react-bootstrap/Navbar";
import MenuPanelFile from "./menu/MenuPanelFile";

interface MenuPanelProps{
    readOnly?: boolean;
    projectName: string;
    projectLanguage: string;
    theme: "light" | "dark";
    handleChangeLanguage: any;
    newProject: Function;
    saveOGSettings: Function;
}

interface MenuPanelState{
}

export default class MenuPanel extends React.Component<MenuPanelProps, MenuPanelState>{
    constructor(props: MenuPanelProps) {
        super(props);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    }

    handleChangeLanguage(event: React.FormEvent<HTMLInputElement>){
        this.props.handleChangeLanguage(event.currentTarget.value);
    }

    render(){
        return(<Navbar variant={this.props.theme} bg={this.props.theme}>
            <Navbar.Brand>{Locale.ontoGrapher}</Navbar.Brand>
          <Nav className="mr-auto">
              {this.props.readOnly ?
                  // <MenuPanelView />
                  // <MenuPanelHelp />
                  <div></div>
                  :
                  <MenuPanelFile
                    newProject={this.props.newProject}
                    theme={this.props.theme}
                    saveOGSettings={this.props.saveOGSettings}
                  />
                  // <MenuPanelEdit />
                  // <MenuPanelView />
                  // <MenuPanelOptions />
                  // <MenuPanelHelp />
              }
          </Nav>
            <Navbar.Text className="mr-sm-2">{this.props.projectName.length > 32 ? this.props.projectName.substr(0,32) + "..." : this.props.projectName}</Navbar.Text>
            <Form inline>
                <Form.Control as="select" value={this.props.projectLanguage} onChange={this.handleChangeLanguage}>
                    {Object.keys(Languages).map((languageCode) => (<option key={languageCode} value={languageCode}>{Languages[languageCode]}</option>))}
                </Form.Control>
            </Form>

        </Navbar>);
    }
}