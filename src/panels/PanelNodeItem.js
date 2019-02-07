import React from 'react';

export class PanelNodeItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div
                draggable={true}
                onDragStart={event => {
                    event.dataTransfer.setData("newNode", JSON.stringify(this.props.model));
                }}
                className="stereotypePanelItem"
            >
                {this.props.name}
            </div>
        );
    }
}