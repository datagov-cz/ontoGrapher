import React from 'react';
import {Locale} from "../../../config/Locale";
import {MenuItem} from "react-bootstrap";
import PropTypes from 'prop-types';
import * as Helper from "../../../misc/Helper";

export class MenuAbstractDropdownModal extends React.Component {
    constructor(props) {
        super(props);

        if (this.constructor === MenuAbstractDropdownModal) {
            throw new TypeError(Locale.errorAbstractMenuItem);
        }

        this.state = {
            modal: false
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);

    }

    getMenuItem(){
        return (
            <MenuItem
            eventKey={this.props.eventKey}
            onSelect={this.handleOpenModal}
            >
                {this.props.name}
            </MenuItem>
        );
    }

    handleOpenModal(){
        this.setState({modal: true});
        Helper.closeDropdown();
    }

    handleCloseModal(){
        this.setState({modal: false});
    }

}

MenuAbstractDropdownModal.propTypes = {
    name: PropTypes.string.isRequired,
    eventKey: PropTypes.any.isRequired
};