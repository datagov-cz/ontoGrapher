import React from 'react';
import {Stereotypes} from "../../var/Variables";

interface Props {
    label: string;
    id: string;
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
                         event.dataTransfer.setData("newClass", JSON.stringify({elem: this.props.id, package: false}));
                     }}
                     className={"stereotypeElementItem"} onMouseOver={()=>{this.props.onMouseOver();}}>
            <span className={"label"}>{this.props.label}</span>
        </div>);
    }
}