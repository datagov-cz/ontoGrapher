import React from "react";
import {Locale} from "../../../config/Locale";
import {Button, MenuItem, Modal} from "react-bootstrap";
import {MenuAbstractDropdownAction} from "../abstract/MenuAbstractDropdownAction";
import {Defaults} from "../../../diagram/Defaults";
import * as Helper from "../../../misc/Helper";

export class MenuViewCenter extends MenuAbstractDropdownAction {
    constructor(props){
        super(props);

        this.action = this.action.bind(this);
    }

    action(){
        this.props.canvas.engine.getDiagramModel().setOffsetX(Defaults.offset.x);
        this.props.canvas.engine.getDiagramModel().setOffsetY(Defaults.offset.y);
        Helper.closeDropdown();
    }

    render(){
        return this.getMenuItem();
    }
}