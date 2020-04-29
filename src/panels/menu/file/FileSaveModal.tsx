import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";
import {saveProject} from "../../../function/FunctionProject";

interface Props {
    modal: boolean;
    close: Function;
}

interface State{
    saveString: string;
}

export default class FileSaveModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            saveString: JSON.stringify(saveProject())
        }
    }
    render() {
        return (<Modal centered show={this.props.modal} onShow={()=>{
            this.setState({saveString: JSON.stringify(saveProject())})
        }}>
            <Modal.Header>
                <Modal.Title>{Locale.menuModalSaveHeading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{Locale.menuModalSaveText}</p>
                <Form.Control
                    style={{height: 150, resize: "none"}}
                    as={"textarea"}
                    disabled
                    value={this.state.saveString}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }} variant="secondary">{LocaleMenu.cancel}</Button>
            </Modal.Footer>
        </Modal>);
    }
}