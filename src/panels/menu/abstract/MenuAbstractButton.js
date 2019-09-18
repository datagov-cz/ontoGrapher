import {Locale} from "../../../config/Locale";
import {MenuItem, OverlayTrigger, Tooltip} from "react-bootstrap";
import {MenuAbstractDropdownModal} from "./MenuAbstractDropdownModal";
import PropTypes from "prop-types";
import React from 'react';

export class MenuAbstractButton extends React.Component {
    constructor(props){
        super(props);

        if (this.constructor === MenuAbstractButton) {
            throw new TypeError(Locale.errorAbstractMenuItem);
        }

        if (this.action === undefined) {
            throw new TypeError(Locale.errorAbstractMissingAction + Object.getPrototypeOf(this));
        }

        if (this.getSVG === undefined) {
            throw new TypeError(Locale.errorAbstractMissingSVG + Object.getPrototypeOf(this));
        }
    }

    render(){
        const SVG = this.getSVG();
        const tooltip = (
            <Tooltip id="tooltip">
                {this.props.name}
            </Tooltip>
        );
        return(
            <OverlayTrigger placement="bottom" overlay={tooltip}>
                <div className="menuButton" onClick={this.action}>
                    <svg viewBox="0 0 30 30"
                         shapeRendering="optimizeSpeed">
                        {SVG}
                    </svg>
                </div>
            </OverlayTrigger>
            );

    }

}

MenuAbstractDropdownModal.propTypes = {
    name: PropTypes.string.isRequired,
    eventKey: PropTypes.any.isRequired
}