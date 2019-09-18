import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import {Button, FormControl, FormGroup, MenuItem, Modal} from "react-bootstrap";
import {Defaults} from "../../../diagram/Defaults";

export class MenuFileLoadDiagram extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.handleLoad = this.handleLoad.bind(this);
        this.state = {
            success: true,
            inputLoad: ""
        };

        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    handleChangeInput(event){
        this.setState({
           inputLoad: event.target.value
        });
    }

    handleLoad() {
        let result = this.props.deserialize(this.state.inputLoad);
        this.setState({success: !!result});
        setTimeout(() => {
            if (this.state.success) {
                this.handleCloseModal();
            }
        }, 100);

    }

    render(){
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.menuModalLoadHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{Locale.menuModalLoadText}</p>
                        <FormGroup controlId="formControlsTextarea">
                            <FormControl
                                style={{height: 150, resize: "none"}}
                                bsSize="small"
                                componentClass="textarea"
                                placeholder={Locale.menuModalLoadPlaceholder}
                                value={this.state.inputLoad}
                                onChange={this.handleChangeInput}
                            />
                        </FormGroup>
                        <p style={{color: "red"}}>{this.state.success ? "" : Locale.loadUnsuccessful}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal}>{Locale.close}</Button>
                        <Button bsStyle="primary" onClick={this.handleLoad}>{Locale.menuPanelLoad}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}