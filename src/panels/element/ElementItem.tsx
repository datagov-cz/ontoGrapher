import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

interface Props {
    label: string;
    iri: string;
    scheme?: string;
    definition?: string;
}

interface State {

}

export default class ElementItem extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <OverlayTrigger
                popperConfig={{
                    modifiers: {
                        preventOverflow: {
                            enabled: false
                        }
                    }
                }}
                placement="right" overlay={<Tooltip id={this.props.iri}>{this.props.definition}</Tooltip>}>
                <div draggable
                     onDragStart={(event) => {
                         event.dataTransfer.setData("newClass", JSON.stringify({
                             type: "new",
                             iri: this.props.iri
                         }));
                     }}
                     className={"stereotypeElementItem"}>
                    <span className={"label"}>{this.props.label}</span>
                    {this.props.scheme ? <span className={"category"}>{this.props.scheme}</span> : <span/>}
                </div>
            </OverlayTrigger>
        );
    }

}