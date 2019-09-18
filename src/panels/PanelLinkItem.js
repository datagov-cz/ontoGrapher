import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

export class PanelLinkItem extends React.Component {
    constructor(props) {
        super(props);
        this.alertPanel = this.alertPanel.bind(this);
        this.setClassName();
    }

    alertPanel(event) {
        this.props.handleChangeSelectedLink(this.props.linkType);
        this.setClassName();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedLink !== this.props.selectedLink) {
            this.setClassName();
            this.forceUpdate();
        }
    }

    setClassName() {
        this.name = this.props.linkType === this.props.selectedLink ? "panelLinkItem--selected" : "panelLinkItem";
    }

    render() {
        return (
                <div className={this.name}
                     onClick={this.alertPanel}
                >
                    {this.props.linkType}
                </div>
        );
    }
}