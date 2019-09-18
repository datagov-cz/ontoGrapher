import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {FormControl, FormGroup, Tab, Tabs} from "react-bootstrap";
import {validateCurrent, validateSettingsWithCurrentSettings, validateSettingsWithModel} from "../../../misc/Validator";

export class MenuToolsValidate extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.validationResults = [];
        this.state = {
            validationInput1: "",
            validationInput2: ""
        };

        this.handleValidateCurrent = this.handleValidateCurrent.bind(this);
        this.handleChangeValidationInput1 = this.handleChangeValidationInput1.bind(this);
        this.handleChangeValidationInput2 = this.handleChangeValidationInput2.bind(this);
        this.handleValidateSettings = this.handleValidateSettings.bind(this);
        this.handleValidateModel = this.handleValidateModel.bind(this);
    }

    handleChangeValidationInput1(event){
        this.setState({validationInput1: event.target.value});
    }

    handleChangeValidationInput2(event){
        this.setState({validationInput2: event.target.value});
    }

    handleValidateSettings(){
        if (this.state.validationInput1 !== "") {
            this.validationResults = validateSettingsWithCurrentSettings(this.state.validationInput1);
        }
    }

    handleValidateModel(){
        if (this.state.validationInput2 !== "") {
            this.validationResults = validateSettingsWithModel(this.props.canvas.engine.getDiagramModel(), this.state.validationInput2);
        }
    }

    handleValidateCurrent(){
        this.validationResults = validateCurrent(this.props.canvas.engine.getDiagramModel());
    }

    render(){
        let validationResults = "";

        if (this.validationResults.length > 0) {
            validationResults = this.state.validationResults.map((result) => result + "\n");
        }

        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.validationTools}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs id="validateTabs" animation={false}>
                            <Tab eventKey={1} title={Locale.validateSettings}>
                                <p>{Locale.validateSettingsDescription}</p>
                                <FormGroup controlId="formControlsTextarea">
                                    <FormControl
                                        style={{height: 150, resize: "none"}}
                                        bsSize="small"
                                        componentClass="textarea"
                                        placeholder={Locale.menuValidateInputPlaceholder}
                                        value={this.state.validationInput1}
                                        onChange={this.handleChangeValidationInput1}
                                    />
                                </FormGroup>
                                <Button onClick={this.handleValidateSettings}
                                        bsStyle="primary">{Locale.validateButton}</Button>
                                <br/>
                                <FormGroup controlId="formControlsTextarea">
                                    <FormControl
                                        style={{height: 150, resize: "none"}}
                                        bsSize="small"
                                        componentClass="textarea"
                                        placeholder={Locale.menuValidateInputPlaceholder}
                                        value={this.validationResults.length > 0 ? validationResults : Locale.noErrors}
                                        disabled={true}
                                    />
                                </FormGroup>
                            </Tab>
                            <Tab eventKey={2} title={Locale.validateModel}>
                                <p>{Locale.validateModelDescription}</p>
                                <FormGroup controlId="formControlsTextarea">
                                    <FormControl
                                        style={{height: 150, resize: "none"}}
                                        bsSize="small"
                                        componentClass="textarea"
                                        placeholder={Locale.menuValidateInputPlaceholder}
                                        value={this.state.validationInput2}
                                        onChange={this.handleChangeValidationInput2}
                                    />
                                </FormGroup>
                                <Button onClick={this.handleValidateModel}
                                        bsStyle="primary">{Locale.validateButton}</Button>
                                <br/>
                                <FormGroup controlId="formControlsTextarea">
                                    <FormControl
                                        style={{height: 150, resize: "none"}}
                                        bsSize="small"
                                        componentClass="textarea"
                                        placeholder={Locale.menuValidateInputPlaceholder}
                                        value={this.validationResults.length > 0 ? validationResults : Locale.noErrors}
                                        disabled={true}
                                    />
                                </FormGroup>
                            </Tab>
                            <Tab eventKey={3} title={Locale.validateCurrent}>
                                <p>{Locale.validateCurrentDescription}</p>
                                <Button onClick={this.handleValidateCurrent}
                                        bsStyle="primary">{Locale.validateButton}</Button>
                                <br/>
                                <FormGroup controlId="formControlsTextarea">
                                    <FormControl
                                        style={{height: 150, resize: "none"}}
                                        bsSize="small"
                                        componentClass="textarea"
                                        placeholder={Locale.menuValidateInputPlaceholder}
                                        value={this.validationResults.length > 0 ? validationResults : Locale.noErrors}
                                        disabled={true}
                                    />
                                </FormGroup>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}