import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {Diagrams, ProjectSettings} from "../../config/Variables";
import {updateProjectSettings} from "../../interface/TransactionInterface";

interface Props {
    modal: boolean;
    diagram: number;
    close: Function;
    update: Function;
    handleChangeLoadingStatus: Function;
    retry: boolean;
}

interface State {
    inputEdit: string;
}

export default class ModalRenameDiagram extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            inputEdit: ""
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
        if (prevState !== this.state && ((this.props.retry && ProjectSettings.lastUpdate.source === this.constructor.name))) {
            this.save();
        }
    }

    save() {
        Diagrams[this.props.diagram].name = this.state.inputEdit;
        updateProjectSettings(ProjectSettings.contextIRI, ProjectSettings.contextEndpoint).then(result => {
            if (result) {
                this.props.handleChangeLoadingStatus(false, "", false);
            } else {
                this.props.handleChangeLoadingStatus(false, "", true);
            }
        })
    }

    render() {
        return (
            <Modal centered show={this.props.modal} onShow={() => {
                this.setState({inputEdit: Diagrams[this.props.diagram].name})
            }}>
                <Modal.Header>
                    <Modal.Title>{LocaleMenu.modalEditDiagramTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control onChange={(event: { currentTarget: { value: any; }; }) => {
                        this.setState({inputEdit: event.currentTarget.value})
                    }} type="text" value={this.state.inputEdit}
                                  placeholder={LocaleMain.modalEditDiagramPlaceholder}
                                  required/>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        this.props.close();
                    }} variant="secondary">{LocaleMenu.cancel}</Button>
                    <Button onClick={() => {
                        this.save();
                        this.props.update();
                        this.props.close();
                    }}>{LocaleMenu.confirm}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}