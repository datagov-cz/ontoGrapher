import React from 'react';
import {ResizableBox} from "react-resizable";
import {Form, InputGroup, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../locale/LocaleMain.json";
import {
    Diagrams,
    Links,
    PackageRoot,
    ProjectElements,
    ProjectSettings,
    Schemes,
    Stereotypes,
    VocabularyElements
} from "../config/Variables";
import ElementItem from "./element/ElementItem";
import {LinkItem} from "./element/LinkItem";
import DiagramItem from "./element/DiagramItem";
import PackageFolder from "./element/PackageFolder";
import {PackageNode} from "../datatypes/PackageNode";
import PackageItem from "./element/PackageItem";
import ModelFolder from "./element/ModelFolder";
import {createNewScheme} from "../function/FunctionCreateVars";
import {getLabelOrBlank} from "../function/FunctionGetVars";

interface Props {
    projectLanguage: string;
    handleChangeSelectedLink: Function;
    selectedLink: string;
}

interface State {
    filter: string[];
    search: string;
}

const tooltipS = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.classes}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.classes}>⬜</span></div>
    </OverlayTrigger>
);
const tooltipR = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.relationships}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.relationships}>➡</span></div>
    </OverlayTrigger>
);
const tooltipPM = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.packageModel}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.packageModel}>📦</span></div>
    </OverlayTrigger>
);
const tooltipD = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.diagram}</Tooltip>}>
        <div><span role="img" aria-label={LocaleMain.diagram}>🖼️</span></div>
    </OverlayTrigger>
);

export default class ElementPanel extends React.Component<Props, State> {

    private stereotypes: string[];
    private links: string[];
    private models: { [key: string]: any };
    private readonly modelFolders: boolean[];
    private readonly modelRoot: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            filter: [],
            search: ""
        };
        this.links = Object.keys(Links);
        this.stereotypes = Object.keys(Stereotypes);
        this.modelFolders = [];
        this.modelRoot = true;
        this.models = {};
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.search = this.search.bind(this);
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
    }

    handleChangeSelectedLink(linkType: string) {
        this.props.handleChangeSelectedLink(linkType);
    }

    search(search: string, filter: string[]) {
        let result1 = [];
        for (let stereotype in Stereotypes) {
            if ((filter.includes(Stereotypes[stereotype].inScheme) || filter.length === 0)
                && (
                    Stereotypes[stereotype].labels[this.props.projectLanguage].startsWith(search)
                )) {
                result1.push(stereotype);
            }
        }
        let result2 = [];
        for (let link in Links) {
            if ((filter.includes(Links[link].inScheme) || filter.length === 0)
                && (
                    Links[link].labels[this.props.projectLanguage].startsWith(search)
                )) {
                result2.push(link);
            }
        }
        this.stereotypes = result1;
        this.links = result2;
    }

    handleChangeSelect(event: any) {
        let result = [];
        if (Array.isArray(event)) {
            for (let e of event) {
                result.push(e.value);
            }
        }
        this.setState({filter: result});
        this.search(this.state.search, result);
        this.forceUpdate();
    }

    handleChangeSearch(event: React.FormEvent<HTMLInputElement>) {
        this.setState({search: event.currentTarget.value});
        this.search(event.currentTarget.value, this.state.filter);
        this.forceUpdate();
    }

    getNameStereotype(element: string) {
        return Stereotypes[element].labels[this.props.projectLanguage];
    }

    getNameLink(element: string) {
        return Links[element].labels[this.props.projectLanguage];
    }

    update() {
        this.stereotypes = Object.keys(Stereotypes);
        this.links = Object.keys(Links);
        this.models = {};
        this.forceUpdate();
    }

    getFoldersDFS(arr: JSX.Element[], node: PackageNode, depth: number) {
        if (node !== PackageRoot) {
            arr.push(<PackageFolder key={node.scheme} projectLanguage={this.props.projectLanguage}
                                    name={node.labels[this.props.projectLanguage]} node={node} depth={depth}
                                    update={() => {
                                        this.forceUpdate();
                                    }}>
                {node.elements.map((id) => <PackageItem key={id}
                                                        label={getLabelOrBlank(VocabularyElements[ProjectElements[id].iri], this.props.projectLanguage)}
                                                        depth={depth} id={id} update={() => {
                    this.forceUpdate();
                }}/>)}
            </PackageFolder>);
        } else {

            node.elements.forEach((id) => {
                arr.push(<PackageItem
                    label={getLabelOrBlank(ProjectElements[id], this.props.projectLanguage)}
                    depth={depth} id={id}
                    update={() => {
                        this.forceUpdate();
                    }}/>)
            })

        }
        if (node.open) {
            for (let subnode of node.children) {
                this.getFoldersDFS(arr, subnode, depth + 1);
            }
        }
    }

    getFolders() {
        let result: JSX.Element[] = [];
        this.getFoldersDFS(result, PackageRoot, 0);
        return result;
    }

    getModelFolders() {
        let result: JSX.Element[] = [];
        if (this.modelRoot) {
            Object.keys(this.models).forEach((key, i) => {
                let contents = this.models[key].map((iri: string) => <ElementItem
                    key={iri}
                    iri={iri}
                    label={VocabularyElements[iri].labels[this.props.projectLanguage]}
                />);
                result.push(<ModelFolder category={Schemes[key].labels[this.props.projectLanguage]} key={key} depth={0}
                                         update={() => {
                                             this.forceUpdate();
                                         }} open={() => {
                    this.modelFolders[i] = !this.modelFolders[i];
                    this.forceUpdate();
                }}>
                    {contents}
                </ModelFolder>)
            });
        }
        return result;
    }

    render() {
        return (<ResizableBox
                className={"elements"}
                width={300}
                height={1000}
                axis={"x"}
                handleSize={[8, 8]}
                resizeHandles={['ne']}
            >

                <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroupPrepend"><span role="img"
                                                                      aria-label={LocaleMain.searchStereotypes}>🔎</span></InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        type="text"
                        placeholder={LocaleMain.searchStereotypes}
                        aria-describedby="inputGroupPrepend"
                        value={this.state.search}
                        onChange={this.handleChangeSearch}
                    />
                </InputGroup>
                <Tabs id="stereotypePanelTabs">
                    <Tab eventKey={1} title={tooltipS}>
                        <div className={"elementList"}>
                            {this.stereotypes.map((element) => (
                                <ElementItem
                                    key={element}
                                    iri={element}
                                    definition={Stereotypes[element].definitions[this.props.projectLanguage]}
                                    label={Stereotypes[element].labels[this.props.projectLanguage]}
                                    scheme={Schemes[Stereotypes[element].inScheme].labels[this.props.projectLanguage]}
                                />))}
                        </div>
                    </Tab>
                    <Tab eventKey={2} title={tooltipR}>
                        <div className="elementList">
                            {this.links.map((link) => <LinkItem
                                key={link}
                                selectedLink={this.props.selectedLink}
                                handleChangeSelectedLink={this.handleChangeSelectedLink}
                                linkType={link}
                                scheme={Schemes[Links[link].inScheme].labels[this.props.projectLanguage]}
                                definition={Links[link].definitions[this.props.projectLanguage]}
                                label={Links[link].labels[this.props.projectLanguage]}
                                />
                            )}
                        </div>
                    </Tab>
                    <Tab eventKey={3} title={tooltipPM}>
                        <button className={"margins"} onClick={() => {
                            let scheme = createNewScheme();
                            PackageRoot.children.push(new PackageNode(LocaleMain.untitledPackage, PackageRoot, true, scheme));
                            this.forceUpdate();
                        }
                        }>{LocaleMain.addNewPackage}</button>
                        <div className="elementLinkList">
                            {this.getModelFolders()}
                            {this.getFolders()}
                        </div>
                    </Tab>
                    <Tab eventKey={4} title={tooltipD}>
                        <button className={"margins"} onClick={() => {
                            Diagrams.push({name: LocaleMain.untitled, json: {}});
                            for (let key of Object.keys(ProjectElements)) {
                                ProjectElements[key].hidden[Diagrams.length - 1] = false;
                            }
                            this.forceUpdate();
                        }
                        }>{LocaleMain.addDiagram}</button>
                        <div className="elementLinkList">
                            {Diagrams.map((model, i) => <DiagramItem
                                    key={i}
                                    diagram={i}
                                    selectedDiagram={ProjectSettings.selectedDiagram}
                                    update={() => {
                                        this.forceUpdate();
                                    }}
                                />
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </ResizableBox>
        );
    }
}