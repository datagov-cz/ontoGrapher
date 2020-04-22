import React from 'react';
import {Form, Nav, Navbar, Spinner} from "react-bootstrap";
import * as Locale from '../locale/LocaleMain.json';
import {Languages, ProjectSettings} from "../var/Variables";
import MenuPanelFile from "./menu/MenuPanelFile";
import MenuPanelHelp from "./menu/MenuPanelHelp";
import MenuPanelAbout from "./menu/MenuPanelAbout";

interface MenuPanelProps{
    readOnly?: boolean;
    projectLanguage: string;
    handleChangeLanguage: any;
    newProject: Function;
    loadProject: Function;
    saveProject: Function;
    saveString: string;
    update: Function;
    loading: boolean;
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
                  <div/>
                  :
                  <div className={"inert"}>
                      <MenuPanelFile
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
                      {/*<MenuPanelView />*/}
                      {/*<MenuPanelSettings update={this.props.update}  projectLanguage={this.props.projectLanguage}/>*/}
                      <MenuPanelHelp />
                      <MenuPanelAbout />
                  </div>
              }
          </Nav>
            <Navbar.Text className="mr-sm-2">
                {this.props.loading ? <Spinner animation="border" size="sm" /> : ""}&nbsp;
                {ProjectSettings.name[this.props.projectLanguage] === "" ? "<untitled>" : ProjectSettings.name[this.props.projectLanguage]}
            </Navbar.Text>
            <Form inline>
                <Form.Control as="select" value={this.props.projectLanguage} onChange={this.handleChangeLanguage}>
                    {Object.keys(Languages).map((languageCode) => (<option key={languageCode} value={languageCode}>{Languages[languageCode]}</option>))}
                </Form.Control>
            </Form>

        </Navbar>);
    }
}