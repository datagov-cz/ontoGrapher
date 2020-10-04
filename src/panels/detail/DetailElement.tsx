import * as LocaleMain from "../../locale/LocaleMain.json";
import React from "react";
import {ResizableBox} from "react-resizable";
import {
	Diagrams,
	Languages,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	Stereotypes,
	VocabularyElements
} from "../../config/Variables";
import {getLabelOrBlank, getLinkOrVocabElem, getStereotypeOrVocabElem} from "../../function/FunctionGetVars";
import {Accordion, Button, Card, Form} from "react-bootstrap";
import TableList from "../../components/TableList";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import IRILink from "../../components/IRILink";
import {getName} from "../../function/FunctionEditVars";
import LabelTable from "./components/LabelTable";
import DescriptionTabs from "./components/DescriptionTabs";
import IRIlabel from "../../components/IRIlabel";
import {drawGraphElement, unHighlightAll} from "../../function/FunctionGraph";
import {graph} from "../../graph/Graph";
import {
	processGetTransaction,
	processTransaction,
	updateProjectElement,
	updateProjectLink
} from "../../interface/TransactionInterface";
import {createNewElemIRI} from "../../function/FunctionCreateVars";
import * as _ from "lodash";

interface Props {
	projectLanguage: string;
	headers: { [key: string]: { [key: string]: string } }
	save: Function;
	handleChangeLoadingStatus: Function;
	handleWidth: Function;
	error: boolean;
}

interface State {
	id: string,
	iri: string,
	inputConnections: string[];
	inputDiagrams: number[];
	inputTypes: string[];
	inputLabels: { [key: string]: string };
	inputDefinitions: { [key: string]: string };
	inputSchemes: { [key: string]: string };
	formNewStereotype: string;
	readOnly: boolean;
	changes: boolean;
}

export default class DetailElement extends React.Component<Props, State> {

	constructor(props: Props) {
		super(props);
		this.state = {
			id: "",
			iri: Object.keys(VocabularyElements)[0],
			inputConnections: [],
			inputDiagrams: [],
			inputTypes: [],
			inputLabels: {},
			inputDefinitions: {},
			inputSchemes: {},
			formNewStereotype: "",
			readOnly: true,
			changes: false
		}
	}

	prepareDetails(id: string) {
		this.setState({
			id: id,
			iri: ProjectElements[id].iri,
			inputConnections: _.cloneDeep(ProjectElements[id].connections),
			inputDiagrams: _.cloneDeep(ProjectElements[id].diagrams),
			inputTypes: _.cloneDeep(VocabularyElements[ProjectElements[id].iri].types),
			inputLabels: _.cloneDeep(VocabularyElements[ProjectElements[id].iri].labels),
			inputDefinitions: _.cloneDeep(VocabularyElements[ProjectElements[id].iri].definitions),
			inputSchemes: _.cloneDeep(Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].labels),
			formNewStereotype: Object.keys(Stereotypes)[0],
			readOnly: Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].readOnly,
			changes: false
		});
	}

	save() {
		this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
		let oldIRI = ProjectElements[this.state.id].iri;
		if (ProjectElements[this.state.id].untitled) {
			let scheme = VocabularyElements[ProjectElements[this.state.id].iri].inScheme;
			scheme = scheme.substring(0, scheme.lastIndexOf("/") + 1) + "pojem/";
			let iri = createNewElemIRI(this.state.inputLabels, VocabularyElements, scheme);
			VocabularyElements[iri] = VocabularyElements[ProjectElements[this.state.id].iri];
			ProjectElements[this.state.id].iri = iri;
		}
		updateProjectElement(
			ProjectSettings.contextEndpoint,
			this.state.inputTypes,
			this.state.inputLabels,
			this.state.inputDefinitions,
			this.state.id).then(async result => {
			if (result) {
				VocabularyElements[ProjectElements[this.state.id].iri].types = this.state.inputTypes;
				VocabularyElements[ProjectElements[this.state.id].iri].labels = this.state.inputLabels;
				VocabularyElements[ProjectElements[this.state.id].iri].definitions = this.state.inputDefinitions;
				drawGraphElement(graph.getCell(this.state.id), this.props.projectLanguage, ProjectSettings.representation);
				this.props.save();
				this.setState({changes: false});
				this.props.handleChangeLoadingStatus(false, "", false);
				for (let conn of ProjectElements[this.state.id].connections) {
					await updateProjectLink(ProjectSettings.contextEndpoint, conn).then(res => {
						if (!res) {
							this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
						}
					});
				}
				if (ProjectElements[this.state.id].iri !== oldIRI) {
					let delString = await processGetTransaction(ProjectSettings.contextEndpoint, {subject: oldIRI});
					if (delString) {
						await processTransaction(ProjectSettings.contextEndpoint, {add: [], "delete": [delString]});
					}
					VocabularyElements[oldIRI].active = false;
				}
				ProjectElements[this.state.id].untitled = false;
				this.prepareDetails(this.state.id);
			} else {
				this.props.handleChangeLoadingStatus(false, LocaleMain.errorUpdating, true);
			}
		});
	}

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
		if ((prevState !== this.state && this.state.changes)) {
			this.save();
		}
	}

	render() {
		return this.state.id !== "" && (<ResizableBox
			width={300}
			height={1000}
			axis={"x"}
			handleSize={[8, 8]}
			resizeHandles={['sw']}
			onResizeStop={() => {
				let elem = document.querySelector(".details");
				if (elem) this.props.handleWidth(elem.getBoundingClientRect().width);
			}}
			className={"details" + (this.props.error ? " disabled" : "")}>
			<div className={(this.props.error ? " disabled" : "")}>
				<button className={"buttonlink close nounderline"} onClick={() => {
					unHighlightAll();
					this.setState({id: ""});
					this.props.handleWidth(0);
				}}><span role="img" aria-label={""}>➖</span></button>
				<h3><IRILink
					label={this.state.id ? getLabelOrBlank(VocabularyElements[ProjectElements[this.state.id].iri].labels, this.props.projectLanguage) : ""}
					iri={ProjectElements[this.state.id].iri}/></h3>
				<Accordion defaultActiveKey={"0"}>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant={"link"} eventKey={"0"}>
								{LocaleMain.description}
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey={"0"}>
							<Card.Body>
								<h5>{<IRILink label={this.props.headers.labels[this.props.projectLanguage]}
											  iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
								<LabelTable labels={this.state.inputLabels} readOnly={this.state.readOnly} onEdit={
									(textarea: string, language: string) => {
										let res = _.cloneDeep(this.state.inputLabels);
										res[language] = textarea;
										this.setState({inputLabels: res, changes: true});
									}
								}/>
								<h5>{this.props.headers.stereotype[this.props.projectLanguage]}</h5>
								<TableList>
									{this.state.inputTypes.map(iri => {
										if (getStereotypeOrVocabElem(iri)) {
											return (<tr key={iri}>
												<td>
													<IRILink
														label={getLabelOrBlank(getStereotypeOrVocabElem(iri).labels, this.props.projectLanguage)}
														iri={iri}/>
													{(!this.state.readOnly) &&
                                                    <button className={"buttonlink right"} onClick={() => {
														let result = _.cloneDeep(this.state.inputTypes);
														result.splice(result.indexOf(iri), 1);
														this.setState({
															inputTypes: result,
															changes: true,
														})
													}}><span role="img"
                                                             aria-label={""}>❌</span>
                                                    </button>}
												</td>
											</tr>)
										} else return ""
									})}
									{(!this.state.readOnly) && <tr>
                                        <td>
                                            <span role="img"
                                                  aria-label={""}>➕</span>&nbsp;<Form inline>
                                            <Form.Control size="sm" as="select"
                                                          value={""}
                                                          onChange={(event) => {
															  let result = this.state.inputTypes;
															  if (!(this.state.inputTypes.includes(event.currentTarget.value)) && event.currentTarget.value !== "") {
																  result.push(event.currentTarget.value);
																  this.setState({
																	  inputTypes: _.cloneDeep(result),
																	  formNewStereotype: event.currentTarget.value,
																	  changes: true,
																  })
															  }
														  }}
                                            >
                                                <option key={""} value={""}>{LocaleMain.addNewStereotype}</option>
												{Object.keys(Stereotypes).filter(stereotype => !(this.state.inputTypes.includes(stereotype))).map((stereotype) => (
													<option key={stereotype}
															value={stereotype}>{getName(stereotype, this.props.projectLanguage)}</option>))}
                                            </Form.Control>
                                        </Form>
                                        </td>
                                    </tr>}
								</TableList>
								<h5>{<IRILink label={this.props.headers.inScheme[this.props.projectLanguage]}
											  iri={"http://www.w3.org/2004/02/skos/core#inScheme"}/>}</h5>
								<LabelTable labels={this.state.inputSchemes} readOnly={this.state.readOnly}
											iri={VocabularyElements[this.state.iri].inScheme}/>
								{Object.keys(Languages).length > 0 ?
									<h5>{<IRILink label={this.props.headers.definition[this.props.projectLanguage]}
												  iri={"http://www.w3.org/2004/02/skos/core#definition"}/>}</h5> : ""}
								<DescriptionTabs
									descriptions={this.state.inputDefinitions}
									readOnly={this.state.readOnly}
									onEdit={(event: React.ChangeEvent<HTMLSelectElement>, language: string) => {
										let res = this.state.inputDefinitions;
										res[language] = event.currentTarget.value;
										this.setState({inputDefinitions: res});
									}}
									onFocusOut={() => {
										this.setState({changes: true});
									}}
								/>
							</Card.Body>
						</Accordion.Collapse>
					</Card>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant={"link"} eventKey={"1"}>
								{LocaleMain.connections}
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey={"1"}>
							<Card.Body>
								<TableList
									headings={[LocaleMenu.connectionVia, LocaleMenu.connectionTo]}>
									{this.state.inputConnections.map((conn) => {
											if (ProjectLinks[conn] && ProjectLinks[conn].active) {
												return (<tr>
													<IRIlabel
														label={getLinkOrVocabElem(ProjectLinks[conn].iri).labels[this.props.projectLanguage]}
														iri={ProjectLinks[conn].iri}/>
													<td>{getLabelOrBlank(VocabularyElements[ProjectElements[ProjectLinks[conn].target].iri].labels, this.props.projectLanguage)}</td>
												</tr>)
											} else return ""
										}
									)}
								</TableList>
							</Card.Body>
						</Accordion.Collapse>
					</Card>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant={"link"} eventKey={"2"}>
								{LocaleMain.diagram}
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey={"2"}>
							<Card.Body>
								<TableList headings={[LocaleMenu.diagram]}>
									{this.state.inputDiagrams.map((diag) =>
										(<tr>
											<td>{Diagrams[diag].name}</td>
										</tr>)
									)}
								</TableList>
							</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
			</div>
		</ResizableBox>);
	}
}