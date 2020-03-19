import React from 'react';
import {PackageNode} from "../../components/PackageNode";
import {Button, Form, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../../locale/LocaleMain.json";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {PackageRoot, ProjectElements} from "../../var/Variables";
import TableList from "../../components/TableList";

interface Props {
    node: PackageNode;
    depth: number;
    update: Function;
}

interface State {
    open: boolean;
    hover: boolean;
    modalEdit: boolean;
    modalRemove: boolean;
    inputEdit: string;
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
const tooltipU = (
    <Tooltip id="tooltipS">{LocaleMain.moveUp}</Tooltip>
);
const tooltipB = (
    <Tooltip id="tooltipS">{LocaleMain.moveDown}</Tooltip>
);

export default class PackageFolder extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
            hover: false,
            modalEdit: false,
            modalRemove: false,
            inputEdit: this.props.node.name
        }
    }

    getFolder() {
        let result: JSX.Element[] = [];
        this.getFoldersDFS(result, PackageRoot, 0);
        return result;
    }

    move(node: PackageNode) {
        let parent = this.props.node.parent;
        if (parent) {
            this.props.node.children.forEach((sub) => {
                if (parent) parent.children.push(sub);
            });
            parent.children.splice(parent.children.indexOf(this.props.node), 1);
            this.props.node.parent = node;
            node.children.push(this.props.node);
            this.forceUpdate();
            this.props.update();
        }
    }

    getLink(node: PackageNode, depth: number) {
        if (node === this.props.node.parent) {
            return (<span className={"italic"}>{"-".repeat(depth) + node.name}</span>)
        } else if (node === this.props.node) {
            return (<span>{"-".repeat(depth) + node.name}</span>)
        } else {
            return (<a href="#" onClick={() => {
                this.move(node);
            }}>{"-".repeat(depth) + node.name}</a>)
        }
    }

    getFoldersDFS(arr: JSX.Element[], node: PackageNode, depth: number) {
        arr.push(<tr>
            <td>
                {this.getLink(node, depth)}
            </td>
        </tr>);
        for (let subnode of node.children) {
            this.getFoldersDFS(arr, subnode, depth + 1);
        }
    }

    movePackageItem(parse: any){
        let id = parse.elem;
        let oldpkg = ProjectElements[id].package;
        oldpkg.elements.splice(oldpkg.elements.indexOf(id),1);
        ProjectElements[id].package = this.props.node;
        this.props.node.elements.push(id);
        this.props.update();
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
                onDragOver={(event)=>{event.preventDefault();}}
                onDrop={(event)=>{event.stopPropagation(); this.movePackageItem(JSON.parse(event.dataTransfer.getData("newClass")));}}
                onClick={() => {
                    if (!(this.state.modalEdit || this.state.modalRemove)) {
                        this.setState({open: !this.state.open});
                        this.props.node.open = !this.props.node.open;
                        this.props.update();
                    }
                }}
                className={"packageFolder" + (this.state.open ? " open" : "")}
                style={{marginLeft: (this.props.depth - 1) * 10 + "px"}}>
                {(this.props.depth === 1 ? "💃🏼" : "↘") +"📁 " + this.props.node.name}
                <span className={"packageOptions right"} style={{display: this.state.hover ? "inline-block" : "none"}}>
                        <OverlayTrigger placement="bottom" overlay={tooltipA}><a onClick={(event) => {
                            event.stopPropagation();
                            this.props.node.children.push(new PackageNode(LocaleMain.untitledPackage, this.props.node));
                            this.props.update();
                        }} href="#">➕</a></OverlayTrigger>
                        <OverlayTrigger placement="bottom" overlay={tooltipE}><a onClick={(event) => {
                            event.stopPropagation();
                            this.setState({modalEdit: true})
                        }} href="#">✏</a></OverlayTrigger>
                        <OverlayTrigger placement="bottom" overlay={tooltipD}><a onClick={(event) => {
                            event.stopPropagation();
                            this.setState({modalRemove: true})
                        }} href="#">❌</a></OverlayTrigger>
                    </span>
                {this.state.open ?
                    this.props.children
                    : <span></span>}
            </div>
            <div>
                <Modal centered show={this.state.modalEdit}>
                    <Modal.Header>
                        <Modal.Title>{LocaleMenu.modalEditPackageTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>{LocaleMenu.namePackageTitle}</h4>
                        <Form>
                            <Form.Control onChange={(event: { currentTarget: { value: any; }; }) => {
                                this.setState({inputEdit: event.currentTarget.value})
                            }} type="text" value={this.state.inputEdit}
                                          placeholder={LocaleMain.modalEditPackagePlaceholder}
                                          required/>
                        </Form>
                        <br/>
                        <h4>{LocaleMenu.movePackageTitle}</h4>
                        <p>{LocaleMenu.modalMovePackageDescription}</p>
                        <TableList headings={[LocaleMenu.package]}>
                            {this.getFolder()}
                        </TableList>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => {
                            this.setState({modalEdit: false});
                        }} variant="secondary">{LocaleMenu.cancel}</Button>
                        <Button onClick={() => {
                            this.props.node.name = this.state.inputEdit;
                            this.setState({modalEdit: false});
                        }}>{LocaleMenu.confirm}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal centered show={this.state.modalRemove}>
                    <Modal.Header>
                        <Modal.Title>{LocaleMenu.modalRemovePackageTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{LocaleMenu.modalRemovePackageDescription}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => {
                            this.setState({modalRemove: false});
                        }} variant="secondary">{LocaleMenu.cancel}</Button>
                        <Button onClick={() => {
                            if (this.props.node.parent) {
                                this.props.node.parent.children.splice(this.props.node.parent.children.indexOf(this.props.node), 1);
                                this.setState({modalRemove: false});
                                this.props.update();
                            }

                        }}>{LocaleMenu.confirm}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>);
    }
}