import React from 'react';
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {Locale} from "../config/Locale";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import {AttributeTypePool} from "../config/AttributeTypePool";
import {AttributeObject} from "../components/misc/AttributeObject";
import {CardinalityPool} from "../config/CardinalityPool";
import {FormGroup} from "react-bootstrap";
import {FormControl} from "react-bootstrap";
import {Button} from "react-bootstrap";
import {Form} from "react-bootstrap";
import {NodeCommonWidget} from "../components/common-node/NodeCommonWidget";

export class DetailPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formName: "",
            newAttrName: "",
            newAttrType: AttributeTypePool[0],
            attribute: 0,
            linktype: "",
            newLabel: "",
            notes: "",
            attrs: ""
        };
        this.attributeTypes = [];
        for (let attrType of AttributeTypePool) {
            this.attributeTypes.push(<option key={attrType} value={attrType}>{attrType}</option>);
        }
        this.cardinalityPool = [];
        for (let cardinality of CardinalityPool) {
            this.cardinalityPool.push(<option key={cardinality} value={cardinality}>{cardinality}</option>);
        }

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
                notes: copy.notes
            });
        } else if (copy instanceof LinkCommonModel) {
            this.setState({
                type: LinkCommonModel,
                firstcard: copy.firstCardinality,
                secondcard: copy.secondCardinality,
                linktype: copy.linktype,
                names: copy.names,
                notes: copy.notes
            });
        } else {
            this.setState({
                type: null,
                names: "",
                attrs: "",
                firstcard: "",
                secondcard: "",
                linktype: ""
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
            this.forceUpdate();
            this.props.panelObject.model.canvas.forceUpdate();
        }
    }

    deleteAttribute() {
        this.props.panelObject.removeAttributeByIndex(this.state.attribute);
        this.setState({attribute: 0});
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    handleChangeAttributeName(event) {
        this.setState({newAttrName: event.target.value});
    }

    handleChangeFirstCardinality(event) {
        this.setState({firstcard: event.target.value});
        this.props.panelObject.setFirstCardinality(event.target.value);
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    handleChangeSecondCardinality(event) {
        this.setState({secondcard: event.target.value});
        this.props.panelObject.setSecondCardinality(event.target.value);
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    saveAttribute() {
        if (this.state.newAttrName !== "") {
            this.props.panelObject.setAttribute(this.props.language, new AttributeObject(this.state.newAttrName, this.state.newAttrType), this.state.attribute);
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
        if (this.state.type === NodeCommonModel) {
            let attrkey = 0;
            const attributeList = this.state.attrs[this.props.language].map((attr) =>
                <option key={attrkey} value={attrkey++}>{attr.first + ": " + attr.second}</option>
            );
            let attrlen = this.state.attrs[this.props.language].length;
            let selector = (<h6>{Locale.noAttributes}</h6>);
            if (attrlen > 0) {
                selector = (
                    <FormControl
                        componentClass="select"
                        bsSize="small"
                        value={this.state.attribute}
                        onChange={this.handleChangeAttribute}
                        onFocus={this.focus}
                        size={attrlen}
                        style={{height: 12 + (attrlen) * 15}}
                    >
                        {attributeList}
                    </FormControl>
                );
            }
            return (
                <div className="detailPanel">
                    <h2>{Locale.detailPanelTitle}</h2>
                    {this.props.panelObject === null ? "" : (<NodeCommonWidget node={this.props.panelObject} />)}


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
            return (
                <div className="detailPanel">
                    <h2>{Locale.detailPanelTitle}</h2>
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