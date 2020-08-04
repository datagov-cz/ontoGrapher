import React from 'react';
import {NavDropdown} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import FileFetchContextModal from "./file/FileFetchContextModal";

interface MenuPanelFileProps {
    newProject: Function;
    loadProject: Function;
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
    }

    newProject() {
        this.setState({modalFileNew: false});
        this.props.newProject();
    }

    loadProject(load: string) {
        this.props.loadProject(load);
        this.setState({modalFileLoad: false});
    }

    render() {
        return (<NavDropdown title={LocaleMenu.file} id="basic-nav-dropdown">

            <NavDropdown.Item onClick={() => {
                this.setState({modalFileFetchContext: true});
            }}>{LocaleMenu.fetchContext}</NavDropdown.Item>
            <FileFetchContextModal modal={this.state.modalFileFetchContext} close={() => {
                this.setState({modalFileFetchContext: false})
            }} loadContext={this.props.loadContext}/>

        </NavDropdown>);
    }
}