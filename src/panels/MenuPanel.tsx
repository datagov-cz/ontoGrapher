import React from 'react';
import {Form, Nav, Navbar} from "react-bootstrap";
import * as Locale from '../locale/LocaleMain.json';
import {Languages, ProjectSettings} from "../var/Variables";
import MenuPanelFile from "./menu/MenuPanelFile";
import MenuPanelHelp from "./menu/MenuPanelHelp";

interface MenuPanelProps{
    readOnly?: boolean;
    // projectName: {[key:string]: string};
    // projectDescription: {[key:string]: string};
    projectLanguage: string;
    //theme: "light" | "dark";
    handleChangeLanguage: any;
    newProject: Function;
    loadProject: Function;
    saveProject: Function;
    //saveProjectSettings: Function;
    saveString: string;
    //saveOGSettings: Function;
}

interface MenuPanelState {
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
        return(<Navbar className={"menuPanel"} variant="light" bg="light">
            <Navbar.Brand>{Locale.ontoGrapher}</Navbar.Brand>
          <Nav className="mr-auto">
              {this.props.readOnly ?
                  // <MenuPanelView />
                  // <MenuPanelHelp />
                  <div></div>
                  :
                  <div className={"inert"}><MenuPanelFile
                    newProject={this.props.newProject}
                    loadProject={this.props.loadProject}
                    saveProject={this.props.saveProject}
                    //saveProjectSettings={this.props.saveProjectSettings}
                    saveString={this.props.saveString}
                    update={() => {this.forceUpdate();}}
                    // projectName={this.props.projectName}
                    // projectDescription={this.props.projectDescription}
                    // theme={this.props.theme}
                    // saveOGSettings={this.props.saveOGSettings}
                  />
                      <MenuPanelHelp /></div>
              }
          </Nav>
            <Navbar.Text className="mr-sm-2">
                {ProjectSettings.name[this.props.projectLanguage].length > 32 ? ProjectSettings.name[this.props.projectLanguage].substr(0,32) + "..." : ProjectSettings.name[this.props.projectLanguage]}
            </Navbar.Text>
            <Form inline>
                <Form.Control as="select" value={this.props.projectLanguage} onChange={this.handleChangeLanguage}>
                    {Object.keys(Languages).map((languageCode) => (<option key={languageCode} value={languageCode}>{Languages[languageCode]}</option>))}
                </Form.Control>
            </Form>

        </Navbar>);
    }
}