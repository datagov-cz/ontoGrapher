import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {Form, FormControl, FormGroup, Tab, Tabs} from "react-bootstrap";
import {AttributeTypePool, CardinalityPool, LanguagePool, StereotypePool} from "../../../config/Variables";
import * as SemanticWebInterface from "../../../misc/SemanticWebInterface";
import {LinkPool} from "../../../config/LinkVariables";
import {Stereotype} from "../../../components/misc/Stereotype";

export class MenuSettingsNodes extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state={
            stereotypeSource: "",
            stereotypeName: "",
            stereotypeRDF: "",
            stereotypeDescription: "",
            node: 0
        };
        this.focus = this.focus.bind(this);
        this.addNode = this.addNode.bind(this);
        this.handleChangeStereotypeRDF = this.handleChangeStereotypeRDF.bind(this);
        this.handleChangeStereotypeName = this.handleChangeStereotypeName.bind(this);
        this.handleChangeNode = this.handleChangeNode.bind(this);
        this.handleReplaceStereotypes = this.handleReplaceStereotypes.bind(this);
        this.handleChangeStereotypeSource = this.handleChangeStereotypeSource.bind(this);
        this.handleChangeStereotypeDescription = this.handleChangeStereotypeDescription.bind(this);
        this.deleteNode = this.deleteNode.bind(this);
    }


    focus() {
        if (Object.entries(StereotypePool).length === 1) {
            this.setState({
                node: 0
            });
        }
    }

    addNode() {
        if (this.state.stereotypeName !== "" && this.state.stereotypeRDF !== "" && this.state.stereotypeDescription !== "") {
            StereotypePool.push(new Stereotype(this.state.stereotypeName,this.state.stereotypeIRI,this.state.stereotypeDescription,""));
            this.setState({stereotypeRDF: "", stereotypeName: "", stereotypeDescription: ""});
        }
    }

    handleChangeStereotypeRDF(event) {
        this.setState({stereotypeRDF: event.target.value});
    }

    handleChangeStereotypeDescription(event) {
        this.setState({stereotypeDescription: event.target.value});
    }


    handleChangeStereotypeName(event) {
        this.setState({stereotypeName: event.target.value});
    }

    deleteNode() {
        if (this.state.node !== undefined){
            if (Object.entries(StereotypePool).length > 1) {
                StereotypePool.splice(this.state.node,1);
            }
        }
    }

    handleChangeNode(event) {
        this.setState({node: event.target.value});
    }

    handleReplaceStereotypes() {
        if (this.state.stereotypeSource !== "") {
            SemanticWebInterface.fetchStereotypes(this.state.stereotypeSource, true, () => {
                this.setState({status: ""});
            });
        }
    }

    handleLoadStereotypes() {
        if (this.state.stereotypeSource !== "") {
            SemanticWebInterface.fetchStereotypes(this.state.stereotypeSource, false, () => {
                this.setState({status: ""});
            });
        }
    }

    handleChangeStereotypeSource(event) {
        this.setState({stereotypeSource: event.target.value});
    }

    //TODO: finish move up/down functions

    render(){
        let stereotypePool = StereotypePool.map((stereotype, i) => {
            return (
                <option key={i} value={i}>{StereotypePool[i].name}</option>
            )
        });
        let stereotypePoolLength = stereotypePool.length;
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.nodesSettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <FormGroup>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.node}
                                onChange={this.handleChangeNode}
                                onFocus={this.focus}
                                size={stereotypePoolLength}
                                style={{height: 300}}
                            >
                                {stereotypePool}
                            </FormControl>

                            <Button onClick={this.deleteNode}
                                    bsStyle="danger">{Locale.deleteSelected}</Button>

                        </FormGroup>
                        <h4>{Locale.createNew+Locale.stereotype}</h4>
                        <Tabs id="newStereotypes" animation={false}>
                            <Tab eventKey={1} title={Locale.manually}>
                                <Form>
                                    <FormControl
                                        type="text"
                                        value={this.state.stereotypeName}
                                        placeholder={Locale.stereotypeNamePlaceholder}
                                        onChange={this.handleChangeStereotypeName}
                                    />
                                    <FormControl
                                        type="text"
                                        value={this.state.stereotypeRDF}
                                        placeholder={Locale.stereotypeRDFPlaceholder}
                                        onChange={this.handleChangeStereotypeRDF}
                                    />
                                    <FormControl
                                        type="text"
                                        value={this.state.stereotypeDescription}
                                        placeholder={Locale.stereotypeDescriptionPlaceholder}
                                        onChange={this.handleChangeStereotypeRDF}
                                    />
                                    <Button onClick={this.addNode} bsStyle="primary">{Locale.addNode}</Button>
                                </Form>
                            </Tab>
                            <Tab eventKey={2} title={Locale.source}>
                                <FormControl
                                    type="text"
                                    value={this.state.stereotypeSource}
                                    placeholder={Locale.stereotypeSourcePlaceholder}
                                    onChange={this.handleChangeStereotypeSource}
                                />
                                <Button onClick={this.handleLoadStereotypes}
                                        bsStyle="primary">{Locale.loadStereotypes}</Button>
                                <Button onClick={this.handleReplaceStereotypes}
                                        bsStyle="primary">{Locale.replaceStereotypes}</Button>
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