import React from 'react';
import {Nav} from 'react-bootstrap';
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import HelpModal from "./HelpModal";

interface Props {

}

interface State {
    modal: boolean;
}

export default class MenuPanelHelp extends React.Component<Props, State> {
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
            {LocaleMenu.help}
        </Nav.Link>
            <HelpModal modal={this.state.modal} close={() => {
                this.setState({modal: false})
            }}/>
        </div>);
    }
}