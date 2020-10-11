import React from 'react';
import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import * as LocaleMenu from "../locale/LocaleMenu.json";
import {PackageNode} from "../datatypes/PackageNode";
import {Languages, PackageRoot, Schemes} from "../config/Variables";

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

export default class NewElemDiagram extends React.Component<Props, State> {
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
		return (<Modal centered scrollable show={this.props.modal}
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
					   }}
		>
			<Modal.Header>
				<Modal.Title>{LocaleMenu.modalNewElemTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{LocaleMenu.modalNewElemDescription}</p>
				<Form onSubmit={(event) => {
					event.preventDefault();
					this.save()
				}}>
					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text
								id="inputGroupPrepend">{Languages[this.props.projectLanguage]}</InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control type="text" value={this.state.conceptName} required
									  onChange={(event) => this.setState({conceptName: event.currentTarget.value})}/>
					</InputGroup>
					<br/>
					<Form.Group controlId="exampleForm.ControlSelect1">
						<Form.Label>{LocaleMenu.selectPackage}</Form.Label>
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
				   className="red">{LocaleMenu.modalNewElemError}</p>

			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					this.save()
				}} variant="primary">{LocaleMenu.confirm}</Button>
				<Button onClick={() => {
					this.props.close();
				}} variant="secondary">{LocaleMenu.cancel}</Button>
			</Modal.Footer>
		</Modal>);
	}
}