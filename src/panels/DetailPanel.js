import React from 'react';
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {Locale} from "../config/Locale";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import {AttributeObject} from "../components/misc/AttributeObject";
import {FormGroup} from "react-bootstrap";
import {FormControl} from "react-bootstrap";
import {Button} from "react-bootstrap";
import {Form} from "react-bootstrap";
import {AttributeTypePool, CardinalityPool} from "../config/Variables";
import {LinkEndPool, LinkPool} from "../config/LinkVariables";

export class DetailPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formName: "",
            newAttrName: "",
            newAttrType: AttributeTypePool[0],
            attribute: 0,
            linkType: "",
            newLabel: "",
            notes: "",
            attrs: "",
            stereotype: "",
            nodeStart: "",
            nodeEnd: ""
        };

        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeAttributeType = this.handleChangeAttributeType.bind(this);
        this.handleChangeAttribute = this.handleChangeAttribute.bind(this);
        this.processDialogue = this.processDialogue.bind(this);
        this.addAttribute = this.addAttribute.bind(this);
        this.saveAttribute = this.saveAttribute.bind(this);
        this.deleteAttribute = this.deleteAttribute.bind(this);
        this.handleChangeAttributeName = this.handleChangeAttributeName.bind(this);
        this.handleChangeFirstCardinality = this.handleChangeFirstCardinality.bind(this);
        this.handleChangeSecondCardinality = this.handleChangeSecondCardinality.bind(this);
        this.focus = this.focus.bind(this);
        this.handleChangeLabel = this.handleChangeLabel.bind(this);
        this.saveLabel = this.saveLabel.bind(this);
        this.saveNotes = this.saveNotes.bind(this);
        this.handleChangeNotes = this.handleChangeNotes.bind(this);
    }

    handleChangeNotes(event){
        let copy = this.state.notes;
        copy[this.props.language] = event.target.value;
        this.setState({notes: copy});
    }

    saveNotes(){
        this.props.panelObject.notes[this.props.language] = this.state.notes[this.props.language];
    }

    prepareObject(object) {
        let copy = object;
        if (copy instanceof NodeCommonModel) {
            this.setState({
                type: NodeCommonModel,
                names: copy.names,
                attrs: copy.attributes,
                notes: copy.notes,
                stereotype: copy.stereotype
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

    processDialogue() {
        if (this.state.names[this.props.language] !== "") {
            this.props.panelObject.setName(this.state.names[this.props.language], this.props.language);
            if (this.state.type === LinkCommonModel) {
                this.props.panelObject.setNameLanguage(this.props.panelObject.model.language);
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
        if (this.state.newAttrName !== "") {
            this.props.panelObject.addAttribute(new AttributeObject(this.state.newAttrName, this.state.newAttrType));
            this.setState({
                attribute: 0,
                newAttrName: this.state.attrs[this.props.language][0].first,
                newAttrType: this.state.attrs[this.props.language][0].second
            });
            this.props.updateLinkPosition(this.props.panelObject);


        }
    }

    deleteAttribute() {
        this.props.panelObject.removeAttributeByIndex(this.state.attribute);
        this.setState({attribute: 0});
        this.props.updateLinkPosition(this.props.panelObject);
    }

    handleChangeAttributeName(event) {
        this.setState({newAttrName: event.target.value});
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
            this.props.panelObject.setAttributeWithLanguageAndIndex(this.props.language, new AttributeObject(this.state.newAttrName, this.state.newAttrType), this.state.attribute);
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
        for (let attrType of AttributeTypePool) {
            this.attributeTypes.push(<option key={attrType} value={attrType}>{attrType}</option>);
        }
        this.cardinalityPool = [];
        for (let cardinality of CardinalityPool) {
            this.cardinalityPool.push(<option key={cardinality} value={cardinality}>{cardinality}</option>);
        }

        if (this.state.type === NodeCommonModel) {
            let attributeKey = 0;
            const attributeList = this.state.attrs[this.props.language].map((attr) =>
                <option key={attributeKey} value={attributeKey++}>{attr.first + ": " + attr.second}</option>
            );
            attributeKey = 0;
            let attributeLength = this.state.attrs[this.props.language].length;
            let selector = (<h6>{Locale.noAttributes}</h6>);
            let height = 48 + (attributeLength * 15);
            if (attributeLength > 0) {
                selector = (
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
                );
            }
            let widget = (
                <svg
                    width={150}
                    height={height}
                    shapeRendering="optimizeSpeed"
                >

                    <g>
                        <rect fill="#ffffff" stroke={"black"} strokeWidth="4" width={150} height={height}/>
                        <text width={150} textAnchor="middle" dominantBaseline="hanging" x="50%" y="5px"
                              fill="#000000">{"«" + this.state.stereotype + "»"}</text>
                        <line x1="0" x2={150} y1="20px" y2="20px" strokeWidth="1" stroke="#000000"/>
                        <text width={150} textAnchor="middle" dominantBaseline="hanging" x="50%" y="25px"
                              fill="#000000">{this.state.names[this.props.language]}</text>
                        <text width={150} textAnchor="start" dominantBaseline="hanging" x="5px" y="30px"
                              fill="#000000">
                            {this.state.attrs[this.props.language].map(
                                (attr) => (<tspan key={attributeKey++} x="5px" dy="15px">{attr.first + ": " + attr.second}</tspan>)
                            )}
                        </text>
                    </g>
                </svg>
            );
            return (
                <div className="detailPanel">
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

                    <h4>{Locale.detailPanelAttributes}</h4>

                    {selector}
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
                        <Button bsSize="small" onClick={this.saveAttribute}>{Locale.menuPanelSave}</Button>
                    </Form>
                    <Button bsSize="small" onClick={this.addAttribute}>{Locale.detailPanelNewAttr}</Button>
                    <Button bsSize="small" onClick={this.deleteAttribute}>{Locale.detailPanelDeleteAttr}</Button>
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
            let attributeKey = 0;
            let attributeLength = 0;
            let height = 0;

            let node1Widget = "";
            if (this.state.nodeStart !== ""){
                attributeLength = this.state.nodeStart.attributes[this.props.language].length;
                height = 48 + (attributeLength * 15);
                node1Widget = (
                    <svg
                        width={150}
                        height={height}
                        shapeRendering="optimizeSpeed"
                    >

                        <g>
                            <rect fill="#ffffff" stroke={"black"} strokeWidth="4" width={150} height={height}/>
                            <text width={150} textAnchor="middle" dominantBaseline="hanging" x="50%" y="5px"
                                  fill="#000000">{"«" + this.state.nodeStart.stereotype + "»"}</text>
                            <line x1="0" x2={150} y1="20px" y2="20px" strokeWidth="1" stroke="#000000"/>
                            <text width={150} textAnchor="middle" dominantBaseline="hanging" x="50%" y="25px"
                                  fill="#000000">{this.state.nodeStart.names[this.props.language]}</text>
                            <text width={150} textAnchor="start" dominantBaseline="hanging" x="5px" y="30px"
                                  fill="#000000">
                                {this.state.nodeStart.attributes[this.props.language].map(
                                    (attr) => (<tspan key={attributeKey++} x="5px" dy="15px">{attr.first + ": " + attr.second}</tspan>)
                                )}
                            </text>
                        </g>
                    </svg>
                );
            }
            let node2Widget = "";
            if (this.state.nodeEnd !== ""){
                attributeKey = 0;
                attributeLength = this.state.nodeEnd.attributes[this.props.language].length;
                height = 48 + (attributeLength * 15);
                node2Widget = (
                    <svg
                        width={150}
                        height={height}
                        shapeRendering="optimizeSpeed"
                    >

                        <g>
                            <rect fill="#ffffff" stroke={"black"} strokeWidth="4" width={150} height={height}/>
                            <text width={150} textAnchor="middle" dominantBaseline="hanging" x="50%" y="5px"
                                  fill="#000000">{"«" + this.state.nodeEnd.stereotype + "»"}</text>
                            <line x1="0" x2={150} y1="20px" y2="20px" strokeWidth="1" stroke="#000000"/>
                            <text width={150} textAnchor="middle" dominantBaseline="hanging" x="50%" y="25px"
                                  fill="#000000">{this.state.nodeEnd.names[this.props.language]}</text>
                            <text width={150} textAnchor="start" dominantBaseline="hanging" x="5px" y="30px"
                                  fill="#000000">
                                {this.state.nodeEnd.attributes[this.props.language].map(
                                    (attr) => (<tspan key={attributeKey++} x="5px" dy="15px">{attr.first + ": " + attr.second}</tspan>)
                                )}
                            </text>
                        </g>

                    </svg>
                );
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
                        <text x={5} y={15}  textAnchor="start"  dominantBaseline="baseline">{this.state.labels[0].label}</text>
                        <text x={100} y={20}  textAnchor="middle" dominantBaseline="baseline">{this.state.labels[1].label}</text>
                        <text x={195} y={15} textAnchor="end"  dominantBaseline="baseline">{this.state.labels[2].label}</text>
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
                <div className="detailPanel">
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