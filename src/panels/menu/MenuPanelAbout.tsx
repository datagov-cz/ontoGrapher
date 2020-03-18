import React from 'react';
import {Nav} from 'react-bootstrap';
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import FileLoadModal from "./file/FileLoadModal";
import HelpModal from "./HelpModal";
import {currentBuildDate} from "../../var/Variables";
import AboutModal from "./AboutModal";

interface Props {

}

interface State {
    modal: boolean;
}

export default class MenuPanelAbout extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            modal: false
        };
    }

    render() {
        return (<div className={"inert"}><Nav.Link onClick={() => {
            this.setState({modal: true});
        }}>
            {currentBuildDate}
        </Nav.Link>
            <AboutModal modal={this.state.modal} close={() => {
                this.setState({modal: false})
            }}/>
        </div>);
    }
}