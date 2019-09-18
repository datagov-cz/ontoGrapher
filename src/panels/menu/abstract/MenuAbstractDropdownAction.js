import React from 'react';
import {Locale} from "../../../config/Locale";
import PropTypes from 'prop-types';
import {MenuAbstractDropdownModal} from "./MenuAbstractDropdownModal";
import {MenuItem} from "react-bootstrap";

export class MenuAbstractDropdownAction extends React.Component{
    constructor(props){
        super(props);

        if (this.constructor === MenuAbstractDropdownAction) {
            throw new TypeError(Locale.errorAbstractMenuItem);
        }

        if (this.action === undefined) {
            throw new TypeError(Locale.errorAbstractMissingAction + Object.getPrototypeOf(this));
        }
    }

    render(){
        return this.getMenuItem();
    }

    getMenuItem(){
        return (
            <MenuItem
                eventKey={this.props.eventKey}
                onSelect={this.action}
            >
                {this.props.name}
            </MenuItem>
        );
    }
}

MenuAbstractDropdownModal.propTypes = {
    name: PropTypes.string.isRequired,
    eventKey: PropTypes.any.isRequired
}