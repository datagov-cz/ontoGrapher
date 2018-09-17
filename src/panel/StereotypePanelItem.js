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
                style={{ background: this.props.color }}
                draggable={true}
                onDragStart={event => {
                    event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
                }}
                className="stereotypePanelItem"
            >
                {this.props.name}
            </div>
        );
    }
}