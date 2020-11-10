import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../locale/LocaleMenu.json";
import {
	Links,
	Prefixes,
	ProjectElements,
	ProjectLinks,
	ProjectSettings,
	Stereotypes,
	VocabularyElements
} from "../config/Variables";
import {getLabelOrBlank, getLinkOrVocabElem} from "../function/FunctionGetVars";
import {graph} from "../graph/Graph";
import {parsePrefix} from "../function/FunctionEditVars";
import {Representation} from "../config/Enum";

interface Props {
	modal: boolean;
	close: Function;
	projectLanguage: string;
	sid: string | undefined;
	tid: string | undefined;
}

interface State {
	selectedLink: string;
	displayIncompatible: boolean;
}

export default class NewLinkDiagram extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedLink: "",
			displayIncompatible: false
		}
		this.handleChangeLink = this.handleChangeLink.bind(this);
	}

	handleChangeLink(event: React.ChangeEvent<HTMLSelectElement>) {
		this.setState({selectedLink: event.currentTarget.value});
		if (event.currentTarget.value !== "") this.props.close(event.currentTarget.value);
	}

	filtering(link: string): boolean {
		if (!this.props.sid || !this.props.tid) return false;
		let sourceTypes = VocabularyElements[ProjectElements[this.props.sid].iri].types
			.filter(type => type.startsWith(Prefixes["z-sgov-pojem"]))
		let targetTypes = VocabularyElements[ProjectElements[this.props.tid].iri].types
			.filter(type => type.startsWith(Prefixes["z-sgov-pojem"]))
		if (sourceTypes.length === 0 || targetTypes.length === 0) return false;
		let domain = Links[link].domain;
		let range = Links[link].range;
		let source = false;
		let target = false;

		for (let type of sourceTypes) {
			let types = Stereotypes[type].types;
			let subClasses = Stereotypes[type].subClassOf;
			let character = Stereotypes[type].character;
			if (character === domain || types.includes(domain) || subClasses.includes(domain)) {
				source = true;
				break;
			}
		}

		if (!source) return false;

		for (let type of targetTypes) {
			let types = Stereotypes[type].types;
			let subClasses = Stereotypes[type].subClassOf;
			let character = Stereotypes[type].character;
			if (character === range || types.includes(range) || subClasses.includes(range)) {
				target = true;
				break;
			}
		}

		return target;
	}

	getLinks() {
		let elem = graph.getElements().find(elem => elem.id === this.props.sid);
		if (elem && this.props.sid) {
			let conns = ProjectElements[this.props.sid].connections;
			if (ProjectSettings.representation === Representation.FULL) {
				return Object.keys(Links).filter(link => !conns.find(conn => ProjectLinks[conn].iri === link &&
					ProjectLinks[conn].target === this.props.tid &&
					ProjectLinks[conn].active) && (this.state.displayIncompatible ? true :
					(this.filtering(link) || Links[link].inScheme === (ProjectSettings.ontographerContext + "/uml"))));
			} else if (ProjectSettings.representation === Representation.COMPACT) {
				return Object.keys(VocabularyElements).filter(link =>
					!conns.find(
						conn => ProjectLinks[conn].iri === link &&
							ProjectLinks[conn].target === this.props.tid &&
							ProjectLinks[conn].active
					) && (VocabularyElements[link].types.includes(parsePrefix("z-sgov-pojem", "typ-vztahu"))
					)).concat(Object.keys(Links).filter(link => Links[link].inScheme === (ProjectSettings.ontographerContext + "/uml")));
			} else return [];
		} else return [];
	}

	setLink(link: string) {
		if (link !== "") this.props.close(link);
	}

	render() {
		return (<Modal centered scrollable show={this.props.modal}
					   onHide={() => this.props.close}
					   onEntering={() => this.setState({selectedLink: ""})}
		>
			<Modal.Header>
				<Modal.Title>{LocaleMenu.modalNewLinkTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{LocaleMenu.modalNewLinkDescription}</p>
				{ProjectSettings.representation === Representation.FULL && <span>
					<input defaultChecked={this.state.displayIncompatible}
                           onClick={(event: any) => {
							   this.setState({displayIncompatible: event.currentTarget.checked})
						   }}
                           type="checkbox"
                           id={"displayIncompatible"}
                    />
                    &nbsp;
                    <label htmlFor={"displayIncompatible"}>{LocaleMenu.showIncompatibleLinks}</label>
				</span>}
				<br/>
				<Form.Control htmlSize={Object.keys(Links).length} as="select" value={this.state.selectedLink}
							  onChange={this.handleChangeLink}>
					{this.getLinks().sort().map((link) => (
						<option key={link}
								onClick={() => this.setLink(link)}
								value={link}>{getLabelOrBlank(getLinkOrVocabElem(link).labels, this.props.projectLanguage)}</option>))}
				</Form.Control>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					this.props.close();
				}} variant="secondary">{LocaleMenu.cancel}</Button>
			</Modal.Footer>
		</Modal>);
	}
}