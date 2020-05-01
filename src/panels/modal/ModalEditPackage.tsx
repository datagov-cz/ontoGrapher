import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import TableList from "../../components/TableList";
import {
    Languages,
    PackageRoot,
    ProjectElements,
    ProjectSettings,
    Schemes,
    StructuresShort,
    VocabularyElements
} from "../../config/Variables";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {PackageNode} from "../../datatypes/PackageNode";
// @ts-ignore
import {RIEInput} from "riek";
import {initLanguageObject} from "../../function/FunctionEditVars";

interface Props {
    modal: boolean;
    node: PackageNode;
    close: Function;
    projectLanguage: string;
    update: Function;
}

interface State {
    inputEdit: { [key: string]: string };
}

export default class ModalEditPackage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            inputEdit: initLanguageObject("")
        }
    }

    getFolder() {
        let result: JSX.Element[] = [];
        this.getFoldersDFS(result, PackageRoot, 0);
        return result;
    }

    getLink(node: PackageNode, depth: number) {
        if (node === this.props.node.parent) {
            return (<span className={"italic"}>{"-".repeat(depth) + node.labels[this.props.projectLanguage]}</span>)
        } else if (node === this.props.node) {
            return (<span>{"-".repeat(depth) + node.labels[this.props.projectLanguage]}</span>)
        } else if (node === PackageRoot) {
            return (<span>{LocaleMain.root}</span>)
        } else {
            return (<button className="buttonlink" onClick={() => {
                this.move(node);
            }}>{"-".repeat(depth) + node.labels[this.props.projectLanguage]}</button>)
        }
    }

    getFoldersDFS(arr: JSX.Element[], node: PackageNode, depth: number) {
        arr.push(<tr key={arr.length}>
            <td>
                {this.getLink(node, depth)}
            </td>
        </tr>);
        for (let subnode of node.children) {
            this.getFoldersDFS(arr, subnode, depth + 1);
        }
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
            if (ProjectSettings.selectedPackage === this.props.node) {
                ProjectSettings.selectedPackage = PackageRoot.children[0];
            }
            this.forceUpdate();
            this.props.update();
        }
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
        return (
            <Modal centered show={this.props.modal}>
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
                    {PackageRoot.children.length === 1 ? <div><p>{LocaleMenu.cannotMovePackage}</p></div> :
                        <div><h4>{LocaleMenu.movePackageTitle}</h4>
                            <p>{LocaleMenu.modalMovePackageDescription}</p>
                            <TableList headings={[LocaleMenu.package]}>
                                {this.getFolder()}
                            </TableList>
                        </div>}
                </Modal.Body>
                <Modal.Footer>
                    <p className={"red modal-warning"}>{LocaleMenu.saveWarning}</p>
                    <Button onClick={() => {
                        this.props.close();
                    }} variant="secondary">{LocaleMenu.cancel}</Button>
                    <Button onClick={() => {
                        this.props.node.labels = this.state.inputEdit;
                        if (this.props.node.scheme) {
                            let newkey = "";
                            for (let lang in this.state.inputEdit) {
                                if (this.state.inputEdit[lang].length > 0) {
                                    newkey = this.state.inputEdit[lang];
                                    break;
                                }
                            }
                            if (newkey === "") newkey = LocaleMain.untitled;
                            newkey = "https://slovník.gov.cz/" + StructuresShort[ProjectSettings.knowledgeStructure] + "/" + newkey;
                            if (newkey in Schemes) {
                                let count = 1;
                                while ((newkey + "-" + count.toString(10)) in Schemes) {
                                    count++;
                                }
                                newkey += "-" + count.toString(10);
                            }
                            for (let id in ProjectElements) {
                                if (VocabularyElements[ProjectElements[id].iri].inScheme === this.props.node.scheme) {
                                    VocabularyElements[ProjectElements[id].iri].inScheme = newkey;
                                }
                            }
                            if (newkey !== this.props.node.scheme) {
                                Schemes[newkey] = Schemes[this.props.node.scheme];
                                delete Schemes[this.props.node.scheme];
                            }
                            this.props.node.scheme = newkey;
                            Schemes[this.props.node.scheme].labels = this.state.inputEdit;
                        }
                        this.props.close();
                        this.props.update();
                    }}>{LocaleMenu.confirm}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}