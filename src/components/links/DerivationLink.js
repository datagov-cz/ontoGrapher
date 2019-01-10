import React from 'react';
import {LinkCommonWidget} from "../common-link/LinkCommonWidget";





export class DerivationLinkWidget extends LinkCommonWidget {
    constructor(props){
        super(props);
        this.props.link.setDashedLine();
    }
}