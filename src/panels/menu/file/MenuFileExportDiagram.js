import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import {Button, FormControl, FormGroup, MenuItem, Modal} from "react-bootstrap";
import * as SemanticWebInterface from "../../../interface/SemanticWebInterface";

export class MenuFileExportDiagram extends MenuAbstractDropdownModal {
    //TODO: make usable
    constructor(props){
        super(props);
        this.state = {
            inputExport: ""
        }
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>): void {
        if (prevState.modal !== this.state.modal && this.state.modal){
            this.export();
        }
    }

    export() {
        let owl = SemanticWebInterface.exportDiagram(this.props.canvas.engine.getDiagramModel());
        let serializer = new XMLSerializer();
        let owlSerialized = serializer.serializeToString(owl);
        this.setState({inputExport: owlSerialized});
    }

    render(){
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.menuModalExportHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{Locale.menuModalExportText}</p>
                        <FormGroup controlId="formControlsTextarea">
                            <FormControl
                                style={{height: 150, cursor: "auto", resize: "none"}}
                                bsSize="small"
                                componentClass="textarea"
                                value={this.state.inputExport}
                                disabled={true}
                            />
                        </FormGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary"
                                onClick={this.handleCloseModal}>{Locale.confirm}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}