import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import {Button, FormControl, FormGroup, MenuItem, Modal} from "react-bootstrap";

export class MenuFileSaveDiagram extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state = {
            inputSave: ""
        }
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>): void {
        if (prevState.modal !== this.state.modal && this.state.modal){
            this.serialize();
        }
    }

    serialize(){
        let save = this.props.canvas.serialize();
        this.setState({
            inputSave: save
        });
    }

    render(){
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.menuModalSaveHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{Locale.menuModalSaveText}</p>
                        <FormGroup controlId="formControlsTextarea">
                            <FormControl
                                style={{height: 150, cursor: "auto", resize: "none"}}
                                bsSize="small"
                                componentClass="textarea"
                                value={this.state.inputSave}
                                disabled={true}
                            />
                        </FormGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary" onClick={this.handleCloseModal}>{Locale.confirm}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}