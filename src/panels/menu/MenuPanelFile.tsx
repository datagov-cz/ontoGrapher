import React from 'react';
import {NavDropdown} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import FileNewModal from "./file/FileNewModal";
import FileLoadModal from "./file/FileLoadModal";
import FileSaveModal from "./file/FileSaveModal";
import FileProjectSettingsModal from "./file/FileProjectSettingsModal";
import FileExportModal from "./file/FileExportModal";
import FileFetchContextModal from "./file/FileFetchContextModal";

interface MenuPanelFileProps {
    newProject: Function;
    loadProject: Function;
    saveProject: Function;
    saveString: string;
    update: Function;
    loadContext: Function;
}

interface MenuPanelFileState {
    modalFileNew: boolean;
    modalFileProjectSettings: boolean;
    modalFileLoad: boolean;
    modalFileSave: boolean;
    modalFileExport: boolean;
    modalFileOGSettings: boolean;
    modalFileFetchContext: boolean;
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
            modalFileExport: false,
            modalFileOGSettings: false,
            modalFileFetchContext: false,
            loadSuccess: true,
            loadString: ""
        };
        this.newProject = this.newProject.bind(this);
        this.loadProject = this.loadProject.bind(this);
        this.saveProject = this.saveProject.bind(this);
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

            <NavDropdown.Divider />

            <NavDropdown.Item onClick={() => {
                this.setState({modalFileFetchContext: true});
            }}>{LocaleMenu.fetchContext}</NavDropdown.Item>
            <FileFetchContextModal modal={this.state.modalFileFetchContext} close={() => {
                this.setState({modalFileFetchContext: false})
            }} loadContext={this.props.loadContext}/>

            <NavDropdown.Item onClick={() => {
                this.setState({modalFileExport: true});
            }}>{LocaleMenu.exportProject}</NavDropdown.Item>
            <FileExportModal modal={this.state.modalFileExport} close={() => {
                this.setState({modalFileExport: false})
            }}/>

            <NavDropdown.Item onClick={() => {
                this.setState({modalFileProjectSettings: true})
            }}>{LocaleMenu.projectSettings}</NavDropdown.Item>
            <FileProjectSettingsModal modal={this.state.modalFileProjectSettings} close={() => {
                this.setState({modalFileProjectSettings: false});
                this.props.update();
            }}/>

        </NavDropdown>);
    }
}