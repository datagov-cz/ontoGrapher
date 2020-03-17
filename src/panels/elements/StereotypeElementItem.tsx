import React from 'react';
import {Stereotypes} from "../../var/Variables";

interface Props {
    label: string;
    element: string;
    category: string;
    onMouseOver: Function;
    package: boolean;
}

interface State {

}

export default class StereotypeElementItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (<div draggable
                     onDragStart={(event) =>{
                         event.dataTransfer.setData("newClass", JSON.stringify({type: "stereotype", elem: this.props.element, package: this.props.package}));
                     }}
                     className={"stereotypeElementItem"} onMouseOver={()=>{this.props.onMouseOver();}}>
            <span className={"label"}>{this.props.label}</span><span className={"category"}>{this.props.category}</span>
        </div>);
    }
}