import React from 'react';
import {Form, Navbar} from "react-bootstrap";
import * as Locale from '../locale/Locale.json';
import {Languages} from "../var/Variables";

interface MenuPanelProps{
    readOnly?: boolean;
    projectName: string;
    projectLanguage: string;
    theme: "light" | "dark";
    handleChangeLanguage: any;
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
        return(<Navbar variant={this.props.theme} bg="light">
            <Navbar.Brand>{Locale.ontoGrapher}</Navbar.Brand>
            <Form inline>
                <Form.Control as="select" value={this.props.projectLanguage} onChange={this.handleChangeLanguage}>
                    {Object.keys(Languages).map((languageCode) => (<option value={languageCode}>{Languages.languageCode}</option>))}
                </Form.Control>
            </Form>
        </Navbar>);
    }
}