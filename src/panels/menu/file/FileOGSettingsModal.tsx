import React from 'react';
import {Button, Modal, Form, Col, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";

interface Props{
    modal: boolean;
    saveOGSettings: Function;
    close: Function;
    theme: string;
}

interface State {
    theme: string;
}

export default class FileOGSettingsModal extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            theme: this.props.theme
        };
        this.handleChangeTheme = this.handleChangeTheme.bind(this);
        this.saveOGSettings = this.saveOGSettings.bind(this);
    }

    saveOGSettings(){
        this.props.saveOGSettings({
            theme: this.state.theme
        });
        this.props.close();
    }

    handleChangeTheme(event: string){
        this.setState({theme: event});
    }

    render(){
        return(<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.OGsettingsTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Row>
                        <Form.Label column lg={2}>{LocaleMenu.theme}</Form.Label>
                        <Col>
                            <ToggleButtonGroup key={"theme"} type="radio" name="options" onChange={this.handleChangeTheme}>
                                <ToggleButton variant={"light"} value={"light"}>{LocaleMenu.light}</ToggleButton>
                                <ToggleButton variant={"dark"} value={"dark"}>{LocaleMenu.dark}</ToggleButton>
                            </ToggleButtonGroup>
                        </Col>
                    </Form.Row>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {this.props.close();}} variant="secondary">{LocaleMenu.cancel}</Button>
                <Button onClick={this.saveOGSettings}>{LocaleMenu.confirm}</Button>
            </Modal.Footer>
        </Modal>);
    }
}