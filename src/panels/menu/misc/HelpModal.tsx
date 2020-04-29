import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";

interface Props {
    modal: boolean;
    close: Function;
}

interface State {

}

export default class HelpModal extends React.Component<Props, State> {

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.help}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{LocaleMenu.helpDescription}<a href="https://github.com/opendata-mvcr/ontoGrapher/wiki" rel="noopener noreferrer" target="_blank">https://github.com/opendata-mvcr/ontoGrapher/wiki</a></p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {this.props.close();}}>{LocaleMenu.close}</Button>
            </Modal.Footer>
        </Modal>);
    }
}