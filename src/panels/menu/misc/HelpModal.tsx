import React from 'react';
import {Button, Modal} from "react-bootstrap";
import {Locale} from "../../../config/Locale";

interface Props {
    modal: boolean;
    close: Function;
    projectLanguage: string;
}

interface State {

}

export default class HelpModal extends React.Component<Props, State> {

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{Locale[this.props.projectLanguage].help}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{Locale[this.props.projectLanguage].helpDescription}<a
                    href="https://github.com/opendata-mvcr/ontoGrapher/wiki"
                    rel="noopener noreferrer"
                    target="_blank">https://github.com/opendata-mvcr/ontoGrapher/wiki</a>
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }}>{Locale[this.props.projectLanguage].close}</Button>
            </Modal.Footer>
        </Modal>);
    }
}