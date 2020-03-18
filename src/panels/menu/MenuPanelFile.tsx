import React from 'react';
import {NavDropdown} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import FileNewModal from "./file/FileNewModal";
import FileOGSettingsModal from "./file/FileOGSettingsModal";
import FileLoadModal from "./file/FileLoadModal";
import FileSaveModal from "./file/FileSaveModal";
import FileProjectSettingsModal from "./file/FileProjectSettingsModal";

interface MenuPanelFileProps {
    newProject: Function;
    //theme: string;
    //saveOGSettings: Function;
    loadProject: Function;
    saveProject: Function;
    //saveProjectSettings: Function;
    saveString: string;
    update: Function;
    // projectName: { [key: string]: string };
    // projectDescription: { [key: string]: string };
}

interface MenuPanelFileState {
    modalFileNew: boolean;
    modalFileProjectSettings: boolean;
    modalFileLoad: boolean;
    modalFileSave: boolean;
    modalFileOGSettings: boolean;
    loadSuccess: boolean;
    loadString: string;

}

export default class MenuPanelFile extends React.Component<MenuPanelFileProps, MenuPanelFileState> {
    constructor(props: MenuPanelFileProps) {
        super(props);
        this.state = {
            modalFileNew: false,
            modalFileProjectSettings: false,
            modalFileLoad: false,
            modalFileSave: false,
            modalFileOGSettings: false,
            loadSuccess: true,
            loadString: ""
        };
        this.newProject = this.newProject.bind(this);
        this.loadProject = this.loadProject.bind(this);
        this.saveProject = this.saveProject.bind(this);
        //this.saveProjectSettings = this.saveProjectSettings.bind(this);
    }

    newProject() {
        this.setState({modalFileNew: false});
        this.props.newProject();
    }

    loadProject(load: string) {
        this.props.loadProject(load);

        this.setState({modalFileLoad: false});
    }

    saveProject() {
        this.props.saveProject();
    }
    //
    // saveProjectSettings() {
    //     this.props.saveProjectSettings(this.state.projectSettings);
    // }

    render() {
        return (<NavDropdown title={LocaleMenu.file} id="basic-nav-dropdown">
            <NavDropdown.Item onClick={() => {
                this.setState({modalFileNew: true})
            }}>{LocaleMenu.newProject}</NavDropdown.Item>
            <FileNewModal modal={this.state.modalFileNew} close={() => {
                this.setState({modalFileNew: false})
            }} newProject={this.newProject}/>

            <NavDropdown.Item onClick={() => {
                this.setState({modalFileLoad: true})
            }}>{LocaleMenu.loadProject}</NavDropdown.Item>
            <FileLoadModal modal={this.state.modalFileLoad} close={() => {
                this.setState({modalFileLoad: false})
            }} loadProject={this.loadProject}/>

            <NavDropdown.Item onClick={() => {
                this.setState({modalFileSave: true}); this.props.saveProject();
            }}>{LocaleMenu.saveProject}</NavDropdown.Item>
            <FileSaveModal modal={this.state.modalFileSave} close={() => {
                this.setState({modalFileSave: false})
            }} saveProject={this.saveProject} saveString={this.props.saveString}/>


            <NavDropdown.Item onClick={() => {
                this.setState({modalFileProjectSettings: true})
            }}>{LocaleMenu.projectSettings}</NavDropdown.Item>
            <FileProjectSettingsModal modal={this.state.modalFileProjectSettings} close={() => {
                this.setState({modalFileProjectSettings: false});
                this.props.update();
            }}/>

            {/*<NavDropdown.Divider/>*/}
            {/*<NavDropdown.Item onClick={() => {*/}
            {/*    this.setState({modalFileOGSettings: true})*/}
            {/*}}>{LocaleMenu.OGsettings}</NavDropdown.Item>*/}
            {/*<FileOGSettingsModal modal={this.state.modalFileOGSettings} close={() => {*/}
            {/*    this.setState({modalFileOGSettings: false})*/}
            {/*}} saveOGSettings={this.props.saveOGSettings} theme={this.props.theme}/>*/}
        </NavDropdown>);
    }
}