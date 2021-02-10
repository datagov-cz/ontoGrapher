import React from 'react';
import {Nav} from 'react-bootstrap';
import AboutModal from "./misc/AboutModal";
import {Locale} from "../../config/Locale";
import {ProjectSettings} from "../../config/Variables";
import {enChangelog} from "../../locale/enchangelog";

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

    //Retrieves the day and month of the last entry in the changelog to display in the button.
    getLastChangeDay() {
        const year: string = Object.keys(enChangelog)[0];
        const month: string = Object.keys(enChangelog[year])[0];
        const day: string = Object.keys(enChangelog[year][month])[0];
        return `${day}. ${month}.`
    }

    render() {
        return (<div className={"inert"}><Nav.Link onClick={() => {
            this.setState({modal: true});
        }}>
            {`${this.getLastChangeDay()} - ${Locale[ProjectSettings.viewLanguage].changelogButton}`}
        </Nav.Link>
            <AboutModal modal={this.state.modal} close={() => {
                this.setState({modal: false})
            }}/>
        </div>);
    }
}