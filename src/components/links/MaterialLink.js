import React from 'react';
import {LinkCommonWidget} from "../common-link/LinkCommonWidget";





export class MaterialLinkWidget extends LinkCommonWidget {
    constructor(props){
        super(props);
        this.props.link.addDescriptorLabel();
    }
}
