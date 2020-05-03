import * as LocaleMain from "../../locale/LocaleMain.json";
import React from "react";
import {ResizableBox} from "react-resizable";
import {
	AttributeTypePool,
	Diagrams,
	Links,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Schemes,
	Stereotypes,
	VocabularyElements
} from "../../config/Variables";
import {getLabelOrBlank, getStereotypeOrVocabElem} from "../../function/FunctionGetVars";
import {Button, Form, Tab, Tabs} from "react-bootstrap";
import TableList from "../../components/TableList";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import IRILink from "../../components/IRILink";
import {getName} from "../../function/FunctionEditVars";
import LabelTable from "./components/LabelTable";
import DescriptionTabs from "./components/DescriptionTabs";
import IRIlabel from "../../components/IRIlabel";
import {AttributeObject} from "../../datatypes/AttributeObject";
// @ts-ignore
import {RIEInput} from "riek";
import {nameGraphElement} from "../../function/FunctionGraph";
import {graph} from "../../graph/graph";
import {updateProjectElement} from "../../interface/TransactionInterface";

interface Props {
	projectLanguage: string;
	headers: { [key: string]: { [key: string]: string } }
	save: Function;
}

interface State {
	id: string,
	iri: string,
	inputConnections: string[];
	inputDiagrams: number[];
	inputProperties: AttributeObject[];
	inputTypes: string[];
	inputLabels: { [key: string]: string };
	inputDefinitions: { [key: string]: string };
	inputSchemes: { [key: string]: string };
	formNewStereotype: string;
	inputAttributes: AttributeObject[];
	readOnly: boolean;
	changes: boolean;
}

export default class DetailElem extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
		this.state = {
			id: "",
			iri: Object.keys(VocabularyElements)[0],
			inputConnections: [],
			inputDiagrams: [],
			inputAttributes: [],
			inputTypes: [],
			inputLabels: {},
			inputDefinitions: {},
			inputSchemes: {},
			inputProperties: [],
			formNewStereotype: Object.keys(Stereotypes)[0],
			readOnly: true,
			changes: false
		}
	}

	prepareDetails(id: string) {
		this.setState({
			id: id,
			iri: ProjectElements[id].iri,
			inputConnections: ProjectElements[id].connections,
			inputDiagrams: ProjectElements[id].diagrams,
			inputProperties: ProjectElements[id].properties,
			inputAttributes: ProjectElements[id].attributes,
			inputTypes: VocabularyElements[ProjectElements[id].iri].types,
			inputLabels: VocabularyElements[ProjectElements[id].iri].labels,
			inputDefinitions: VocabularyElements[ProjectElements[id].iri].definitions,
			inputSchemes: Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].labels,
			formNewStereotype: Object.keys(Stereotypes)[0],
			readOnly: Schemes[VocabularyElements[ProjectElements[id].iri].inScheme].readOnly,
			changes: false
		});
	}

	save() {
		ProjectSettings.status = LocaleMain.updating;
		updateProjectElement(
			ProjectSettings.contextIRI,
			ProjectSettings.contextEndpoint,
			this.state.inputTypes,
			this.state.inputLabels,
			this.state.inputDefinitions,
			this.state.id).then(result => {
			if (result.response === 204) {
				VocabularyElements[ProjectElements[this.state.id].iri].types = this.state.inputTypes;
				VocabularyElements[ProjectElements[this.state.id].iri].labels = this.state.inputLabels;
				VocabularyElements[ProjectElements[this.state.id].iri].definitions = this.state.inputDefinitions;
				ProjectElements[this.state.id].attributes = this.state.inputAttributes;
				ProjectElements[this.state.id].properties = this.state.inputProperties;
				nameGraphElement(graph.getCell(this.state.id), this.props.projectLanguage);
				this.props.save();
				this.setState({changes: false});
			} else {
				ProjectSettings.status = LocaleMain.errorUpdating;
				ProjectSettings.lastUpdate = result.result;
			}
		})

		ProjectSettings.status = "";
	}

	render() {
		return this.state.id !== "" && (<ResizableBox
			width={300}
			height={1000}
			axis={"x"}
			handleSize={[8, 8]}
			resizeHandles={['nw']}
			className={"details"}>
			<div>
				<h3>{this.state.id ? getLabelOrBlank(VocabularyElements[ProjectElements[this.state.id].iri].labels, this.props.projectLanguage) : ""}</h3>
				{this.state.changes ?
					<p className={"bordered"}>
						{LocaleMain.saveChanges}
						<br/><br/>
						<Button onClick={() => {
							this.save();
						}}>{LocaleMain.menuPanelSave}</Button></p> : <p/>}
				<Tabs id={"detail-tabs"}>
					<Tab title={LocaleMain.description} eventKey={LocaleMain.description}>
						<h5>{this.props.headers.stereotype[this.props.projectLanguage]}</h5>
						<TableList>
							{this.state.inputTypes.map(iri =>
								<tr key={iri}>
									<td>
										<IRILink
											label={getStereotypeOrVocabElem(iri).labels[this.props.projectLanguage]}
											iri={iri}/>
										&nbsp;
										{this.state.inputTypes.length === 1 && !(this.state.readOnly) ? "" :
											<button className={"buttonlink"} onClick={() => {
												let result = this.state.inputTypes;
												result.splice(result.indexOf(iri), 1);
												this.setState({
													inputTypes: result,
													changes: true,
												})
											}}>
												{LocaleMenu.deleteProjectName}</button>}
									</td>
								</tr>
							)}
							{(!this.state.readOnly) ? <tr>
								<td>
									<Form inline>
										<Form.Control size="sm" as="select" value={this.state.formNewStereotype}
													  onChange={(event) => {
														  this.setState({formNewStereotype: event.currentTarget.value})
													  }}>
											{Object.keys(Stereotypes).map((stereotype) => (
												<option key={stereotype}
														value={stereotype}>{getName(stereotype, this.props.projectLanguage)}</option>))}
										</Form.Control>
										<Button size="sm" onClick={() => {
											let result = this.state.inputTypes;
											if (!(this.state.inputTypes.includes(this.state.formNewStereotype))) {
												result.push(this.state.formNewStereotype);
												this.setState({
													inputTypes: result,
													formNewStereotype: Object.keys(Stereotypes)[0],
													changes: true,
												})
											}

										}}>{LocaleMain.add}</Button>
									</Form>
								</td>
							</tr> : ""}
						</TableList>

						<h5>{<IRILink label={this.props.headers.labels[this.props.projectLanguage]}
									  iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
						<LabelTable labels={this.state.inputLabels} readOnly={this.state.readOnly} onEdit={
							(textarea: string, language: string) => {
								let res = this.state.inputLabels;
								res[language] = textarea;
								this.setState({inputLabels: res, changes: true});
							}
						}/>
						<h5>{<IRILink label={this.props.headers.inScheme[this.props.projectLanguage]}
									  iri={"http://www.w3.org/2004/02/skos/core#inScheme"}/>}</h5>
						<LabelTable labels={this.state.inputSchemes} readOnly={this.state.readOnly}/>
						{Object.keys(this.state.inputDefinitions).length > 0 ?
							<h5>{<IRILink label={this.props.headers.definition[this.props.projectLanguage]}
										  iri={"http://www.w3.org/2004/02/skos/core#definition"}/>}</h5> : ""}
						<DescriptionTabs descriptions={this.state.inputDefinitions} readOnly={this.state.readOnly}/>
					</Tab>
					<Tab eventKey={"connections"} title={LocaleMain.connections}>
						<TableList
							headings={[LocaleMenu.connectionVia, LocaleMenu.connectionTo, LocaleMenu.diagram]}>
							{this.state.inputConnections.map((conn) =>
								<tr>
									<IRIlabel
										label={Links[ProjectLinks[conn].iri].labels[this.props.projectLanguage]}
										iri={ProjectLinks[conn].iri}/>
									<td>{getLabelOrBlank(VocabularyElements[ProjectLinks[conn].target].labels, this.props.projectLanguage)}</td>
									<td>{ProjectLinks[conn].diagram}</td>
								</tr>
							)}
							{this.state.iri in VocabularyElements ? VocabularyElements[this.state.iri].domainOf.map((conn: string) => {
									let range = VocabularyElements[conn].range;
									if (range) {
										return (<tr>
											<IRIlabel label={VocabularyElements[conn].labels[this.props.projectLanguage]}
													  iri={conn}/>
											<td>{getLabelOrBlank(VocabularyElements[range].labels, this.props.projectLanguage)}</td>
											<td>{LocaleMenu.fromModel}</td>
										</tr>);
									} else return ""
								}
							) : ""}
						</TableList>
					</Tab>
					<Tab title={LocaleMain.diagram} eventKey={"detail-tab-diagrams"}>
						<TableList headings={[LocaleMenu.diagram]}>
							{this.state.inputDiagrams.map((diag) =>
								(<tr>
									<td>{Diagrams[diag].name}</td>
								</tr>)
							)}
						</TableList>
					</Tab>
					<Tab eventKey={LocaleMain.detailPanelAttributes} title={LocaleMain.detailPanelAttributes}>
						<TableList headings={[LocaleMenu.title, LocaleMenu.attributeType]}>
							{this.state.inputAttributes.map((attr, i) =>
								this.state.readOnly ? <tr key={i}>
									<td>{attr.name.length > 0 ? attr.name : "<blank>"}</td>
									<td>{AttributeTypePool[attr.type].name}</td>
								</tr> : <tr key={i}>
									<td>
										<RIEInput
											className={"rieinput"}
											value={attr.name.length > 0 ? attr.name : "<blank>"}
											change={(event: { textarea: string }) => {
												this.handleChangeNameAttribute(event, i);
											}}
											propName="textarea"
										/>
										&nbsp;
										<button className={"buttonlink"} onClick={() => {
											this.deleteAttribute(i);
										}}>
											{LocaleMenu.delete}</button>
									</td>
									<td>
										<Form inline>
											<Form.Control as="select" value={attr.type}
														  onChange={(event: React.FormEvent<HTMLInputElement>) => {
															  this.handleChangeAttributeType(event, i);
														  }}>
												{Object.keys(AttributeTypePool).map((attrtype) => <option
													value={attrtype}>{AttributeTypePool[attrtype].name}</option>)}
											</Form.Control>
										</Form>
									</td>
								</tr>
							)}
						</TableList>
						<button className={"buttonlink"} onClick={() => {
							this.createAttribute();
						}}>
							{LocaleMenu.createAttribute}</button>
					</Tab>
					<Tab eventKey={LocaleMain.properties} title={LocaleMain.properties}>
						<TableList headings={[LocaleMenu.title, LocaleMenu.attributeType, LocaleMenu.value]}>
							{this.state.inputProperties.map((prop, i) => (<tr key={i}>
								<td>
									{AttributeTypePool[prop.type].name}
								</td>
								<td>
									{AttributeTypePool[prop.type].array ? "[" + AttributeTypePool[prop.type].type + "]" : AttributeTypePool[prop.type].type}
								</td>
								<td>
									<RIEInput
										className={"rieinput"}
										value={prop.name.length > 0 ? prop.name : "<blank>"}
										change={(event: { textarea: string }) => {
											this.handleChangeNameProperty(event, i);
										}}
										propName="textarea"
									/>
								</td>
							</tr>))}
						</TableList>
					</Tab>
				</Tabs>
			</div>
		</ResizableBox>);
	}

	handleChangeNameAttribute(event: { textarea: string }, pos: number) {
		let attrs = this.state.inputAttributes;
		attrs[pos].name = event.textarea;
		this.setState({
			inputAttributes: attrs,
			changes: true,
		});
	}

	createAttribute() {
		let attr = new AttributeObject("", Object.keys(AttributeTypePool)[0]);
		let attrs = this.state.inputAttributes;
		attrs.push(attr);
		this.setState({
			inputAttributes: attrs,
			changes: true,
		})
	}

	handleChangeAttributeType(event: React.FormEvent<HTMLInputElement>, i: number) {
		let attrs = this.state.inputAttributes;
		attrs[i].type = event.currentTarget.value;
		this.setState({
			inputAttributes: attrs,
			changes: true,
		})
	}

	deleteAttribute(i: number) {
		let attrs = this.state.inputAttributes;
		attrs.splice(i, 1);
		this.setState({
			inputAttributes: attrs,
			changes: true,
		})
	}

	handleChangeNameProperty(event: { textarea: string }, pos: number) {
		let attrs = this.state.inputProperties;
		attrs[pos].name = event.textarea;
		this.setState({
			inputProperties: attrs,
			changes: true,
		})
	}
}