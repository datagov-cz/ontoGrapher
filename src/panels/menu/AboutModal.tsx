import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";

interface Props {
    modal: boolean;
    close: Function;
}

interface State {

}

export default class AboutModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.changelog}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{overflow:"scrollbar"}}>
                <h6>Current build</h6>
                <ul>
                    <li>Corrected detail panel's Properties tab (#18)</li>
                    <li>Included package hierarchy in the save JSON</li>
                    <li>Clicking on packages' buttons no longer opens/closes the package</li>
                    <li>ZS-GOV no longer appears twice in the source list</li>
                    <li>Light CSS changes</li>
                    <li>Clicking on Save Project... also console.logs the JSON for debugging purposes</li>
                    <li>Nomenclature changes for some parts of the JSON to improve legibility</li>
                    <li>Graph elements are highlighted when selected</li>
                    <li>Dragging of package items to the root is fixed</li>
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {this.props.close();}}>{LocaleMenu.close}</Button>
            </Modal.Footer>
        </Modal>);
    }
}