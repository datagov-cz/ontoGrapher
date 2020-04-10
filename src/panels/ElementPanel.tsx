import React from 'react';
import {ResizableBox} from "react-resizable";
import {Form, InputGroup, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../locale/LocaleMain.json";
import Select from 'react-select';
import {
    Diagrams,
    Links,
    ModelElements,
    PackageRoot,
    ProjectElements,
    ProjectSettings,
    StereotypeCategories,
    Stereotypes,
    ViewSettings
} from "../var/Variables";
import StereotypeElementItem from "./elements/StereotypeElementItem";
import * as Helper from "./../misc/Helper";
import {PanelLinkItem} from "./elements/PanelLinkItem";
import PanelDiagramItem from "./elements/PanelDiagramItem";
import PackageFolder from "./elements/PackageFolder";
import {PackageNode} from "../components/PackageNode";
import PackageItem from "./elements/PackageItem";
import ModelFolder from "./elements/ModelFolder";

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
        <div>⬜</div>
    </OverlayTrigger>
);
const tooltipR = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.relationships}</Tooltip>}>
        <div>➡</div>
    </OverlayTrigger>
);
const tooltipPM = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.packageModel}</Tooltip>}>
        <div>📦</div>
    </OverlayTrigger>
);
const tooltipM = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.models}</Tooltip>}>
        <div>💃🏼</div>
    </OverlayTrigger>
);
const tooltipD = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.diagram}</Tooltip>}>
        <div>🖼️</div>
    </OverlayTrigger>
);

export default class ElementPanel extends React.Component<Props, State>{

    private stereotypeCategories: {}[];
    // private modelCategories: {}[];
    // private packageCategories: {}[];
    private stereotypes: string[];
    private links: string[];
    private models: {[key: string]: any};
    private modelFolders: boolean[];
    private modelRoot : boolean;
    // private packageElems: string[];

    constructor(props: Props) {
        super(props);

        this.state = {
            filter: [],
            search: ""
        };
        this.stereotypeCategories = [];
        this.links = Object.keys(Links);
        this.stereotypes = Object.keys(Stereotypes);
        // this.modelCategories = [];
        // this.packageCategories = [];
        this.modelFolders = [];
        this.modelRoot = true;
        this.models = {};
        // this.packageElems = [];
        this.prepareCategories();
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleGetInfo = this.handleGetInfo.bind(this);
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
                    //Stereotypes[stereotype].suffix.startsWith(this.state.search) ||
                    Stereotypes[stereotype].labels[this.props.projectLanguage].startsWith(search)
                )) {
                result1.push(stereotype);
            }
        }
        let result2 = [];
        for (let link in Links) {
            if ((filter.includes(Links[link].category) || filter.length === 0)
                && (
                    //Stereotypes[stereotype].suffix.startsWith(this.state.search) ||
                    Links[link].labels[this.props.projectLanguage].startsWith(search)
                )) {
                result2.push(link);
            }
        }
        this.stereotypes = result1;
        this.links = result2;
    }

    //TODO: unfinished function
    handleGetInfo(element: string) {
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

    prepareCategories() {
        let result = [];
        for (let category of StereotypeCategories) {
            result.push({
                value: category,
                label: category
            });
        }
        this.stereotypeCategories = result;
    }

    getNameStereotype(element: string) {
        if (ViewSettings.display == 1) {
            return Helper.getNameOfStereotype(element);
        } else {
            return Stereotypes[element].labels[this.props.projectLanguage];
        }
    }

    getNameModel(element: string) {
        if (ViewSettings.display == 1) {
            return Helper.getNameOfStereotype(element);
        } else {
            return ModelElements[element].labels[this.props.projectLanguage];
        }
    }

    getNameLink(element: string) {
        if (ViewSettings.display == 1) {
            return Helper.getNameOfLink(element);
        } else {
            return Links[element].labels[this.props.projectLanguage];
        }
    }

    update() {
        this.stereotypes = Object.keys(Stereotypes);
        this.links = Object.keys(Links);
        //this.models = Object.keys(ModelElements);
        let mods: {[key:string]: any} = {};
        for (let key of Object.keys(ModelElements)){
            if (!(ModelElements[key].category in mods)){
                mods[ModelElements[key].category] = [];
            }
            mods[ModelElements[key].category].push(key);
            this.modelFolders.push(false);
        }
        this.models = mods;
        this.prepareCategories();
        this.forceUpdate();
    }

    getFoldersDFS(arr: JSX.Element[], node: PackageNode, depth: number) {
        if (node !== PackageRoot) {
            arr.push(<PackageFolder node={node} depth={depth} update={() => {
                this.forceUpdate();
            }}>
                {node.elements.map((id) => <PackageItem label={ProjectElements[id].names[this.props.projectLanguage]}
                                                        depth={depth} id={id} update={() => {
                    this.forceUpdate();
                }}/>)}
            </PackageFolder>);
        } else {
            {
                node.elements.map((id) => {
                    if (ProjectElements[id].active) arr.push(<PackageItem
                        label={ProjectElements[id].names[this.props.projectLanguage] === "" ? "<untitled>" : ProjectElements[id].names[this.props.projectLanguage]} depth={depth} id={id}
                        update={() => {
                            this.forceUpdate();
                        }}/>)
                })
            }
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
        if (this.modelRoot){
            Object.keys(this.models).forEach((key, i) => {
                let contents = this.models[key].map((iri: string)=><StereotypeElementItem
                    key={iri}
                    label={this.getNameModel(iri)}
                    element={iri}
                    category={key}
                    onMouseOver={()=>{}}
                    package={false}/>);
                result.push(<ModelFolder category={key} key={key} depth={0} update={()=>{this.forceUpdate();}} open={()=>{this.modelFolders[i] = !this.modelFolders[i]; this.forceUpdate();}}>
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
                    <InputGroup.Text id="inputGroupPrepend">🔎</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    type="text"
                    placeholder={LocaleMain.searchStereotypes}
                    aria-describedby="inputGroupPrepend"
                    value={this.state.search}
                    onChange={this.handleChangeSearch}
                />
            </InputGroup>
            <Select
                isMulti
                closeMenuOnSelect={false}
                options={this.stereotypeCategories}
                onChange={this.handleChangeSelect}
                placeholder={LocaleMain.filter}
            />
            <Tabs id="stereotypePanelTabs">
                <Tab eventKey={1} title={tooltipS}>
                    <div className={"elementList"}>
                        {this.stereotypes.map((element) => (<StereotypeElementItem
                            key={element}
                            element={element}
                            label={this.getNameStereotype(element)}
                            category={Stereotypes[element].category}
                            onMouseOver={() => {
                                this.handleGetInfo(element);
                            }}
                            definition={Stereotypes[element].skos.definition[this.props.projectLanguage]}
                            package={true}/>))}
                    </div>
                </Tab>
                <Tab eventKey={2} title={tooltipR}>
                    <div className="elementList">
                        {this.links.map((link) => <PanelLinkItem
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
                        <a href="#" className={"margins"} onClick={() => {
                            PackageRoot.children.push(new PackageNode(LocaleMain.untitledPackage, PackageRoot));
                            this.forceUpdate();
                        }
                        }>{LocaleMain.addNewPackage}</a>
                        <div className="elementLinkList"
                             onDragOver={(event)=>{event.preventDefault();}}
                             onDrop={(event) => {
                            let parse = JSON.parse(event.dataTransfer.getData("newClass"));
                            let id = parse.elem;
                            if (id in ModelElements) return;
                            let oldpkg = ProjectElements[id].package;
                            oldpkg.elements.splice(oldpkg.elements.indexOf(id), 1);
                            ProjectElements[id].package = PackageRoot;
                            PackageRoot.elements.push(id);
                            this.forceUpdate();
                        }}>
                            {this.getModelFolders()}
                            {this.getFolders()}
                        </div>
                </Tab>
                {/*<Tab eventKey={4} title={tooltipM}>*/}
                {/*    <div className="elementList">*/}
                {/*        {this.models.map((element) => (<StereotypeElementItem*/}
                {/*            key={element}*/}
                {/*            element={element}*/}
                {/*            label={this.getNameModel(element)}*/}
                {/*            category={ModelElements[element].category}*/}
                {/*            onMouseOver={() => {*/}
                {/*                this.handleGetInfo(element);*/}
                {/*            }}*/}
                {/*            package={false}*/}
                {/*        />))}*/}
                {/*    </div>*/}
                {/*</Tab>*/}
                <Tab eventKey={4} title={tooltipD}>
                    <a href="#" className={"margins"} onClick={() => {
                        Diagrams.push({name: LocaleMain.untitled, json: {}});
                        for (let key of Object.keys(ProjectElements)){
                            ProjectElements[key].hidden[Diagrams.length-1] = false;
                        }
                        this.forceUpdate();
                    }
                    }>{LocaleMain.addDiagram}</a>
                    <div className="elementLinkList">
                        {Diagrams.map((model, i) => <PanelDiagramItem
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