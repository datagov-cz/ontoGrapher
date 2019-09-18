import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import {Button, MenuItem, Modal} from "react-bootstrap";
import {Defaults} from "../../../diagram/Defaults";
import {MenuAbstractDropdownAction} from "../abstract/MenuAbstractDropdownAction";
import * as Helper from "../../../misc/Helper";

export class MenuViewZoom extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);

        this.action = this.action.bind(this);
    }

    action(){
        this.props.canvas.engine.getDiagramModel().setZoomLevel(100);
        Helper.closeDropdown();
    }

    render(){
        return this.getMenuItem();
    }
}