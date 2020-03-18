import React from 'react';
import {Button, Modal, Form} from "react-bootstrap";
import * as Locale from "../../../locale/LocaleMain.json";

interface Props{
    modal: boolean;
    loadProject: Function;
    close: Function;
}

interface State{
    success: boolean;
    inputLoad: string;
}

export default class FileLoadModal extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            success: true,
            inputLoad: ""
        };

        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    handleChangeInput(event: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>){
        this.setState({
            inputLoad: event.currentTarget.value
        });
    }

    render(){
        return(<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{Locale.menuModalLoadHeading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{Locale.menuModalLoadText}</p>
                <Form.Control
                    style={{height: 150, resize: "none"}}
                    as={"textarea"}
                    value={this.state.inputLoad}
                    onChange={(event) => {this.handleChangeInput(event);}}
                    placeholder={Locale.menuModalLoadPlaceholder}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {this.props.close();}} variant="secondary">{Locale.cancel}</Button>
                <Button onClick={() => {this.props.loadProject(this.state.inputLoad);}}>{Locale.load}</Button>
            </Modal.Footer>
        </Modal>);
    }
}