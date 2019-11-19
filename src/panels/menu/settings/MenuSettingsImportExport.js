import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {FormControl, FormGroup, Tab, Tabs} from "react-bootstrap";
import {exportSettings, importSettings} from "../../../interface/ImportExportInterface";

export class MenuSettingsImportExport extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state={
            importSettingsInput: "",
            exportSettingsData: "",
            exportURI: "",
            exportName: "",
            exportPrefix: "",
            failure: false
        };
        this.handleChangeExportName = this.handleChangeExportName.bind(this);
        this.handleChangeExportPrefix = this.handleChangeExportPrefix.bind(this);
        this.handleChangeExportURI = this.handleChangeExportURI.bind(this);
        this.handleExportSettings = this.handleExportSettings.bind(this);
        this.handleChangeImportSettingsInput = this.handleChangeImportSettingsInput.bind(this);
        this.handleImportSettings = this.handleImportSettings.bind(this);
    }

    handleImportSettings() {
        if (this.state.importSettingsInput !== "") {
            if (!importSettings(this.state.importSettingsInput)) {
                this.setState({failure: true});
            } else {
                this.setState({failure: false});
                this.handleCloseModal();
            }
        }
    }

    handleChangeImportSettingsInput(event) {
        this.setState({importSettingsInput: event.target.value});
    }

    handleChangeExportName(event) {
        this.setState({exportName: event.target.value});
    }

    handleChangeExportPrefix(event) {
        this.setState({exportPrefix: event.target.value});
    }

    handleChangeExportURI(event) {
        this.setState({exportURI: event.target.value});
    }

    handleExportSettings() {
        if (this.state.exportName !== "" && this.state.exportPrefix !== "" && this.state.exportURI !== "") {
            let exportData = exportSettings(this.state.exportName, this.state.exportPrefix, this.state.exportURI);
            this.setState({exportSettingsData: exportData});
        }
    }

    render(){
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.importExportTools}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs id="importExportTabs" animation={false}>
                            <Tab eventKey={1} title={Locale.importSettings}>
                                <p>{Locale.importSettingsDescription}</p>
                                <p style={{color: "red"}}>{Locale.importSettingsWarning}</p>
                                <FormGroup controlId="formControlsTextarea">
                                    <FormControl
                                        style={{height: 150, resize: "none"}}
                                        bsSize="small"
                                        componentClass="textarea"
                                        placeholder={Locale.menuValidateInputPlaceholder}
                                        value={this.state.importSettingsInput}
                                        onChange={this.handleChangeImportSettingsInput}
                                    />
                                </FormGroup>
                                <p>{this.state.failure ? Locale.errorImport : ""}</p>
                                <Button onClick={this.handleImportSettings}
                                        bsStyle="primary">{Locale.import}</Button>
                            </Tab>
                            <Tab eventKey={2} title={Locale.exportSettings}>
                                <p>{Locale.exportSettingsDescription}</p>
                                <FormGroup controlId="formControlsTextarea">
                                    <FormControl
                                        bsSize="small"
                                        type="text"
                                        value={this.state.exportName}
                                        placeholder={Locale.detailPanelName}
                                        onChange={this.handleChangeExportName}
                                    />
                                    <br/>
                                    <FormControl
                                        bsSize="small"
                                        type="text"
                                        value={this.state.exportPrefix}
                                        placeholder={Locale.menuModalPrefix}
                                        onChange={this.handleChangeExportPrefix}
                                    />
                                    <br/>
                                    <FormControl
                                        bsSize="small"
                                        type="text"
                                        value={this.state.exportURI}
                                        placeholder={Locale.menuModalURI}
                                        onChange={this.handleChangeExportURI}
                                    />
                                    <br/>
                                    <Button bsStyle="primary"
                                            onClick={this.handleExportSettings}>{Locale.export}</Button>
                                    <FormControl
                                        style={{height: 150, resize: "none"}}
                                        bsSize="small"
                                        componentClass="textarea"
                                        value={this.state.exportSettingsData}
                                        disabled={true}
                                    />
                                </FormGroup>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal}
                                bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}