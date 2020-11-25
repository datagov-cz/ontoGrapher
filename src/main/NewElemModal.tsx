import React from 'react';
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {PackageNode} from "../datatypes/PackageNode";
import {Languages, PackageRoot, ProjectSettings, Schemes} from "../config/Variables";
import {Locale} from "../config/Locale";

interface Props {
	modal: boolean;
	close: Function;
	projectLanguage: string;
}

interface State {
	conceptName: string;
	displayError: boolean;
	selectedPackage: PackageNode;
}

export default class NewElemModal extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let pkg = PackageRoot.children.find(pkg => pkg.scheme && (!(Schemes[pkg.scheme].readOnly)))
		if (!pkg) this.props.close();
		this.state = {
			conceptName: "",
			displayError: false,
			selectedPackage: pkg ? pkg : PackageRoot
		}
		this.save = this.save.bind(this);
	}

	save() {
		if (this.state.conceptName === "") {
			this.setState({displayError: true});
		} else this.props.close(this.state.conceptName, this.state.selectedPackage);
	}

	render() {
		return (<Modal centered scrollable show={this.props.modal} keyboard={true}
					   onEscapeKeyDown={() => this.props.close()}
					   onHide={() => this.props.close}
					   onEntering={() => {
						   if (this.state.selectedPackage === PackageRoot) {
							   let pkg = PackageRoot.children.find(pkg => pkg.scheme && (!(Schemes[pkg.scheme].readOnly)))
							   if (!pkg) this.props.close();
							   else this.setState({
								   conceptName: "",
								   displayError: false,
								   selectedPackage: pkg
							   });
						   } else this.setState({conceptName: "", displayError: false})
						   let input = document.getElementById("newElemLabelInput");
						   if (input) input.focus();
					   }}
		>
			<Modal.Header>
				<Modal.Title>{Locale[ProjectSettings.viewLanguage].modalNewElemTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{Locale[ProjectSettings.viewLanguage].modalNewElemDescription}</p>
				<Form onSubmit={(event) => {
					event.preventDefault();
					this.save()
				}}>
					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text
								id="inputGroupPrepend">{Languages[this.props.projectLanguage]}</InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control id={"newElemLabelInput"} type="text" value={this.state.conceptName} required
									  onChange={(event) => this.setState({conceptName: event.currentTarget.value})}/>
					</InputGroup>
					<br/>
					<Form.Group controlId="exampleForm.ControlSelect1">
						<Form.Label>{Locale[ProjectSettings.viewLanguage].selectPackage}</Form.Label>
						<Form.Control as="select" value={this.state.selectedPackage.labels[this.props.projectLanguage]}
									  onChange={(event) => {
										  let pkg = PackageRoot.children.find(pkg => pkg.labels[this.props.projectLanguage] === event.currentTarget.value);
										  if (pkg) this.setState({selectedPackage: pkg});
									  }}>
							{PackageRoot.children.filter(pkg => pkg.scheme && !(Schemes[pkg.scheme].readOnly)).map((pkg, i) =>
								<option key={i}
										value={pkg.labels[this.props.projectLanguage]}>{pkg.labels[this.props.projectLanguage]}</option>)}
						</Form.Control>
					</Form.Group>
				</Form>
				<p style={{display: this.state.displayError ? "block" : "none"}}
				   className="red">{Locale[ProjectSettings.viewLanguage].modalNewElemError}</p>

			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					this.save()
				}} variant="primary">{Locale[ProjectSettings.viewLanguage].confirm}</Button>
				<Button onClick={() => {
					this.props.close();
				}} variant="secondary">{Locale[ProjectSettings.viewLanguage].cancel}</Button>
			</Modal.Footer>
		</Modal>);
	}
}