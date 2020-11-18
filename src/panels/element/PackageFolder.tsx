import React from 'react';
import {PackageNode} from "../../datatypes/PackageNode";
import {ProjectElements, Schemes, VocabularyElements} from "../../config/Variables";
import {getLabelOrBlank} from "../../function/FunctionGetVars";

interface Props {
    node: PackageNode;
    update: Function;
    projectLanguage: string;
    openEditPackage: Function;
    openRemovePackage: Function;
    readOnly: boolean;
    showCheckbox: boolean;
    handleShowCheckbox: Function;
    checkboxChecked: boolean;
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

    movePackageItem(parse: any) {
        let id = parse.id;
		let oldpkg = ProjectElements[id].package;
        oldpkg.elements.splice(oldpkg.elements.indexOf(id), 1);
        ProjectElements[id].package = this.props.node;
        if (this.props.node.scheme) VocabularyElements[ProjectElements[id].iri].inScheme = this.props.node.scheme;
        this.props.node.elements.push(id);
        this.props.update();
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
                    if (event.shiftKey) {
                        event.stopPropagation();
                        this.props.handleShowCheckbox();
                    } else {
                        this.setState({open: !this.state.open});
                        this.props.node.open = !this.props.node.open;
                        this.props.update();
                    }
                }}
                className={"packageFolder" + (this.state.open ? " open" : "")}
                style={{
                    backgroundColor: this.props.node.scheme ? Schemes[this.props.node.scheme].color : "#FFF"
                }}>
                {(this.props.readOnly ? "📑" : "✏") + getLabelOrBlank(this.props.node.labels, this.props.projectLanguage)}
                {(this.state.hover || this.props.showCheckbox) && <span className="packageOptions right">
                    <input type="checkbox" checked={this.props.checkboxChecked}
                           onClick={(event) => event.stopPropagation()}
                           onChange={() => {
                           }}/>
                </span>}
                {this.state.open ?
                    this.props.children
                    : <span/>}
            </div>
        );
    }
}