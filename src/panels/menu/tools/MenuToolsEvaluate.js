import React from "react";
import {MenuAbstractDropdownAction} from "../abstract/MenuAbstractDropdownAction";
import * as Helper from "../../../misc/Helper";

export class MenuToolsEvaluate extends MenuAbstractDropdownAction {
    constructor(props){
        super(props);
        this.action = this.action.bind(this);
    }

    action(){
        this.props.action();
        Helper.closeDropdown();
    }

    render(){
        return this.getMenuItem();
    }
}