import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../locale/LocaleMenu.json";

interface Props {
	modal: boolean;
	close: Function;
}

interface State {

}

export default class NewElemDiagram extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	render() {
		return (<Modal centered show={this.props.modal}>
			<Modal.Header>
				<Modal.Title>{LocaleMenu.modalNewElemTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>

			</Modal.Body>
			<Modal.Footer>
				<Button onClick={() => {
					this.props.close();
				}} variant="secondary">{LocaleMenu.cancel}</Button>
				<Button onClick={() => {
					this.props.close();
				}}>{LocaleMenu.confirm}</Button>
			</Modal.Footer>
		</Modal>);
	}
}