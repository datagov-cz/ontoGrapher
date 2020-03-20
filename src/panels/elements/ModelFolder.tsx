import React from 'react';
import {PackageNode} from "../../components/PackageNode";
import {Tooltip} from "react-bootstrap";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {PackageRoot, ProjectElements} from "../../var/Variables";

interface Props {
    category: string;
    depth: number;
    update: Function;
    open:Function;
}

interface State {
    open: boolean;
    hover: boolean;
}

export default class ModelFolder extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
            hover: false
        }
    }

    render() {
        return (<div>
            <div
                onMouseOver={() => {
                    this.setState({hover: true})
                }}
                onMouseLeave={() => {
                    this.setState({hover: false})
                }}
                onClick={() => {
                    this.setState({open: !this.state.open});
                    this.props.open();
                    this.props.update();
                }}
                className={"packageFolder" + (this.state.open ? " open" : "")}
                style={{marginLeft: (this.props.depth) * 10 + "px"}}>
                {(this.props.depth === 0 ? "💃🏼" : "↘") +"📁 " + this.props.category}
                {this.state.open ?
                    this.props.children
                    : <span></span>}
            </div>
        </div>);
    }
}