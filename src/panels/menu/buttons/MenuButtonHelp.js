import {MenuAbstractButton} from "../abstract/MenuAbstractButton";
import React from "react";
import * as Helper from "../../../misc/Helper";
import {Button, Modal, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import {Locale} from "../../../config/locale/Locale";
import {LocaleHelp} from "../../../config/locale/LocaleHelp";

export class MenuButtonHelp extends MenuAbstractButton {
    constructor(props){
        super(props);

        this.state = {
            modal: false
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleOpenModal(){
        this.setState({modal: true});
        Helper.closeDropdown();
    }

    handleCloseModal(){
        this.setState({modal: false});
    }


    action(){
        this.handleOpenModal();
    }

    getSVG(){
        return (
            <path d="M8 2A4 4 0 0 0 4 6H5A3 3 0 0 1 8 3 3 3 0 0 1 11 6 3 3 0 0 1 8 9H7V12H8V10A4 4 0 0 0 12 6 4 4 0 0 0 8 2M7 13V14H8V13H7" fill="black"/>
        );
    }

    render(){
        const SVG = this.getSVG();
        const tooltip = (
            <Tooltip id="tooltip">
                {this.props.name}
            </Tooltip>
        );
        return(
            <div style={{display: "inline"}}>
                <OverlayTrigger placement="bottom" overlay={tooltip}>
                    <div className="menuButton" onClick={this.handleOpenModal}>
                        <svg viewBox="0 0 16 16"
                             shapeRendering="optimizeSpeed">
                            {SVG}
                        </svg>
                    </div>
                </OverlayTrigger>
                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.menuModalHelpHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs id="helpTabs" animation={false}>
                            {Object.keys(LocaleHelp).map((obj, i) => {
                                return (<Tab key={i} eventKey={i + 1} title={obj}>
                                    {LocaleHelp[obj]}
                                </Tab>);
                            })}
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