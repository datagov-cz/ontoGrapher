import React from 'react';
import {PackageNode} from "../../datatypes/PackageNode";
import {ProjectSettings, Schemes} from "../../config/Variables";
import {getLabelOrBlank} from "../../function/FunctionGetVars";

interface Props {
    node: PackageNode;
    update: Function;
    projectLanguage: string;
    readOnly: boolean;
    handleSelect: Function;
}

interface State {
    open: boolean;
    hover: boolean;
}

export default class PackageFolder extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
            hover: false
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevProps !== this.props && this.state.open !== this.props.node.open) {
            this.setState({open: this.props.node.open});
        }
    }

    render() {
        return (
            <div
                onMouseEnter={() => {
                    this.setState({hover: true})
                }}
                onMouseLeave={() => {
                    this.setState({hover: false})
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    if (event.ctrlKey) {
                        this.props.handleSelect();
                    } else {
                        this.setState({open: !this.state.open});
                        this.props.node.open = !this.props.node.open;
                        this.props.update();
                    }
                }}
                className={"packageFolder" + (this.state.open ? " open" : "") +
                (this.props.node.elements.every(elem => ProjectSettings.selectedElements.includes(elem)) ? " selected" : "")}
                style={{
                    backgroundColor: this.props.node.scheme ? Schemes[this.props.node.scheme].color : "#FFF"
                }}>
                {(this.props.readOnly ? "📑" : "✏") + getLabelOrBlank(this.props.node.labels, this.props.projectLanguage)}
                {this.props.children}
            </div>
        );
    }
}
