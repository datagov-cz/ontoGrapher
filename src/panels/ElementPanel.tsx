import React from 'react';
import {ResizableBox} from "react-resizable";
import {Form, InputGroup, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../locale/LocaleMain.json";
import {
    Diagrams,
    Links,
    ModelElements,
    PackageRoot,
    ProjectElements,
    ProjectSettings,
    Schemes,
    Stereotypes,
    ViewSettings
} from "../config/Variables";
import ElementItem from "./element/ElementItem";
import * as Helper from "../function/FunctionEditVars";
import {LinkItem} from "./element/LinkItem";
import DiagramItem from "./element/DiagramItem";
import PackageFolder from "./element/PackageFolder";
import {PackageNode} from "../datatypes/PackageNode";
import PackageItem from "./element/PackageItem";
import ModelFolder from "./element/ModelFolder";
import {createNewScheme} from "../function/FunctionCreateVars";

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

    //private stereotypeCategories: {}[];
    private stereotypes: string[];
    private links: string[];
    private models: { [key: string]: any };
    private modelFolders: boolean[];
    private modelRoot: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            filter: [],
            search: ""
        };
        //this.stereotypeCategories = [];
        this.links = Object.keys(Links);
        this.stereotypes = Object.keys(Stereotypes);
        this.modelFolders = [];
        this.modelRoot = true;
        this.models = {};
        //this.prepareCategories();
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
            if ((filter.includes(Stereotypes[stereotype].category) || filter.length === 0)
                && (
                    Stereotypes[stereotype].labels[this.props.projectLanguage].startsWith(search)
                )) {
                result1.push(stereotype);
            }
        }
        let result2 = [];
        for (let link in Links) {
            if ((filter.includes(Links[link].category) || filter.length === 0)
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

    // prepareCategories() {
    //     let result = [];
    //     for (let category of StereotypeCategories) {
    //         result.push({
    //             value: category,
    //             label: category
    //         });
    //     }
    //     this.stereotypeCategories = result;
    // }

    getNameStereotype(element: string) {
        if (ViewSettings.display === 1) {
            return Helper.getNameOfStereotype(element);
        } else {
            return Stereotypes[element].labels[this.props.projectLanguage];
        }
    }

    getNameModel(element: string) {
        if (ViewSettings.display === 1) {
            return Helper.getNameOfStereotype(element);
        } else {
            return ModelElements[element].labels[this.props.projectLanguage];
        }
    }

    getNameLink(element: string) {
        if (ViewSettings.display === 1) {
            return Helper.getNameOfLink(element);
        } else {
            return Links[element].labels[this.props.projectLanguage];
        }
    }

    update() {
        this.stereotypes = Object.keys(Stereotypes);
        this.links = Object.keys(Links);
        //this.models = Object.keys(ModelElements);
        let mods: { [key: string]: any } = {};
        for (let key of Object.keys(ModelElements)) {
            if (!(ModelElements[key].category in mods)) {
                mods[ModelElements[key].category] = [];
            }
            mods[ModelElements[key].category].push(key);
            this.modelFolders.push(false);
        }
        this.models = mods;
        //this.prepareCategories();
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
                                                        label={ProjectElements[id].names[this.props.projectLanguage]}
                                                        depth={depth} id={id} update={() => {
                    this.forceUpdate();
                }}/>)}
            </PackageFolder>);
        } else {

            node.elements.forEach((id) => {
                if (ProjectElements[id].active) arr.push(<PackageItem
                    label={ProjectElements[id].names[this.props.projectLanguage] === "" ? "<untitled>" : ProjectElements[id].names[this.props.projectLanguage]}
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
        //result.push(<ModelFolder category={LocaleMain.models} depth={0} open={()=>{this.modelRoot = !this.modelRoot; this.forceUpdate();}} update={()=>{this.forceUpdate();}}/>);
        if (this.modelRoot) {
            Object.keys(this.models).forEach((key, i) => {
                let contents = this.models[key].map((iri: string) => <ElementItem
                    key={iri}
                    label={this.getNameModel(iri)}
                    element={iri}
                    package={false}/>);
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
                {/*<Select*/}
                {/*    isMulti*/}
                {/*    closeMenuOnSelect={false}*/}
                {/*    options={this.stereotypeCategories}*/}
                {/*    onChange={this.handleChangeSelect}*/}
                {/*    placeholder={LocaleMain.filter}*/}
                {/*/>*/}
                <Tabs id="stereotypePanelTabs">
                    <Tab eventKey={1} title={tooltipS}>
                        <div className={"elementList"}>
                            {this.stereotypes.map((element) => (<ElementItem
                                key={element}
                                element={element}
                                label={this.getNameStereotype(element)}
                                category={Stereotypes[element].category}
                                definition={Stereotypes[element].skos.definition[this.props.projectLanguage]}
                                package={true}/>))}
                        </div>
                    </Tab>
                    <Tab eventKey={2} title={tooltipR}>
                        <div className="elementList">
                            {this.links.map((link) => <LinkItem
                                    key={link}
                                    selectedLink={this.props.selectedLink}
                                    handleChangeSelectedLink={this.handleChangeSelectedLink}
                                    linkType={link}
                                    category={Links[link].category}
                                    definition={Links[link].skos.definition[this.props.projectLanguage]}
                                    label={this.getNameLink(link)}
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