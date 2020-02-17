import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";

interface Props{
    modal: boolean;
    loadProject: Function;
    close: Function;
}

export default class FileLoadModal extends React.Component<Props, any>{
    constructor(props: Props) {
        super(props);
    }

    render(){
        return(<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.fileNewModalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{LocaleMenu.fileNewModalDescription}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {this.props.close();}} variant="secondary">{LocaleMenu.cancel}</Button>
                <Button onClick={() => {this.props.loadProject();}}>{LocaleMenu.load}</Button>
            </Modal.Footer>
        </Modal>);
    }
}