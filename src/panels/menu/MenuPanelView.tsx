import React from 'react';
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {NavDropdown} from "react-bootstrap";
import {ViewSettings} from "../../var/Variables";

interface Props {

}

interface State {

}

export default class MenuPanelView extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (<NavDropdown title={LocaleMenu.view} id="basic-nav-dropdown">
            <NavDropdown.Item disabled>
                {LocaleMenu.viewAs}
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => {ViewSettings.display = 1; this.forceUpdate();}}>
                {(ViewSettings.display === 1 ? "✓ " : "") + LocaleMenu.viewByNamespace }
            </NavDropdown.Item>
            <NavDropdown.Item onClick={() => {ViewSettings.display = 2; this.forceUpdate();}}>
                {(ViewSettings.display === 2 ? "✓ " : "") + LocaleMenu.viewByLabel}
            </NavDropdown.Item>
        </NavDropdown>);
    }
}