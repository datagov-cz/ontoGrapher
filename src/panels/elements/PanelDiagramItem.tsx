import React from 'react';

interface Props{
    linkType: string;
    handleChangeSelectedLink: Function;
    selectedLink: string;
}

interface State {
}

export default class PanelDiagramItem extends React.Component<Props, State> {
    private name: string;
    constructor(props: Props) {
        super(props);
        this.name = this.props.linkType === this.props.selectedLink ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram";
        this.alertPanel = this.alertPanel.bind(this);
        this.setClassName();
    }

    alertPanel() {
        this.props.handleChangeSelectedLink(this.props.linkType);
        this.setClassName();
    }

    componentDidUpdate(prevProps: { selectedLink: any; }) {
        if (prevProps.selectedLink !== this.props.selectedLink) {
            this.setClassName();
            this.forceUpdate();
        }
    }

    setClassName() {
        this.name = this.props.linkType === this.props.selectedLink ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram";
    }

    render() {
        return (
                <div className={this.name}
                     onClick={this.alertPanel}
                >
                    <span className={"label"}>{this.props.linkType}</span>
                </div>
        );
    }
}