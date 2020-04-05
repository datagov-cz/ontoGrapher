import React from 'react';
import {Button, Modal, Tab, Tabs} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";

interface Props {
    modal: boolean;
    close: Function;
}

interface State {

}

export default class AboutModal extends React.Component<Props, State> {

    render() {
        return (<Modal centered scrollable  show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.changelog}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs id={"changelog"}>
                    <Tab title={"April"} eventKey={1}>
                        <h6>4.4.</h6>
                    <ul>
                        <li>SKOS export</li>
                        <li>Internal cleanup</li>
                        <li>SPARQL query change</li>
                        <li>Added tooltips for stereotypes and relationships</li>
                    </ul>
                    </Tab>
                    <Tab title={"March"} eventKey={2}> <h6>31.3.</h6>
                        <ul>
                            <li>Fixed element buttons placement issues when renaming an element with links attached</li>
                            <li>Fixed package panel not updating when renaming element prefLabels</li>
                            <li>Fixed wrong vocabulary assignment when fetching subclasses of found resources</li>
                        </ul>
                        <h6>30.3.</h6>
                        <ul>
                            <li>Fixed link re-creation when showing hidden elements</li>
                            <li>Slight table styling changes</li>
                            <li>Added IRI links to "Connection" tab</li>
                            <li>IRI links now appear only on hover</li>
                            <li>Fixed a bug where holding "Shift" allowed you to create links</li>
                            <li>Merged skos:prefLabel with Label in the detail panel</li>
                            <li>Fixed awkward behaviour of elements when renaming them (more specifically, changing their shape)</li>
                        </ul>
                        <h6>28.3.</h6>
                        <ul>
                            <li>Fixed highlighting issues with links</li>
                            <li>Fixed element button placement when renaming it</li>
                            <li>Implemented SKOS data pulling</li>
                            <li>Implemented links for IRIs in detail panel</li>
                            <li>Links created from & to the same element are now assumed as a connection to itself; a loop is automatically created, allowing link deletion</li>
                            <li>Slight CSS & symbol changes</li>
                            <li>Hiding is now represented with a crossed out eye</li>
                        </ul>
                        <ul>
                            <li>Fixed highlighting issues</li>
                            <li>Fixed weird connecting behaviour</li>
                            <li>Instead of a central model folder, each model is displayed individually in the root</li>
                            <li>Fixed model stereotype display</li>
                        </ul>
                        <h6>21.3.</h6>
                        <ul>
                            <li>Fixed highlighting issues</li>
                            <li>Fixed weird connecting behaviour</li>
                            <li>Instead of a central model folder, each model is displayed individually in the root</li>
                            <li>Fixed model stereotype display</li>
                        </ul>
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
                        </ul></Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {this.props.close();}}>{LocaleMenu.close}</Button>
            </Modal.Footer>
        </Modal>);
    }
}