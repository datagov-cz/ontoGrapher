import React from 'react';

export interface StereotypePanelItemProps{
    model: any,
    color?: string,
    name: string
}

export interface StereotypePanelItemState {}

export class StereotypePanelItem extends React.Component {
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