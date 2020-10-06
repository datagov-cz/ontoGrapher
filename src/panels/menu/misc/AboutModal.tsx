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
					<Tab title={"October"} eventKey={"October"}>
						<h6>6.10.</h6>
						<ul>
							<li>Bug fixing and stability improvements</li>
							<li><b>New features:</b></li>
							<li>Connection status indicator</li>
							<ul>
								<li>Located on the top right of the screen</li>
								<li>Indicator is green and static when connected, red and animated when not connected
								</li>
							</ul>
							<li>Editing environment now freezes on connection loss or saving error (and unfreezes on
								connection restoration or saving error resolution)
							</li>
							<li>Connection "exploding" option</li>
							<ul>
								<li>Located in concepts' detail panel, in the Connections section</li>
								<li>Using this option puts all connected concepts around the given concept</li>
								<li>Option is not shown when all related concepts are already on the diagram</li>
							</ul>
						</ul>
					</Tab>
					<Tab title={"September"} eventKey={"September"}>
						<h6>14.9.</h6>
						<ul>
							<li>Bug fixing and stability improvements</li>
						</ul>
					</Tab>
					<Tab title={"August"} eventKey={"August"}>
						<h6>30.8.</h6>
						<ul>
							<li>Bug fixing and stability improvements</li>
							<li>Creating new concepts now has an intermediate step of entering the label in a dialogue
								box
							</li>
						</ul>
						<h6>25.8.</h6>
						<ul>
							<li>Bug fixing and stability improvements</li>
							<li>Representation switching</li>
						</ul>
					</Tab>
					<Tab title={"July"} eventKey={"July"}>
						<h6>27.7.</h6>
						<ul>
							<li>Implemented new Detail panel, with the tabs removed</li>
							<li>Stereotypes are added on click of the option in the select menu</li>
						</ul>
						<h6>20.7.</h6>
						<ul>
							<li>Implemented (part of) new UI:</li>
							<ul>
								<li>New Menu panel</li>
								<li>Left panel only shows vocabularies</li>
								<li>Diagrams are managed via tabs</li>
								<li>New concepts are created on click on canvas</li>
								<li>Dragging can be done in the whole area of a concept</li>
								<li>Clicking on a concept brings up its details</li>
								<li>Creating new relationships is done via clicking on a new arrow icon</li>
							</ul>
						</ul>
						<h6>7.7.</h6>
						<ul>
							<li>New concept IRIs are now correctly created</li>
							<li>Detail panel header is now a link pointing to IRI of selected element</li>
						</ul>
						<h6>5.7.</h6>
						<ul>
							<li>rdfs:subClassOf loading support</li>
							<li>Validation support</li>
						</ul>
					</Tab>
					<Tab title={"June"} eventKey={"June"}>
						<h6>16.6.</h6>
						<ul>
							<li>Mission-control workspaces support</li>
							<li>Loading from URL parameters support</li>
						</ul>
						<h6>2.6.</h6>
						<ul>
							<li>Changed representation to FULL OWL (only basic Zs-GoV relationships are shown as links;
								others are represented as Relators)
							</li>
							<li>Implemented Generalization link (found in "➡" tab), with different (UML consistent)
								design
							</li>
							<li>Generalization is represented as rdfs:subClassOf in the database</li>
						</ul>
					</Tab>
					<Tab title={"May"} eventKey={"May"}>
						<h6>16.5.</h6>
						<ul>
							<li>Tweaked loading code for more efficiency</li>
							<li>Link IRIs can be changed in their detail panel</li>
							<li>OWL Restriction loading & saving</li>
						</ul>
						<h6>9.5.</h6>
						<ul>
							<li>Fixed a bug where fetching context would duplicate certain glossaries</li>
							<li>Fixed a bug where the user couldn't edit definitions on certain elements</li>
							<li>Models no longer loaded through JSON - handled via context instead</li>
							<li>Refactoring</li>
							<li>Save button removed in detail panel - saving is now automatic</li>
							<li><b>Saving to context:</b></li>
							<li>Saving happens on:</li>
							<ul>
								<li>Adding/deleting package items</li>
								<li>Adding/deleting relationships</li>
								<li>Adding/deleting/renaming diagrams</li>
								<li>Component startup (for initialization)</li>
								<li>Detail panel editing</li>
							</ul>
							<li>There is saving of:</li>
							<ul>
								<li>Object data (labels, descriptions...)</li>
								<li>ontoGrapher-specific data (positions, attributes...)</li>
								<li>Configuration (in special ontoGrapher context)</li>
							</ul>
							<li>Retry function on saving fail</li>
							<li><b>Loading of aforementioned data on component start</b></li>
						</ul>
					</Tab>
					<Tab title={"April"} eventKey={"April"}>
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
                            <li>If elements of rdfs:domain & rdfs:range IRI are present, the relationship is
                                automatically created
                            </li>
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
                            <li>Root-level packages now act as vocabularies: naming them affects the inScheme of
                                contained elements
                            </li>
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
					<Tab title={"March"} eventKey={"March"}><h6>31.3.</h6>
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