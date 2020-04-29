import React from 'react';
import {Button, Modal, Tab, Tabs} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";

interface Props {
    modal: boolean;
    close: Function;
}

interface State {

}

export default class AboutModal extends React.Component<Props, State> {

    render() {
        return (<Modal centered scrollable show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.changelog}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs id={"changelog"}>
                    <Tab title={"April"} eventKey={1}>
                        <h6>28.4.</h6>
                        <ul>
                            <li>Changed detail panel header names</li>
                            <li>Fixed model interpretation not working between read-only and editable vocabularies</li>
                            <li>Fixed stereotype detail panel visual artefact</li>
                        </ul>
                        <h6>27.4.</h6>
                        <ul>
                            <li>Changed fetch workspace dialogue to include both context IRI and endpoint</li>
                            <li>Changed class detail panel title to class label</li>
                            <li>Fixed read-only detail panel to include attributes and properties</li>
                        </ul>
                        <h6>26.4.</h6>
                        <ul>
                            <li>Added connections + diagram tabs for models' detail panel</li>
                            <li>Fixed definitions header showing despite no definitions fetched</li>
                            <li>rdfs:domain and rdfs:range attributes now interpreted</li>
                            <li>Types now interpreted correctly for models</li>
                            <li>New import workspace feature</li>
                            <li>New "Test connection to workspace" feature (in "Fetch workspace" dialogue)</li>
                            <li>If elements of rdfs:domain & rdfs:range IRI are present, the relationship is automatically created</li>
                            <li>Changed to d-sgov workspace ontology in fetching</li>
                            <li>Modified SPARQL querying</li>
                        </ul>
                        <h6>20.4.</h6>
                        <ul>
                            <li>Multiple stereotype support <b>(including editing)</b></li>
                            <li>Code cleanup</li>
                            <li>Fixed packages not rerendering with new name when renaming</li>
                            <li>Fixed element and link highlighting rendering issues</li>
                        </ul>
                        <h6>17.4.</h6>
                        <ul>
                            <li>PP load support: for now, the example PP is loaded.</li>
                            <li>Packages now have names for each language</li>
                            <li>Root-level packages now act as vocabularies: naming them affects the inScheme of contained elements</li>
                            <li>Icon now shown to indicate loading</li>
                            <li>Packages can now be "default" - newly created elements automatically appear in them</li>
                            <li>"Set default package" button on hover on package added</li>
                            <li>Elements cannot be in the root anymore, they have to be in a package</li>
                            <li>Multiple stereotype viewing <b>(not editing)</b> support</li>
                            <li>Parent package now opens on creation of a subpackage</li>
                        </ul>
                        <h6>13.4.</h6>
                        <ul>
                            <li>Export refactoring</li>
                            <li>Save & diagram restoration fixes</li>
                        </ul>
                        <h6>10.4.</h6>
                        <ul>
                            <li>Export now accounts for duplicates</li>
                        </ul>
                        <h6>9.4.</h6>
                        <ul>
                            <li>Fixed SPARQL query to include missing desired stereotypes</li>
                            <li>Fixed export</li>
                            <li>Changed export IRI</li>
                            <li>Added glossary export</li>
                            <li>Fixed changes/deletions in links not being logged</li>
                            <li>Prohibited user choice of IRI and rdf:type</li>
                            <li>Removed "Generate TTL" button; exporting now happens automatically and also on change of
                                knowledge structure
                            </li>
                        </ul>
                        <h6>4.4.</h6>
                        <ul>
                            <li>SKOS export</li>
                            <li>Internal cleanup</li>
                            <li>SPARQL query change</li>
                            <li>Added tooltips for stereotypes and relationships</li>
                        </ul>
                    </Tab>
                    <Tab title={"March"} eventKey={2}><h6>31.3.</h6>
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
                            <li>Fixed awkward behaviour of elements when renaming them (more specifically, changing
                                their shape)
                            </li>
                        </ul>
                        <h6>28.3.</h6>
                        <ul>
                            <li>Fixed highlighting issues with links</li>
                            <li>Fixed element button placement when renaming it</li>
                            <li>Implemented SKOS data pulling</li>
                            <li>Implemented links for IRIs in detail panel</li>
                            <li>Links created from & to the same element are now assumed as a connection to itself; a
                                loop is automatically created, allowing link deletion
                            </li>
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
                            <li><b>Changed link creation mechanism:</b> Links are now created by dragging from the
                                center without any keyboard input. The borders are used for moving the element. What
                                function gets triggered on click is reflected via change in cursor. <b>Feedback is
                                    greatly appreciated.</b></li>
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
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }}>{LocaleMenu.close}</Button>
            </Modal.Footer>
        </Modal>);
    }
}