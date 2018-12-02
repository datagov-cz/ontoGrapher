import React from 'react';
import {CommonLinkWidget} from "../common-link/CommonLinkWidget";





export class FormalLinkWidget extends CommonLinkWidget {
    constructor(props){
        super(props);
        this.props.link.addDescriptorLabel();
    }
}