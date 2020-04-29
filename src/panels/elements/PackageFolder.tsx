import React from 'react';
import {PackageNode} from "../../components/PackageNode";
import {Button, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../../locale/LocaleMain.json";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {Languages, PackageRoot, ProjectElements, ProjectSettings, Schemes, structuresShort} from "../../var/Variables";
import TableList from "../../components/TableList";
// @ts-ignore
import {RIEInput} from "riek";

interface Props {
    node: PackageNode;
    depth: number;
    update: Function;
    name: string;
    projectLanguage: string;
}

interface State {
    open: boolean;
    hover: boolean;
    modalEdit: boolean;
    modalRemove: boolean;
    inputEdit: { [key: string]: string };
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
            if (ProjectSettings.selectedPackage === this.props.node){
                ProjectSettings.selectedPackage = PackageRoot.children[0];
            }
            this.forceUpdate();
            this.props.update();
        }
    }

    getLink(node: PackageNode, depth: number) {
        if (node === this.props.node.parent) {
            return (<span className={"italic"}>{"-".repeat(depth) + node.name[this.props.projectLanguage]}</span>)
        } else if (node === this.props.node) {
            return (<span>{"-".repeat(depth) + node.name[this.props.projectLanguage]}</span>)
        } else {
            return (<button className="buttonlink" onClick={() => {
                this.move(node);
            }}>{"-".repeat(depth) + node.name[this.props.projectLanguage]}</button>)
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

    movePackageItem(parse: any) {
        let id = parse.elem;
        let oldpkg = ProjectElements[id].package;
        oldpkg.elements.splice(oldpkg.elements.indexOf(id), 1);
        ProjectElements[id].package = this.props.node;
		if (this.props.node.scheme) ProjectElements[id].scheme = this.props.node.scheme;
        this.props.node.elements.push(id);
        this.props.update();
    }

    handleChangeName(event: {
        textarea: string;
    }, language: string) {
        let name = this.state.inputEdit;
        name[language] = event.textarea;
        this.setState({inputEdit: name});
    }

    deleteName(language: string) {
        let name = this.state.inputEdit;
        name[language] = "";
        this.setState({inputEdit: name});
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
                onDragOver={(event) => {
                    event.preventDefault();
                }}
                onDrop={(event) => {
                    event.stopPropagation();
                    this.movePackageItem(JSON.parse(event.dataTransfer.getData("newClass")));
                }}
                onClick={() => {
                    if (!(this.state.modalEdit || this.state.modalRemove)) {
                        this.setState({open: !this.state.open});
                        this.props.node.open = !this.props.node.open;
                        this.props.update();
                    }
                }}
                className={"packageFolder" + (this.state.open ? " open" : "") + (ProjectSettings.selectedPackage === this.props.node ? " defaultPackage" : "")}
                style={{marginLeft: (this.props.depth - 1) * 20 + "px"}}>
                {(this.props.depth === 1 ? "" : "↘") + "📁" + this.props.name}
                <span className={"packageOptions right"} style={{display: this.state.hover ? "inline-block" : "none"}}>

                        {(this.props.depth !== 1 || ProjectSettings.selectedPackage === this.props.node) ? "" :
                            <OverlayTrigger placement="bottom" overlay={tooltipDef}>
                                <button className={"buttonlink"} onClick={(event) => {
                                    event.stopPropagation();
                                    ProjectSettings.selectedPackage = this.props.node;
                                    this.props.update();
                                }}><span role="img" aria-label={""}>🔰</span></button>
                            </OverlayTrigger>}

                    <OverlayTrigger placement="bottom" overlay={tooltipA}><button className={"buttonlink"}
                                                                                  onClick={(event) => {
                                                                                      event.stopPropagation();
                                                                                      this.props.node.children.push(new PackageNode(LocaleMain.untitledPackage, this.props.node));
                                                                                      this.props.node.open = true;
                                                                                      this.setState({open: true});
                                                                                      this.props.update();
                                                                                  }}><span role="img"
                                                                                           aria-label={""}>➕</span></button></OverlayTrigger>
                        <OverlayTrigger placement="bottom" overlay={tooltipE}><button className={"buttonlink"}
                                                                                      onClick={(event) => {
                                                                                          event.stopPropagation();
                                                                                          this.setState({modalEdit: true})
                                                                                      }}><span role="img"
                                                                                               aria-label={""}>✏</span></button></OverlayTrigger>
                    {(PackageRoot.children.length === 1) ? "" : <OverlayTrigger placement="bottom" overlay={tooltipD}>
                        <button className={"buttonlink"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.setState({modalRemove: true})
                                }}><span role="img"
                                         aria-label={""}>❌</span></button>
                    </OverlayTrigger>}
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
                        <h5>{LocaleMenu.namePackageTitle}</h5>
                        <TableList>
                            {Object.keys(Languages).map((language, i) => (
                                <tr key={i}>
                                    <td>
                                        <RIEInput
                                            className={"rieinput"}
                                            value={this.state.inputEdit[language].length > 0 ? this.state.inputEdit[language] : "<blank>"}
                                            change={(event: { textarea: string }) => {
                                                this.handleChangeName(event, language);
                                            }}
                                            propName="textarea"
                                        />
                                        &nbsp;
                                        <button className={"buttonlink"} onClick={() => this.deleteName(language)}>
                                            {LocaleMenu.deleteProjectName}</button>
                                    </td>
                                    <td>{Languages[language]}</td>
                                </tr>
                            ))}
                        </TableList>
                        <br/>
                        {PackageRoot.children.length === 1 ? <div><p>{LocaleMenu.cannotMovePackage}</p></div> : <div><h4>{LocaleMenu.movePackageTitle}</h4>
                            <p>{LocaleMenu.modalMovePackageDescription}</p>
                            <TableList headings={[LocaleMenu.package]}>
                                {this.getFolder()}
                            </TableList>
                        </div>}
                    </Modal.Body>
                    <Modal.Footer>
                        <p className={"red modal-warning"}>{LocaleMenu.saveWarning}</p>
                        <Button onClick={() => {
                            this.setState({modalEdit: false});
                        }} variant="secondary">{LocaleMenu.cancel}</Button>
                        <Button onClick={() => {
                            this.props.node.name = this.state.inputEdit;
                            if (this.props.node.scheme) {
                                let newkey = "";
                                for (let lang in this.state.inputEdit){
                                    if (this.state.inputEdit[lang].length > 0){
                                        newkey = this.state.inputEdit[lang];
                                        break;
                                    }
                                }
                                if (newkey === "") newkey = LocaleMain.untitled;
                                newkey = "https://slovník.gov.cz/" + structuresShort[ProjectSettings.knowledgeStructure] + "/" + newkey;
                                if (newkey in Schemes){
                                    let count = 1;
                                    while((newkey + "-" + count.toString(10)) in Schemes){
                                        count++;
                                    }
                                    newkey += "-" + count.toString(10);
                                }
                                for (let id in ProjectElements){
                                    if (ProjectElements[id].scheme === this.props.node.scheme){
                                        ProjectElements[id].scheme = newkey;
                                    }
                                }
                                if (newkey !== this.props.node.scheme){
                                    Schemes[newkey] = Schemes[this.props.node.scheme];
                                    delete Schemes[this.props.node.scheme];
                                }
                                this.props.node.scheme = newkey;
                                Schemes[this.props.node.scheme].labels = this.state.inputEdit;
                            }
                            this.setState({modalEdit: false});
                            this.props.update();
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
                                for (let id of this.props.node.elements) {
                                    ProjectElements[id].active = false;
                                }
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