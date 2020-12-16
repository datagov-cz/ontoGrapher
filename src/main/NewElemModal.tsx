import React from 'react';
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {PackageNode} from "../datatypes/PackageNode";
import {Languages, PackageRoot, ProjectSettings, Schemes, VocabularyElements} from "../config/Variables";
import {Locale} from "../config/Locale";
import {createNewElemIRI} from "../function/FunctionCreateVars";
import {initLanguageObject} from "../function/FunctionEditVars";

interface Props {
	modal: boolean;
	close: Function;
	projectLanguage: string;
}

interface State {
	conceptName: { [key: string]: string };
	errorText: string;
	selectedPackage: PackageNode;
}

export default class NewElemModal extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let pkg = PackageRoot.children.find(pkg => (!(Schemes[pkg.scheme].readOnly)))
		if (!pkg) this.props.close();
		this.state = {
			conceptName: initLanguageObject(""),
			selectedPackage: pkg ? pkg : PackageRoot,
			errorText: Locale[ProjectSettings.viewLanguage].modalNewElemError,
		}
		this.save = this.save.bind(this);
		this.checkExists = this.checkExists.bind(this);
	}

	checkExists(name: string): boolean {
		let newIRI = createNewElemIRI(this.state.selectedPackage.scheme, name);
		return (Object.keys(VocabularyElements)
			.filter(iri => VocabularyElements[iri].inScheme === this.state.selectedPackage.scheme).find(iri =>
				(iri === newIRI) || Object.values(VocabularyElements[iri].labels).find(
				label => label.trim().toLowerCase() === name.trim().toLowerCase())) !== undefined);
	}

	handleChangeInput(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, language: string) {
		let res = this.state.conceptName;
		res[language] = event.currentTarget.value;
		this.setState({conceptName: res});
		if (res["cs"] === "") {
			this.setState({errorText: Locale[ProjectSettings.viewLanguage].modalNewElemError});
		} else if (this.checkExists(event.currentTarget.value)) {
			this.setState({errorText: Locale[ProjectSettings.viewLanguage].modalNewElemExistsError});
		} else {
			this.setState({errorText: ""});
		}
	}

	handleChangeSelect(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
		let pkg = PackageRoot.children.find(pkg => pkg.labels[this.props.projectLanguage] === event.currentTarget.value);
		if (pkg) this.setState({selectedPackage: pkg});
		if (this.checkExists(event.currentTarget.value)) {
			this.setState({errorText: Locale[ProjectSettings.viewLanguage].modalNewElemExistsError});
		}
	}

	save() {
		if (this.state.errorText === "")
			this.props.close(this.state.conceptName, this.state.selectedPackage);
	}

	render() {
		return (<Modal centered scrollable show={this.props.modal} keyboard={true}
					   onEscapeKeyDown={() => this.props.close()}
					   onHide={() => this.props.close}
					   onEntering={() => {
						   if (this.state.selectedPackage === PackageRoot) {
							   let pkg = PackageRoot.children.find(pkg => (!(Schemes[pkg.scheme].readOnly)))
							   if (!pkg) this.props.close();
							   else this.setState({
								   conceptName: initLanguageObject(""),
								   errorText: Locale[ProjectSettings.viewLanguage].modalNewElemError,
								   selectedPackage: pkg
							   });
						   } else this.setState({
							   conceptName: initLanguageObject(""),
							   errorText: Locale[ProjectSettings.viewLanguage].modalNewElemError
						   })
						   let input = document.getElementById("newElemLabelInputcs");
						   if (input) input.focus();
					   }}
		>
			<Modal.Header>
				<Modal.Title>{Locale[ProjectSettings.viewLanguage].modalNewElemTitle}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={(event) => {
				event.preventDefault();
				if (this.state.errorText === "")
					this.save();
			}}>
				<Modal.Body>
					<p>{Locale[ProjectSettings.viewLanguage].modalNewElemDescription}</p>
					{Object.keys(Languages).map((lang) => <div key={lang}>
						<InputGroup>
							<InputGroup.Prepend>
								<InputGroup.Text
									id={"inputGroupPrepend" + lang}>{Languages[lang] + (lang === "cs" ? "*" : "")}</InputGroup.Text>
							</InputGroup.Prepend>
							<Form.Control id={"newElemLabelInput" + lang} type="text"
										  value={this.state.conceptName[lang]} required={lang === "cs"}
										  onChange={(event) => this.handleChangeInput(event, lang)}/>
						</InputGroup>
					</div>)}
					<br/>
					<Form.Group controlId="exampleForm.ControlSelect1">
						<Form.Label>{Locale[ProjectSettings.viewLanguage].selectPackage}</Form.Label>
						<Form.Control as="select" value={this.state.selectedPackage.labels[this.props.projectLanguage]}
									  onChange={(event) => this.handleChangeSelect(event)}>
							{PackageRoot.children.filter(pkg => !(Schemes[pkg.scheme].readOnly)).map((pkg, i) =>
								<option key={i}
										value={pkg.labels[this.props.projectLanguage]}>{pkg.labels[this.props.projectLanguage]}</option>)}
						</Form.Control>
					</Form.Group>
					<p className="red">{this.state.errorText}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button type={"submit"} disabled={this.state.errorText !== ""} variant="primary">
						{Locale[ProjectSettings.viewLanguage].confirm}
					</Button>
					<Button onClick={() => {
						this.props.close();
					}} variant="secondary">{Locale[ProjectSettings.viewLanguage].cancel}</Button>
				</Modal.Footer>
			</Form>
		</Modal>);
	}
}