import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {Form, FormControl} from "react-bootstrap";
import {AttributeTypePool} from "../../../config/Variables";
import {AttributeType} from "../../../components/misc/AttributeType";

export class MenuSettingsAttributeTypes extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state={
            attributeTypeName: "",
            attributeTypeIRI: "",
            attributeTypeType: "",
            attributeType: 0,
        };
        this.handleChangeAttributeTypeName = this.handleChangeAttributeTypeName.bind(this);
        this.handleChangeAttributeType = this.handleChangeAttributeType.bind(this);
        this.addAttributeType = this.addAttributeType.bind(this);
        this.deleteAttributeType = this.deleteAttributeType.bind(this);
        this.focus = this.focus.bind(this);
        this.handleChangeAttributeTypeIRI = this.handleChangeAttributeTypeIRI.bind(this);
        this.handleChangeAttributeTypeType = this.handleChangeAttributeTypeType.bind(this);
    }
    focus(){
        if (AttributeTypePool.length === 1) {
            this.setState({
                attributeType: AttributeTypePool[0]
            });
        }
    }

    handleChangeAttributeType(event) {
        this.setState({attributeType: event.target.value});
    }

    addAttributeType() {
        if (this.state.attributeTypeName !== "" && this.state.attributeTypeIRI !== "" && this.state.attributeTypeType !== ""){
            AttributeTypePool.push(new AttributeType(this.state.attributeTypeName,this.state.attributeTypeIRI,this.state.attributeTypeType, false));
            this.setState({attributeTypeName: "", attributeTypeType: "", attributeTypeIRI: ""});
        }
    }

    deleteAttributeType() {
        AttributeTypePool.splice(AttributeTypePool.indexOf(this.state.attributeType), 1);
    }

    handleChangeAttributeTypeName(event) {
        this.setState({attributeTypeName: event.target.value});
    }

    handleChangeAttributeTypeType(event) {
        this.setState({attributeTypeType: event.target.value});
    }

    handleChangeAttributeTypeIRI(event) {
        this.setState({attributeTypeIRI: event.target.value});
    }



    render(){
        let attributeTypePool = (AttributeTypePool).map((attributeType, i) => {
            return (
                <option key={i}
                        value={i}>{attributeType.name}</option>
            )
        });
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.attributeTypesSettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FormControl
                            componentClass="select"
                            bsSize="small"
                            value={this.state.attributeType}
                            onChange={this.handleChangeAttributeType}
                            onFocus={this.focus}
                            size={attributeTypePool.length}
                            style={{height: 300}}
                        >
                            {attributeTypePool}
                        </FormControl><br/>
                        <Button onClick={this.deleteAttributeType}
                        bsStyle="danger">{Locale.deleteSelected}</Button>

                    <h4>{Locale.createNew+Locale.attributeType}</h4>
                        <Form>

                            <FormControl
                                type="text"
                                value={this.state.attributeTypeName}
                                placeholder={Locale.attributeTypePlaceholder}
                                onChange={this.handleChangeAttributeTypeName}
                            />
                            <FormControl
                                type="text"
                                value={this.state.attributeTypeIRI}
                                placeholder={Locale.attributeTypeIRIPlaceholder}
                                onChange={this.handleChangeAttributeTypeIRI}
                            />
                            <FormControl
                                type="text"
                                value={this.state.attributeTypeType}
                                placeholder={Locale.attributeTypeTypePlaceholder}
                                onChange={this.handleChangeAttributeTypeType}
                            />
                        </Form>
                        <Button onClick={this.addAttributeType}
                                bsStyle="primary">{Locale.addAttributeType}</Button>
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