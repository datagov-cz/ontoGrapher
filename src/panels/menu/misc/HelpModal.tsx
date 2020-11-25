import React from 'react';
import {Button, Modal} from "react-bootstrap";
import {ProjectSettings} from "../../../config/Variables";
import {Locale} from "../../../config/Locale";

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
                <Modal.Title>{Locale[ProjectSettings.viewLanguage].help}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{Locale[ProjectSettings.viewLanguage].helpDescription}<a
                    href="https://github.com/opendata-mvcr/ontoGrapher/wiki"
                    rel="noopener noreferrer"
                    target="_blank">https://github.com/opendata-mvcr/ontoGrapher/wiki</a>
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }}>{Locale[ProjectSettings.viewLanguage].close}</Button>
            </Modal.Footer>
        </Modal>);
    }
}