import React from 'react';
import {LinkCommonWidget} from "../common-link/LinkCommonWidget";





export class FormalLinkWidget extends LinkCommonWidget {
    constructor(props){
        super(props);
        this.props.link.addDescriptorLabel();
    }
}