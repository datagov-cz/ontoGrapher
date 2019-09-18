import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

export class MenuFileNewDiagram extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.handleNew = this.handleNew.bind(this);
    }

    handleNew(){
        this.props.handleNew();
        this.handleCloseModal();
    }

    render(){
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.menuModalNewHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{Locale.menuModalNewText}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal}>{Locale.close}</Button>
                        <Button onClick={this.handleNew} bsStyle="primary">{Locale.yes}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}