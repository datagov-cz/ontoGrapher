import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {Form, FormControl} from "react-bootstrap";
import {CardinalityPool, LanguagePool} from "../../../config/Variables";
import {Cardinality} from "../../../components/misc/Cardinality";
export class MenuSettingsCardinalities extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state={
            cardinalityName1: "",
            cardinalityName2: "",
            cardinality: CardinalityPool[0]
        };
        this.handleChangeCardinality = this.handleChangeCardinality.bind(this);
        this.handleChangeCardinalityName1 = this.handleChangeCardinalityName1.bind(this);
        this.handleChangeCardinalityName2 = this.handleChangeCardinalityName2.bind(this);
        this.focus = this.focus.bind(this);
        this.addCardinality = this.addCardinality.bind(this);
        this.deleteCardinality = this.deleteCardinality.bind(this);
    }
    focus(){
        if (Object.entries(CardinalityPool).length === 1) {
            this.setState({
                cardinality: CardinalityPool[0],
                cardinalityName1: "",
                cardinalityName2: ""
            });
        }
    }

    addCardinality() {
        CardinalityPool.push(new Cardinality(this.state.cardinalityName1,this.state.cardinalityName2));
        this.setState({cardinalityName1: "", cardinalityName2: ""});
    }

    deleteCardinality() {
        for (let card of CardinalityPool){
            if (card.getString() === this.state.cardinality){
                console.log(this.state.cardinality, card);
                CardinalityPool.splice(CardinalityPool.indexOf(card), 1);
                break;
            }
        }
    }


    handleChangeCardinality(event) {
        this.setState({cardinality: event.target.value});
    }

    handleChangeCardinalityName1(event) {
        this.setState({cardinalityName1: event.target.value});
    }

    handleChangeCardinalityName2(event) {
        this.setState({cardinalityName2: event.target.value});
    }


    render(){
        let cardinalityPool = Object.keys(CardinalityPool).map((cardinality) => {
            return (
                <option key={cardinality} value={CardinalityPool[cardinality].getString()}>{CardinalityPool[cardinality].getString()}</option>
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
                                    bsStyle="danger">{Locale.del + " " + this.state.cardinality}</Button>
                            <FormControl
                                type="text"
                                value={this.state.cardinalityName1}
                                onChange={this.handleChangeCardinalityName1}
                                style={{width:"50px"}}
                            />
                            ..
                            <FormControl
                                type="text"
                                value={this.state.cardinalityName2}
                                onChange={this.handleChangeCardinalityName2}
                                style={{width:"50px"}}
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