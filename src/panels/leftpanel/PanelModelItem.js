import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

export class PanelModelItem extends React.Component {
    constructor(props) {
        super(props);
        this.alertPanel = this.alertPanel.bind(this);
        this.setClassName();
    }

    alertPanel(event) {
        this.props.handleChangeSelectedModel(this.props.model);
        this.setClassName();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedModel !== this.props.selectedModel) {
            this.setClassName();
            this.forceUpdate();
        }
    }

    setClassName() {
        this.name = this.props.model === this.props.selectedModel ? "panelLinkItem--selected" : "panelLinkItem";
    }

    render() {
        return (
            <div className={this.name}
                 onClick={this.alertPanel}
            >
                {this.props.model}
            </div>
        );
    }
}