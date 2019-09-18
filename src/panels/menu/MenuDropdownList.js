import React from 'react';
import {DropdownButton} from "react-bootstrap";
import {Locale} from "../../config/Locale";
import PropTypes from 'prop-types';

export class MenuDropdownList extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <div className="dropdownList">
                <DropdownButton
                    title={this.props.name}
                    bsSize="small"
                    id={this.props.name}
                    onSelect={() => {console.log("baf");}}
                >
                    {this.props.children}
                </DropdownButton>
            </div>
        );
    }
}

MenuDropdownList.propTypes = {
    name: PropTypes.string.isRequired
};