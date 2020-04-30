import React from 'react';
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {getNameOrBlank} from "../../function/FunctionGetVars";

interface Props {
    iri: string;
    definition?: string;
    label: string;
    scheme?: string;
}

export default class ElementItem extends React.Component<Props> {

    render() {
        return (this.props.definition ?
                <OverlayTrigger
                    popperConfig={{
                        modifiers: {
                            preventOverflow: {
                                enabled: false
                            }
                        }
                    }}
                    placement="right"
                    overlay={<Tooltip id={this.props.iri}>{this.props.definition}</Tooltip>}>
                    <div draggable
                         onDragStart={(event) => {
                             event.dataTransfer.setData("newClass", JSON.stringify({
                                 type: "new",
                                 iri: this.props.iri
                             }));
                         }}
                         className={"stereotypeElementItem"}>
                        <span className={"label"}>{getNameOrBlank(this.props.label)}</span>
                        {this.props.scheme ? <span className={"category"}>{this.props.scheme}</span> : <span/>}
                    </div>
                </OverlayTrigger> : <div draggable
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
        );
    }

}