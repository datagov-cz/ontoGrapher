import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

interface Props {
    label: string;
    linkType: string;
    handleChangeSelectedLink: Function;
    selectedLink: string;
    scheme: string;
    definition?: string;
}

interface State {
    name: string;
}

export class LinkItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            name: this.props.linkType === this.props.selectedLink ? "stereotypeElementItem selected" : "stereotypeElementItem"
        };
        this.alertPanel = this.alertPanel.bind(this);
    }

    alertPanel() {
        this.props.handleChangeSelectedLink(this.props.linkType);
        this.setClassName();
    }

    componentDidMount(): void {
        this.setClassName();
    }

    componentDidUpdate(prevProps: { selectedLink: any; }) {
        if (prevProps.selectedLink !== this.props.selectedLink) {
            this.setClassName();
            this.forceUpdate();
        }
    }

    setClassName() {
        this.setState({name: this.props.linkType === this.props.selectedLink ? "stereotypeElementItem selected" : "stereotypeElementItem"});
    }

    render() {
        if (this.props.definition) {
            return (
                <OverlayTrigger popperConfig={{
                    modifiers: {
                        preventOverflow: {
                            enabled: false
                        }
                    }
                }} placement="right" overlay={<Tooltip id={this.props.linkType}>{this.props.definition}</Tooltip>}>
                    <div className={this.state.name}
                         onClick={this.alertPanel}
                    >
                        <span className={"label"}>{this.props.label}</span><span
                        className={"category"}>{this.props.scheme}</span>
                    </div>
                </OverlayTrigger>
            );
        } else {
            return (
                <div className={this.state.name}
                     onClick={this.alertPanel}
                >
                    <span className={"label"}>{this.props.label}</span><span
                    className={"category"}>{this.props.scheme}</span>
                </div>
            );
        }
    }
}