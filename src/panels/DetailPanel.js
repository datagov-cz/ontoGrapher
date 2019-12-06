import React from 'react';
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {Locale} from "../config/locale/Locale";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import {AttributeObject} from "../components/misc/AttributeObject";
import {Button, Form, FormControl, FormGroup} from "react-bootstrap";
import {AttributeTypePool, CardinalityPool, GeneralizationPool, LinkEndPool, LinkPool} from "../config/Variables";
import Table from "react-bootstrap/es/Table";
import Tabs from "react-bootstrap/lib/Tabs";
import Tab from "react-bootstrap/lib/Tab";
import {Attribute} from "../components/misc/Attribute";

export class DetailPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formName: "",
            newAttrName: "",
            newAttrName2: "",
            newAttrType2: 0,
            newAttrType: 0,
            attribute: 0,
            linkType: "",
            newLabel: "",
            notes: "",
            attrs: "",
            stereotype: "",
            nodeStart: "",
            nodeEnd: "",
            // generalizationName: "",
            // generalization: "",
            // isGeneralizationMenuAvailable: false,
            // derivation: "",
            links: {}
        };

        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeAttributeType = this.handleChangeAttributeType.bind(this);
        this.handleChangeAttributeType2 = this.handleChangeAttributeType2.bind(this);
        this.handleChangeAttribute = this.handleChangeAttribute.bind(this);
        this.processDialogue = this.processDialogue.bind(this);
        this.addAttribute = this.addAttribute.bind(this);
        this.saveAttribute = this.saveAttribute.bind(this);
        this.deleteAttribute = this.deleteAttribute.bind(this);
        this.handleChangeAttributeName = this.handleChangeAttributeName.bind(this);
        this.handleChangeAttributeName2 = this.handleChangeAttributeName2.bind(this);
        this.handleChangeFirstCardinality = this.handleChangeFirstCardinality.bind(this);
        this.handleChangeSecondCardinality = this.handleChangeSecondCardinality.bind(this);
        this.focus = this.focus.bind(this);
        this.handleChangeLabel = this.handleChangeLabel.bind(this);
        this.saveLabel = this.saveLabel.bind(this);
        this.saveNotes = this.saveNotes.bind(this);
        this.handleChangeNotes = this.handleChangeNotes.bind(this);
        // this.handleChangeGeneralization = this.handleChangeGeneralization.bind(this);
        // this.addGeneralization = this.addGeneralization.bind(this);
        // this.deleteGeneralization = this.deleteGeneralization.bind(this);
        // this.handleChangeGeneralizationName = this.handleChangeGeneralizationName.bind(this);
        // this.handleChangeDerivation = this.handleChangeDerivation.bind(this);
    }
    //
    // handleChangeDerivation(event){
    //     this.setState({derivation: event.target.value});
    //         if (event.target.value === ""){
    //             this.props.panelObject.derivation = "";
    //         } else {
    //             this.props.panelObject.derivation = this.props.panelObject.model.getLinks()[event.target.value];
    //         }
    // }

    // deleteGeneralization(event) {
    //     if (this.state.generalization !== "") {
    //         let def = this.state.generalization;
    //         this.setState({generalization: ""});
    //         delete GeneralizationPool[def];
    //     }
    // }
    //
    // addGeneralization(event) {
    //     if (this.state.generalizationName !== "") {
    //         GeneralizationPool[this.state.generalizationName] = [];
    //         this.setState({generalizationName: ""})
    //     }
    // }
    //
    // handleChangeGeneralizationName(event) {
    //     this.setState({generalizationName: event.target.value});
    // }
    //
    // handleChangeGeneralization(event) {
    //     for (let key in GeneralizationPool) {
    //         if (GeneralizationPool[key].includes(this.props.panelObject)) {
    //             GeneralizationPool[key].splice(GeneralizationPool[key].indexOf(this.props.panelObject), 1);
    //             break;
    //         }
    //     }
    //     if (event.target.value !== "") {
    //         if (!(event.target.value in GeneralizationPool)) {
    //             GeneralizationPool[event.target.value] = [];
    //         }
    //         GeneralizationPool[event.target.value].push(this.props.panelObject);
    //
    //     }
    //     this.setState({generalization: event.target.value});
    // }

    handleChangeNotes(event){
        let copy = this.state.notes;
        copy[this.props.language] = event.target.value;
        this.setState({notes: copy});
    }

    saveNotes(){
        this.props.panelObject.notes[this.props.language] = this.state.notes[this.props.language];
    }

    getNodeWidget(stereotype,name,attributes){
        let attributeKey = 0;
        let attributeLength = attributes.length;
        let height = 48 + (attributeLength * 15);
        let width = 200;
        return(
            <svg
                width={width}
                height={height}
                shapeRendering="optimizeSpeed"
            >

                <g>
                    <rect fill="#ffffff" stroke={"black"} strokeWidth="4" width={width} height={height}/>
                    <text width={width} textAnchor="middle" dominantBaseline="hanging" x="50%" y="5px"
                          fill="#000000">{"«" + stereotype.name.toLowerCase() + "»"}</text>
                    <line x1="0" x2={width} y1="20px" y2="20px" strokeWidth="1" stroke="#000000"/>
                    <text width={width} textAnchor="middle" dominantBaseline="hanging" x="50%" y="25px"
                          fill="#000000">{name}</text>
                    <text width={width} textAnchor="start" dominantBaseline="hanging" x="5px" y="30px"
                          fill="#000000">
                        {attributes.map(
                            (attr) => (<tspan key={attributeKey++} x="5px" dy="15px">{attr.value + ": " + attr.attributeType.type}</tspan>)
                        )}
                    </text>
                </g>

            </svg>
        );
    }

    prepareObject(object) {
        let copy = object;
        if (copy instanceof NodeCommonModel) {
            let isGeneralizationMenuAvailable = false;
            for (let port in copy.getPorts()) {
                for (let link in copy.getPorts()[port].getLinks()) {
                    let iterLink = copy.getPorts()[port].getLinks()[link];
                    if (iterLink.linkType === Locale.generalization && iterLink.getSourcePort() === copy.getPorts()[port]) {
                        isGeneralizationMenuAvailable = true;
                        break;
                    }
                }
            }
            let generalizationKey = "";
            if (isGeneralizationMenuAvailable) {
                for (let key in GeneralizationPool) {
                    if (GeneralizationPool[key].includes(copy)) {
                        generalizationKey = key;
                        break;
                    }
                }
            }
            if (Object.keys(object.model.getLinks()).length > 0){
                this.setState({
                    links: object.model.getLinks()
                });
            }
            this.setState({
                type: NodeCommonModel,
                names: copy.names,
                attrs: copy.attributes,
                notes: copy.notes,
                stereotype: copy.stereotype,
                generalization: generalizationKey,
                isGeneralizationMenuAvailable: isGeneralizationMenuAvailable
            });
        } else if (copy instanceof LinkCommonModel) {
            this.setState({
                type: LinkCommonModel,
                firstCardinality: copy.firstCardinality,
                secondCardinality: copy.secondCardinality,
                linkType: copy.linkType,
                names: copy.names,
                notes: copy.notes,
                nodeStart: copy.getSourcePort() === null ? "" : copy.getSourcePort().getParent(),
                nodeEnd: copy.getTargetPort() === null ? "" : copy.getTargetPort().getParent(),
                labels: copy.labels
            });
        } else {
            this.setState({
                type: null,
                nodeStart: "",
                nodeEnd: ""
            });
        }

    }
    //TODO : languages
    processDialogue() {
        if (this.state.names[this.props.language] !== "") {
            this.props.panelObject.setName(this.state.names[this.props.language], this.props.language);
            if (this.state.type === LinkCommonModel) {
                this.props.panelObject.setNameLanguage(this.props.panelObject.model.language);
            } else {
                this.props.panelObject.class.names[this.props.language] = this.state.names[this.props.language];
            }
            this.forceUpdate();
            this.props.panelObject.model.canvas.forceUpdate();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.panelObject !== prevProps.panelObject) {
            this.prepareObject(this.props.panelObject);
        }
    }

    handleChangeAttributeType(event) {
        this.setState({
            newAttrType: event.target.value
        });
    }

    handleChangeAttributeType2(event) {
        this.setState({
            newAttrType2: event.target.value
        });
    }

    handleChangeLanguage(event) {
        this.setState({
            language: event.target.value
        });
    }

    handleChangeName(event) {
        let copy = this.state.names;
        copy[this.props.language] = event.target.value;
        this.setState({names: copy});
    }

    handleChangeAttribute(event) {
        this.setState({attribute: event.target.value});
        this.setState({
            newAttrName: this.state.attrs[this.props.language][event.target.value].first,
            newAttrType: this.state.attrs[this.props.language][event.target.value].second
        });
        this.forceUpdate();
    }

    addAttribute() {
        if (this.state.newAttrName2 !== "") {
            this.props.panelObject.addAttribute(new Attribute(this.state.newAttrType2, this.state.newAttrName2));
            this.setState({
                attribute: 0,
                newAttrName2: "",
                newAttrType2: 0
            });
            this.props.updateLinkPosition(this.props.panelObject);


        }
    }

    deleteAttribute() {
        this.props.panelObject.removeAttributeByIndex(this.state.attribute);
        this.setState({attribute: 0});
        this.forceUpdate();
        this.props.updateLinkPositionDelete(this.props.panelObject);
    }

    handleChangeAttributeName(event) {
        this.setState({newAttrName: event.target.value});
    }

    handleChangeAttributeName2(event) {
        this.setState({newAttrName2: event.target.value});
    }

    handleChangeFirstCardinality(event) {
        this.setState({firstCardinality: event.target.value});
        this.props.panelObject.setFirstCardinality(event.target.value);
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    handleChangeSecondCardinality(event) {
        this.setState({secondCardinality: event.target.value});
        this.props.panelObject.setSecondCardinality(event.target.value);
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    saveAttribute() {
        if (this.state.newAttrName !== "") {
            this.props.panelObject.setAttributeWithLanguageAndIndex(this.props.language, new Attribute(this.state.newAttrType, this.state.newAttrName), this.state.attribute);
            this.forceUpdate();
            this.props.panelObject.model.canvas.forceUpdate();
        }

    }

    handleChangeLabel(event) {
        this.setState({newLabel: event.target.value});
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    focus() {
        if (this.props.panelObject.attributes[this.props.language].length === 1) {
            this.setState({
                attribute: 0,
                newAttrName: this.state.attrs[this.props.language][0].first,
                newAttrType: this.state.attrs[this.props.language][0].second
            });
        }
    }

    saveLabel() {
        this.props.panelObject.setName(this.state.newLabel);
    }

    render() {
        this.attributeTypes = [];
        for (let attrType in AttributeTypePool) {
            this.attributeTypes.push(<option key={attrType} value={attrType}>{AttributeTypePool[attrType].name}</option>);
        }
        this.cardinalityPool = [];
        for (let cardinality in CardinalityPool) {
            this.cardinalityPool.push(<option key={cardinality} value={cardinality}>{CardinalityPool[cardinality].getString()}</option>);
        }

        if (this.state.type === NodeCommonModel) {
            let attributeKey = 0;

            const attributeList = this.state.attrs[this.props.language].map((attr) =>
                <option key={attributeKey} value={attributeKey++}>{attr.value + ": " + attr.attributeType.type}</option>
            );
            attributeKey = 0;
            let attributeLength = this.state.attrs[this.props.language].length;
            let selector = (<h6>{Locale.noAttributes}</h6>);
            if (attributeLength > 0) {
                selector = (
                    <div>
                        <FormControl
                            componentClass="select"
                            bsSize="small"
                            value={this.state.attribute}
                            onChange={this.handleChangeAttribute}
                            onFocus={this.focus}
                            size={attributeLength}
                            style={{height: 12 + (attributeLength) * 15}}
                        >
                            {attributeList}
                        </FormControl>
                        <Form inline>
                            <FormControl
                                bsSize="small"
                                type="text"
                                value={this.state.newAttrName}
                                placeholder={Locale.detailPanelNamePlaceholder}
                                onChange={this.handleChangeAttributeName}
                            />
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.newAttrType}
                                onChange={this.handleChangeAttributeType}
                            >
                                {this.attributeTypes}
                            </FormControl>
                        </Form>
                        <Button bsSize="small" onClick={this.saveAttribute}>{Locale.modify}</Button>
                        <Button bsSize="small" onClick={this.deleteAttribute}>{Locale.del}</Button>
                    </div>

                );
            }

            // let generalizationHeader = (<h4>{Locale.generalizations}</h4>);
            // let generalizationForm = (<Form inline>
            //
            //     <FormControl
            //         bsSize="small"
            //         type="text"
            //         value={this.state.generalizationName}
            //         placeholder={Locale.generalizationNamePlaceholder}
            //         onChange={this.handleChangeGeneralizationName}
            //     />
            //     <Button onClick={this.addGeneralization} bsSize="small" bsStyle="primary">{Locale.add}</Button>
            // </Form>);
            // let generalizationKey = 1;
            //
            // let generalizationList = [];
            //
            // let generalizationSelector = (<h6>{Locale.noGeneralizations}</h6>);
            // if (Object.keys(GeneralizationPool).length > 0) {
            //     generalizationList.push(<option key={0} value={""}>-----</option>);
            //
            //     generalizationList.push(Object.keys(GeneralizationPool).map((generalization) =>
            //         (<option key={generalizationKey++} value={generalization}>{generalization}</option>)
            //     ));
            //     generalizationSelector = (
            //         <div>
            //             <FormControl
            //                 componentClass="select"
            //                 bsSize="small"
            //                 value={this.state.generalization}
            //                 onChange={this.handleChangeGeneralization}
            //                 onFocus={this.focus}
            //                 size={1}
            //             >
            //                 {generalizationList}
            //             </FormControl>
            //             <Button onClick={this.deleteGeneralization} bsSize="small"
            //                     bsStyle="danger">{Locale.del}</Button>
            //         </div>
            //
            //     );
            // }
            // let generalizationLinks = "";
            // if (this.state.generalization !== "") {
            //     generalizationLinks = (
            //         <div style={{height: "100"}}>
            //             <Table striped bordered hover condensed>
            //                 <thead>
            //                 <tr>
            //                     <th>{Locale.name}</th>
            //                 </tr>
            //                 </thead>
            //                 <tbody>
            //
            //                 {GeneralizationPool[this.state.generalization].map((field, i) =>
            //                     <tr key={i}>
            //                         <td>
            //                             {field.names[this.props.language]}
            //                         </td>
            //                     </tr>
            //                 )}
            //                 </tbody>
            //             </Table>
            //         </div>
            //     );
            // }
            // let derivationSelector = (<h6>{Locale.noRelationships}</h6>);
            // let derivationList = [];
            // if (Object.keys(this.state.links).length > 0) {
            //     let linkKey = 1;
            //     derivationList.push(<option key={0} value={""}>-----</option>);
            //     derivationList.push(Object.keys(this.state.links).map((link) =>
            //         (<option key={linkKey++} value={link}>{link}</option>)
            //     ));
            //     derivationSelector = (
            //         <FormControl
            //             componentClass="select"
            //             bsSize="small"
            //             value={this.state.derivation}
            //             onChange={this.handleChangeDerivation}
            //         >
            //             {derivationList}
            //         </FormControl>
            //     );
            // }
            let widget = this.getNodeWidget(this.state.stereotype,this.state.names[this.props.language],this.state.attrs[this.props.language]);
            return (
                <div className="detailPanel" id="detailPanel">
                    <h2>{Locale.detailPanelTitle}</h2>
                    {widget}
                    <Form inline>
                        <FormGroup>
                            <h4>{Locale.detailPanelName}</h4>
                            <FormControl
                                bsSize="small"
                                type="text"
                                value={this.state.names[this.props.language]}
                                placeholder={Locale.detailPanelName}
                                onChange={this.handleChangeName}
                            />
                            <Button bsSize="small" onClick={this.processDialogue}>{Locale.menuPanelSave}</Button>
                        </FormGroup>
                    </Form>

                    {/*<Button bsSize="small" onClick={this.handleHide}>{Locale.hide}</Button>*/}
                    <h4>{Locale.detailPanelAttributes}</h4>
                    <Tabs id={"attributesTabs"} animation={false}>
                        <Tab eventKey={1} title={Locale.modify}>
                            {selector}
                        </Tab>
                        <Tab eventKey={2} title={Locale.create}>
                            <Form inline>
                                <FormControl
                                    bsSize="small"
                                    type="text"
                                    value={this.state.newAttrName2}
                                    placeholder={Locale.detailPanelNamePlaceholder}
                                    onChange={this.handleChangeAttributeName2}
                                />
                                <FormControl
                                    componentClass="select"
                                    bsSize="small"
                                    value={this.state.newAttrType2}
                                    onChange={this.handleChangeAttributeType2}
                                >
                                    {this.attributeTypes}
                                </FormControl>
                            </Form>
                            <Button bsSize="small" onClick={this.addAttribute}>{Locale.detailPanelNewAttr}</Button>
                        </Tab>
                    </Tabs>


                    {/*{*/}
                    {/*    this.state.isGeneralizationMenuAvailable ? generalizationHeader : ""*/}
                    {/*}*/}
                    {/*{*/}
                    {/*    this.state.isGeneralizationMenuAvailable ? generalizationSelector : ""*/}
                    {/*}*/}

                    {/*<br/>*/}
                    {/*{*/}
                    {/*    this.state.isGeneralizationMenuAvailable ? generalizationForm : ""*/}
                    {/*}*/}
                    {/*{*/}
                    {/*    this.state.isGeneralizationMenuAvailable ? generalizationLinks : ""*/}
                    {/*}*/}
                    <br/>
                    {/*<h4>{Locale.derivations}</h4>*/}
                    {/*{derivationSelector}*/}
                    <FormGroup>
                        <h4>{Locale.notes}</h4>
                        <FormControl
                            style={{height: 50, resize: "none"}}
                            bsSize="small"
                            componentClass="textarea"
                            placeholder={Locale.notes}
                            value={this.state.notes[this.props.language]}
                            onChange={this.handleChangeNotes}
                        />
                        <Button bsSize="small" onClick={this.saveNotes}>{Locale.menuPanelSave}</Button>
                    </FormGroup>
                </div>
            );
        } else if (this.state.type === LinkCommonModel) {
            let node1Widget = "";
            if (this.state.nodeStart !== ""){
                node1Widget = this.getNodeWidget(this.state.nodeStart.stereotype,this.state.nodeStart.names[this.props.language],this.state.nodeStart.attributes[this.props.language]);
            }
            let node2Widget = "";
            if (this.state.nodeEnd !== ""){
                node2Widget = this.getNodeWidget(this.state.nodeEnd.stereotype,this.state.nodeEnd.names[this.props.language],this.state.nodeEnd.attributes[this.props.language]);
            }

            let offset = 25;
            let horizontalOffset = 200;
            let linkEnd = LinkEndPool[LinkPool[this.state.linkType][0]];
            let linkWidget = (
                <svg
                    width={200}
                    height={50}
                    shapeRendering="optimizeSpeed"
                >

                    <g>
                        <line x1={0} x2={200} y1={25} y2={25} stroke="black" strokeWidth={3} strokeDasharray={LinkPool[this.state.linkType][2] ? "10,10" : "none"} />
                        <text x={5} y={15}  textAnchor="start"  dominantBaseline="baseline">{this.state.labels[0].label === Locale.none ? "" : this.state.labels[0].label}</text>
                        <text x={100} y={20}  textAnchor="middle" dominantBaseline="baseline">{this.state.labels[1].label}</text>
                        <text x={195} y={15} textAnchor="end"  dominantBaseline="baseline">{this.state.labels[2].label === Locale.none ? "" : this.state.labels[2].label}</text>
                        <text x={100} y={30}  textAnchor="middle" dominantBaseline="hanging">{this.state.labels[3].label}</text>
                    </g>
                    <g>
                        <polygon
                            points={`${linkEnd.x1 + horizontalOffset - linkEnd.x2},${linkEnd.y1 + offset} ${linkEnd.x2 + horizontalOffset - linkEnd.x2},${linkEnd.y2 + offset} ${linkEnd.x3 + horizontalOffset - linkEnd.x2},${linkEnd.y3 + offset} ${linkEnd.x4 + horizontalOffset - linkEnd.x2},${linkEnd.y4 + offset}`}
                            style={linkEnd.fill ?
                                {fill: "black", stroke: "black", strokeWidth: 2} :
                                {fill: "#eeeeee", stroke: "black", strokeWidth: 2}}

                        />
                        <text x={horizontalOffset - linkEnd.x2} y={offset} alignmentBaseline="middle" textAnchor="middle"
                              fill="white" pointerEvents="none">{linkEnd.text}</text>
                    </g>
                </svg>
            );


            return (
                <div className="detailPanel" id="detailPanel">
                    <h2>{Locale.detailPanelTitle}</h2>
                    {node1Widget}
                    {linkWidget}
                    {node2Widget}
                    <Form inline>
                        <FormGroup>
                            <h4>{Locale.detailPanelName}</h4>
                            <FormControl
                                bsSize="small"
                                type="text"
                                value={this.state.names[this.props.language]}
                                placeholder={Locale.detailPanelName}
                                onChange={this.handleChangeName}
                            />
                            <Button bsSize="small" onClick={this.processDialogue}>{Locale.menuPanelSave}</Button>
                        </FormGroup>
                    </Form>

                    <FormGroup>
                        <h4>{Locale.notes}</h4>
                        <FormControl
                            style={{height: 50, resize: "none"}}
                            bsSize="small"
                            componentClass="textarea"
                            placeholder={Locale.notes}
                            value={this.state.notes[this.props.language]}
                            onChange={this.handleChangeNotes}
                        />
                        <Button bsSize="small" onClick={this.saveNotes}>{Locale.menuPanelSave}</Button>
                    </FormGroup>
                </div>
            );
        } else {
            return (
                <div className="detailPanelEmpty">
                </div>
            );
        }
    }
}