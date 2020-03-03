import React from 'react';
import {Resizable, ResizableBox} from "react-resizable";
import {InputGroup, Form, Tabs, Tooltip, OverlayTrigger, Tab, Button} from "react-bootstrap";
import * as LocaleMain from "../locale/LocaleMain.json";
import Select from 'react-select';
import {Diagrams, Links, StereotypeCategories, Stereotypes, ViewSettings} from "../var/Variables";
import StereotypeElementItem from "./elements/StereotypeElementItem";
import * as Helper from "./../misc/Helper";
import {PanelLinkItem} from "./elements/PanelLinkItem";
import PanelDiagramItem from "./elements/PanelDiagramItem";

interface Props{
    projectLanguage: string;
    handleChangeSelectedLink: Function;
    selectedLink: string;
    handleChangeSelectedModel: Function;
    selectedModel: string;
}

interface State {
    filter: string[];
    search: string;
}

const tooltipS = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.classes}</Tooltip>}><div>⬜</div></OverlayTrigger>
);
const tooltipR = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.relationships}</Tooltip>}><div>➡</div></OverlayTrigger>
);
const tooltipPM = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.packageModel}</Tooltip>}><div>📦</div></OverlayTrigger>
);
const tooltipD = (
    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltipS">{LocaleMain.diagram}</Tooltip>}><div>🖼️</div></OverlayTrigger>
);

export default class ElementPanel extends React.Component<Props, State>{

    private categories: {}[];
    private stereotypes: string[];
    private links: string[];

    constructor(props: Props) {
        super(props);

        this.state = {
            filter: [],
            search: ""
        };
        this.categories = [];
        this.links = Object.keys(Links);
        this.stereotypes = Object.keys(Stereotypes);
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

    search(search: string, filter: string[]){
        let result1 = [];
        for (let stereotype in Stereotypes){
            if ((filter.includes(Stereotypes[stereotype].category) || filter.length === 0)
                    && (
                        //Stereotypes[stereotype].suffix.startsWith(this.state.search) ||
                    Stereotypes[stereotype].labels[this.props.projectLanguage].startsWith(search)
                )){
                result1.push(stereotype);
            }
        }
        let result2 = [];
        for (let link in Links){
            if ((filter.includes(Links[link].category) || filter.length === 0)
                && (
                    //Stereotypes[stereotype].suffix.startsWith(this.state.search) ||
                    Links[link].labels[this.props.projectLanguage].startsWith(search)
                )){
                result2.push(link);
            }
        }
        this.stereotypes = result1;
        this.links = result2;
    }

    //TODO: unfinished function
    handleGetInfo(element: string){
    }

    handleChangeSelectedModel(model: string){
        this.props.handleChangeSelectedModel(model);
    }

    handleChangeSelect(event: any){
        let result = [];
        if (Array.isArray(event)){
            for (let e of event){
                result.push(e.value);
            }
        }
        this.setState({filter: result});
        this.search(this.state.search, result);
        this.forceUpdate();
    }

    handleChangeSearch(event: React.FormEvent<HTMLInputElement>){
        this.setState({search: event.currentTarget.value});
        this.search(event.currentTarget.value, this.state.filter);
        this.forceUpdate();
    }

    prepareCategories(){
        let result = [];
        for (let category of StereotypeCategories){
            result.push({
                value: category,
                label: category
            });
        }
        this.categories = result;
    }

    getNameStereotype(element: string){
        if (ViewSettings.display == 1){
            return Helper.getNameOfStereotype(element);
        } else {
            return Stereotypes[element].labels[this.props.projectLanguage];
        }
    }

    getNameLink(element: string){
        if (ViewSettings.display == 1){
            return Helper.getNameOfLink(element);
        } else {
            return Links[element].labels[this.props.projectLanguage];
        }
    }

    update(){
        this.stereotypes = Object.keys(Stereotypes);
        this.prepareCategories();
        this.links = Object.keys(Links);
    }

    render(){
        return(<ResizableBox
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
                    options={this.categories}
                    onChange={this.handleChangeSelect}
                    placeholder={LocaleMain.filter}
                />
                <Tabs id="stereotypePanelTabs">
                    <Tab eventKey={1} title={tooltipS}>
                        <div className={"elementList"}>
                            {this.stereotypes.map((element)=>(<StereotypeElementItem
                                key={element}
                                element={element}
                                label={this.getNameStereotype(element)}
                                category={Stereotypes[element].category}
                                onMouseOver={() => {this.handleGetInfo(element);}}
                            />))}
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
                                            label={this.getNameLink(link)}
                                />
                            )}
                        </div>
                    </Tab>
                    <Tab eventKey={3} title={tooltipPM}>
                        <div className="elementList">
                            {/*selectedPkg*/}
                        </div>
                    </Tab>
                    <Tab eventKey={4} title={tooltipD}>
                        <div className="elementList">
                            {Object.keys(Diagrams).map((model) => <PanelDiagramItem
                                key={model}
                                selectedLink={this.props.selectedModel}
                                handleChangeSelectedLink={this.handleChangeSelectedModel}
                                linkType={model}
                                />)}
                        </div>
                    </Tab>
                </Tabs>

                {/*<div className={"elementDescription"}>*/}
                {/*    desc*/}
                {/*</div>*/}
        </ResizableBox>);
    }
}