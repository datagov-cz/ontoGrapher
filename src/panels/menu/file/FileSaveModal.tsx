import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";

interface Props{
    modal: boolean;
    saveProject: Function;
    saveString: string;
    close: Function;
}

export default class FileSaveModal extends React.Component<Props, any>{

    render(){
        return(<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{Locale.menuModalSaveHeading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{Locale.menuModalSaveText}</p>
                <Form.Control
                    style={{height: 150, resize: "none"}}
                    as={"textarea"}
                    disabled
                    value={this.props.saveString}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {this.props.close();}} variant="secondary">{LocaleMenu.cancel}</Button>
            </Modal.Footer>
        </Modal>);
    }
}