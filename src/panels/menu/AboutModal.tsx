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
                <h6>20.3.</h6>
                <ul>
                    <li><b>Changed link creation mechanism:</b> Links are now created by dragging from the center without any keyboard input. The borders are used for moving the element. What function gets triggered on click is reflected via change in cursor. <b>Feedback is greatly appreciated.</b></li>
                    <li>Moved models to package tab as another folder</li>
                </ul>
                <h6>19.3.</h6>
                <ul>
                    <li>Fixed diagram renaming form behaviour (#24)</li>
                    <li>Fixed type changing in relationships' detail panel (#25)</li>
                    <li>Added stereotype markers to elements</li>
                    <li>Elements now change size with label size</li>
                </ul>
                <h6>18.3.</h6>
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