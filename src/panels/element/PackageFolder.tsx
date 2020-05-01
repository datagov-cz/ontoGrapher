import React from 'react';
import {PackageNode} from "../../datatypes/PackageNode";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {PackageRoot, ProjectElements, ProjectSettings, VocabularyElements} from "../../config/Variables";
import {getLabelOrBlank} from "../../function/FunctionGetVars";
import {initLanguageObject} from "../../function/FunctionEditVars";

interface Props {
    node: PackageNode;
    depth: number;
    update: Function;
    projectLanguage: string;
    openEditPackage: Function;
    openRemovePackage: Function;
    readOnly: boolean;
}

interface State {
    open: boolean;
    hover: boolean;
}

const tooltipA = (
    <Tooltip id="tooltipS">{LocaleMain.addSubpackage}</Tooltip>
);
const tooltipE = (
    <Tooltip id="tooltipS">{LocaleMain.renamePackage}</Tooltip>
);
const tooltipD = (
    <Tooltip id="tooltipS">{LocaleMain.del}</Tooltip>
);
const tooltipDef = (
    <Tooltip id="tooltipS">{LocaleMain.setAsDefault}</Tooltip>
);

export default class PackageFolder extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
            hover: false
        }
    }

    movePackageItem(parse: any) {
        let id = parse.elem;
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
                onMouseOver={() => {
                    this.setState({hover: true})
                }}
                onMouseLeave={() => {
                    this.setState({hover: false})
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                }}
                onDrop={(event) => {
                    event.stopPropagation();
                    if (!this.props.readOnly) this.movePackageItem(JSON.parse(event.dataTransfer.getData("newClass")));
                }}
                onClick={() => {
                    this.setState({open: !this.state.open});
                    this.props.node.open = !this.props.node.open;
                    this.props.update();
                }}
                className={"packageFolder" + (this.state.open ? " open" : "") + (ProjectSettings.selectedPackage === this.props.node ? " defaultPackage" : "")}
                style={{marginLeft: (this.props.depth - 1) * 20 + "px"}}>
                {(this.props.readOnly ? "💃🏼" : "") + (this.props.depth === 1 ? "" : "↘") + "📁" + getLabelOrBlank(this.props.node.labels, this.props.projectLanguage)}
                <span className={"packageOptions right"} style={{display: this.state.hover ? "inline-block" : "none"}}>

                        {(this.props.readOnly || this.props.depth !== 1 || ProjectSettings.selectedPackage === this.props.node) ? "" :
                            <OverlayTrigger placement="bottom" overlay={tooltipDef}>
                                <button className={"buttonlink"} onClick={(event) => {
                                    event.stopPropagation();
                                    ProjectSettings.selectedPackage = this.props.node;
                                    this.props.update();
                                }}><span role="img" aria-label={""}>🔰</span></button>
                            </OverlayTrigger>}
                    {this.props.readOnly ? "" : <span>
                    <OverlayTrigger placement="bottom" overlay={tooltipA}>
                        <button className={"buttonlink"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    new PackageNode(initLanguageObject(LocaleMain.untitledPackage), this.props.node);
                                    this.props.node.open = true;
                                    this.setState({open: true});
                                    this.props.update();
                                }}>
                            <span role="img" aria-label={""}>➕</span>
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger placement="bottom" overlay={tooltipE}>
                        <button className={"buttonlink"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.props.openEditPackage();
                                }}>
                            <span role="img" aria-label={""}>✏</span></button></OverlayTrigger>
                        {(PackageRoot.children.length === 1) ? "" :
                            <OverlayTrigger placement="bottom" overlay={tooltipD}>
                                <button className={"buttonlink"}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            this.props.openRemovePackage();
                                        }}><span role="img"
                                                 aria-label={""}>❌</span></button>
                            </OverlayTrigger>}
                </span>}
                    </span>
                {this.state.open ?
                    this.props.children
                    : <span/>}
            </div>
        );
    }
}