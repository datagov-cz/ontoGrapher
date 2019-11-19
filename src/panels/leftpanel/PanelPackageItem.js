import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

export class PanelPackageItem extends React.Component {
    constructor(props) {
        super(props);
        this.alertPanel = this.alertPanel.bind(this);
        this.setClassName();
    }

    alertPanel(event) {
        this.props.handleChangeSelectedPackage(this.props.package);
        this.setClassName();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedPackage !== this.props.selectedPackage) {
            this.setClassName();
            this.forceUpdate();
        }
    }

    setClassName() {
        this.name = this.props.package === this.props.selectedPackage ? "panelLinkItem--selected" : "panelLinkItem";
    }

    render() {
        return (
            <div className={this.name}
                 onClick={this.alertPanel}
            >
                {this.props.package}
            </div>
        );
    }
}