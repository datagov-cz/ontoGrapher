import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {Form, FormControl} from "react-bootstrap";
import {CardinalityPool, LanguagePool} from "../../../config/Variables";
//TODO: change cardinality settings dialogue
export class MenuSettingsCardinalities extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state={
            cardinalityName: "",
            cardinality: CardinalityPool[0],
        };
        this.handleChangeCardinality = this.handleChangeCardinality.bind(this);
        this.handleChangeCardinalityName = this.handleChangeCardinalityName.bind(this);
        this.focus = this.focus.bind(this);
        this.addCardinality = this.addCardinality.bind(this);
        this.deleteCardinality = this.deleteCardinality.bind(this);
    }
    focus(){
        if (Object.entries(CardinalityPool).length === 1) {
            this.setState({
                cardinality: CardinalityPool[0],
                cardinalityName: "",
            });
        }
    }

    addCardinality() {
        CardinalityPool.push(this.state.cardinalityName);
        this.setState({cardinalityName: ""});
    }

    deleteCardinality() {
        CardinalityPool.splice(CardinalityPool.indexOf(this.state.cardinality), 1);
    }


    handleChangeCardinality(event) {
        this.setState({cardinality: event.target.value});
    }

    handleChangeCardinalityName(event) {
        this.setState({cardinalityName: event.target.value});
    }

    render(){
        let cardinalityPool = Object.keys(CardinalityPool).map((cardinality) => {
            return (
                <option key={cardinality} value={CardinalityPool[cardinality]}>{CardinalityPool[cardinality]}</option>
            )
        });
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.cardinalitySettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FormControl
                            componentClass="select"
                            bsSize="small"
                            value={this.state.cardinality}
                            onChange={this.handleChangeCardinality}
                            onFocus={this.focus}
                            size={cardinalityPool.length}
                            style={{height: 300}}
                        >
                            {cardinalityPool}
                        </FormControl><br/>
                        <Form inline>
                            <Button onClick={this.deleteCardinality}
                                    bsStyle="danger">{Locale.del + " " + CardinalityPool[CardinalityPool.indexOf(this.state.cardinality)]}</Button>
                            <FormControl
                                type="text"
                                value={this.state.cardinalityName}
                                placeholder={Locale.cardinalityName}
                                onChange={this.handleChangeCardinalityName}
                            />
                            <Button onClick={this.addCardinality} bsStyle="primary">{Locale.addCardinality}</Button>
                        </Form>
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