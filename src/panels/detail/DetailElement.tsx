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
import {getLabelOrBlank, getLinkOrVocabElem} from "../../function/FunctionGetVars";
import {Accordion, Button, Card} from "react-bootstrap";
import TableList from "../../components/TableList";
import IRILink from "../../components/IRILink";
import LabelTable from "./components/LabelTable";
import DescriptionTabs from "./components/DescriptionTabs";
import IRIlabel from "../../components/IRIlabel";
import {drawGraphElement, spreadConnections, unHighlightAll} from "../../function/FunctionGraph";
import {graph} from "../../graph/Graph";
import {processTransaction, updateProjectElement} from "../../interface/TransactionInterface";
import * as _ from "lodash";
import StereotypeOptions from "./components/StereotypeOptions";
import {Shapes} from "../../config/Shapes";
import {Locale} from "../../config/Locale";

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
		this.checkSpreadConnections = this.checkSpreadConnections.bind(this);
		this.updateStereotype = this.updateStereotype.bind(this);
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

	checkSpreadConnections(): boolean {
		if (this.state) {
			let cell = graph.getElements().find(elem => elem.id === this.state.id);
			if (cell) {
				return this.state.inputConnections.filter(conn => ProjectLinks[conn] && ProjectLinks[conn].active).length !==
					graph.getConnectedLinks(cell).length;
			} else return false;
		} else return false;
	}

	save() {
		let elem = graph.getElements().find(elem => elem.id === (this.state.id));
		if (this.state.id in ProjectElements && elem) {
			this.props.handleChangeLoadingStatus(true, Locale[ProjectSettings.viewLanguage].updating, false);
			VocabularyElements[ProjectElements[this.state.id].iri].types = this.state.inputTypes;
			VocabularyElements[ProjectElements[this.state.id].iri].labels = this.state.inputLabels;
			VocabularyElements[ProjectElements[this.state.id].iri].definitions = this.state.inputDefinitions;
			drawGraphElement(elem, this.props.projectLanguage, ProjectSettings.representation);
			this.props.save();
			this.setState({changes: false});
			this.prepareDetails(this.state.id);
			processTransaction(ProjectSettings.contextEndpoint,
				updateProjectElement(
					this.state.inputTypes,
					this.state.inputLabels,
					this.state.inputDefinitions,
					this.state.id)
			).then(result => {
				if (!result) {
					this.props.handleChangeLoadingStatus(false, Locale[ProjectSettings.viewLanguage].errorUpdating, true);
				} else {
					this.props.handleChangeLoadingStatus(false, "", false);
				}
			});
		}
	}

	componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
		if ((prevState !== this.state && this.state.changes)) {
			this.save();
		}
	}

	updateStereotype(newStereotype: string, content: boolean) {
		let stereotypes = this.state.inputTypes;
		let index = stereotypes.findIndex(stereotype =>
			(stereotype in Stereotypes && (content ?
				stereotype in Shapes : !(stereotype in Shapes))));
		if (index !== -1)
			stereotypes.splice(index, 1);
		stereotypes.push(newStereotype);
		this.setState({inputTypes: stereotypes, changes: true});
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
								{Locale[ProjectSettings.viewLanguage].description}
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
									<StereotypeOptions readonly={this.state.readOnly} content={true}
													   projectLanguage={this.props.projectLanguage}
													   onChange={(value: string) => this.updateStereotype(value, true)}
													   value={this.state.inputTypes.find(type => type in Shapes) || ""}/>
									<StereotypeOptions readonly={this.state.readOnly} content={false}
													   projectLanguage={this.props.projectLanguage}
													   onChange={(value: string) => this.updateStereotype(value, false)}
													   value={this.state.inputTypes.find(type => type in Stereotypes && !(type in Shapes)) || ""}/>
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
								{Locale[ProjectSettings.viewLanguage].connections}
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey={"1"}>
							<Card.Body>
								<TableList
									headings={[Locale[ProjectSettings.viewLanguage].connectionVia, Locale[ProjectSettings.viewLanguage].connectionTo]}>
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
								{this.checkSpreadConnections() &&
                                <Button className={"buttonlink center"}
                                        onClick={() => {
											console.log(ProjectElements[this.state.id]);
											this.props.handleChangeLoadingStatus(true, Locale[ProjectSettings.viewLanguage].updating, false);
											processTransaction(ProjectSettings.contextEndpoint, spreadConnections(this.state.id, false, false)).then(result => {
												if (result) {
													this.props.handleChangeLoadingStatus(false, "", false);
												} else {
													this.props.handleChangeLoadingStatus(false, Locale[ProjectSettings.viewLanguage].errorUpdating, true);
												}
											});
											this.forceUpdate();
										}}>
									{Locale[ProjectSettings.viewLanguage].spreadConnections}
                                </Button>}
							</Card.Body>
						</Accordion.Collapse>
					</Card>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant={"link"} eventKey={"2"}>
								{Locale[ProjectSettings.viewLanguage].diagram}
							</Accordion.Toggle>
						</Card.Header>
						<Accordion.Collapse eventKey={"2"}>
							<Card.Body>
								<TableList headings={[Locale[ProjectSettings.viewLanguage].diagram]}>
									{this.state.inputDiagrams.map((diag) =>
										Diagrams[diag] ? (<tr>
											<td>{Diagrams[diag].name}</td>
										</tr>) : ""
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