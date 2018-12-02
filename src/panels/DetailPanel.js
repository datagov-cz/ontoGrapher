import React from 'react';
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {Locale} from "../config/Locale";
import {Tabs, TabList, Tab, TabPanel} from 'react-tabs';
import {LanguagePool} from "../config/LanguagePool";
import "react-tabs/style/react-tabs.css";
import {CommonLinkModel} from "../components/common-link/CommonLinkModel";
import {PointModel} from "storm-react-diagrams";
import {AttributeTypePool} from "../config/AttributeTypePool";
import {AttributeObject} from "../components/misc/AttributeObject";
import {CardinalityPool} from "../config/CardinalityPool";
import FormGroup from "react-bootstrap/es/FormGroup";
import FormControl from "react-bootstrap/es/FormControl";
import Button from "react-bootstrap/es/Button";
import Form from "react-bootstrap/es/Form";
import InputGroup from "react-bootstrap/es/InputGroup";

export class DetailPanel extends React.Component{
    constructor(props){
        super(props);
        this.state={
            language: this.props.language,
            formName: "",
            newAttrName: "",
            newAttrType: AttributeTypePool[0],
            attribute: 0,
            linktype: "",
            newLabel: ""
        };
        this.attributeList = [];
        let key = 0;
        this.languages = [];
        for (let language in LanguagePool){
            this.languages.push(<option key={language} value={language}>{LanguagePool[language]}</option>);
        }
        this.attributeTypes = [];
        for (let attrType of AttributeTypePool){
            this.attributeTypes.push(<option key={attrType} value={attrType}>{attrType}</option>);
        }
        this.cardinalityPool = [];
        for (let cardinality of CardinalityPool){
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
    }



    prepareObject(object){
        let copy = object;
        if (copy instanceof NodeCommonModel){
            this.setState({
                type: NodeCommonModel,
                names: copy.names,
                attrs: copy.attributes
            });
        } else if (copy instanceof CommonLinkModel){
            this.setState({
                type: CommonLinkModel,
                firstcard: copy.firstCardinality,
                secondcard: copy.secondCardinality,
                linktype: copy.linktype,
                names: copy.names
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

    processDialogue(){
        this.props.panelObject.setName(this.state.names[this.state.language], this.state.language);
        if (this.state.type === CommonLinkModel){
            this.props.panelObject.setNameLanguage(this.props.panelObject.model.language);
        }
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    componentDidUpdate(prevProps){
        if (this.props.panelObject !== prevProps.panelObject){
            this.prepareObject(this.props.panelObject);
        }
    }

    handleChangeAttributeType(event){
        this.setState({
            newAttrType: event.target.value
        });
    }

    handleChangeLanguage(event) {
        this.setState({
           language: event.target.value
        });
    }

    handleChangeName(event){
        let copy = this.state.names;
        copy[this.state.language] = event.target.value;
        this.setState({names: copy});
    }

    handleChangeAttribute(event){
        this.setState({attribute: event.target.value});
        this.setState({
            newAttrName: this.state.attrs[this.state.language][event.target.value].first,
            newAttrType: this.state.attrs[this.state.language][event.target.value].second
        });
        this.forceUpdate();
    }

    addAttribute(){
        this.props.panelObject.addAttribute(new AttributeObject(this.state.newAttrName,this.state.newAttrType));
        this.setState({
            attribute: 0,
            newAttrName: this.state.attrs[this.state.language][0].first,
            newAttrType: this.state.attrs[this.state.language][0].second
        });
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    deleteAttribute(){
        this.props.panelObject.removeAttributeByIndex(this.state.attribute);
        this.setState({attribute: 0});
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    handleChangeAttributeName(event){
        this.setState({newAttrName: event.target.value});
    }

    handleChangeFirstCardinality(event){
        this.setState({firstcard: event.target.value});
        this.props.panelObject.setFirstCardinality(event.target.value);
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    handleChangeSecondCardinality(event){
        this.setState({secondcard: event.target.value});
        this.props.panelObject.setSecondCardinality(event.target.value);
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    saveAttribute(){
        this.props.panelObject.setAttribute(this.state.language,new AttributeObject(this.state.newAttrName,this.state.newAttrType),this.state.attribute);
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();

    }

    handleChangeLabel(event){
        this.setState({newLabel: event.target.value});
        this.forceUpdate();
        this.props.panelObject.model.canvas.forceUpdate();
    }

    focus(){
        if (this.props.panelObject.attributes[this.state.language].length === 1) {
            this.setState({
                attribute: 0,
                newAttrName: this.state.attrs[this.state.language][0].first,
                newAttrType: this.state.attrs[this.state.language][0].second
            });
        }
    }

    saveLabel(){
        this.props.panelObject.setName(this.state.newLabel);
    }

    render() {
        if (this.state.type === NodeCommonModel){
            /*
            if (this.state.formName !== this.props.panelObject.names[this.state.language]){
                this.setState({formName: this.props.panelObject.names[this.state.language]});
            }
            */
            let attrkey = 0;
            const attributeList = this.state.attrs[this.state.language].map((attr) =>
            <option key={attrkey} value={attrkey++}>{attr.first+ ": " + attr.second}</option>
            );
            let attrlen = this.state.attrs[this.state.language].length;
            let selector = (<h6>{Locale.noAttributes}</h6>);
            if (attrlen > 0){
                selector = (
                    <FormControl
                        componentClass="select"
                        bsSize="small"
                        value={this.state.attribute}
                        onChange={this.handleChangeAttribute}
                        onFocus={this.focus}
                        size={attrlen}
                        style={{height: 12+(attrlen)*15}}
                    >
                        {attributeList}
                    </FormControl>
                );
            }

            return (
                <div className="detailPanel">
                    <h2>{Locale.detailPanelTitle}</h2>

                    <select value={this.state.language} onChange={this.handleChangeLanguage}>
                        {this.languages}
                    </select>
                    <Form inline>
                    <FormGroup>
                        <h4>{Locale.detailPanelName}</h4>
                        <FormControl
                            bsSize="small"
                            type="text"
                            value={this.state.names[this.state.language]}
                            placeholder={Locale.detailPanelNamePlaceholder}
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
                            <Button  bsSize="small" onClick={this.saveAttribute}>{Locale.menuPanelSave}</Button>
                        </Form>
                            <Button bsSize="small" onClick={this.addAttribute}>{Locale.detailPanelNewAttr}</Button>
                            <Button bsSize="small" onClick={this.deleteAttribute}>{Locale.detailPanelDeleteAttr}</Button>

                </div>
            );
        } else if (this.state.type === CommonLinkModel){
            return (
                <div className="detailPanel">
                    <h2>{Locale.detailPanelTitle}</h2>

                    <select value={this.state.language} onChange={this.handleChangeLanguage}>
                        {this.languages}
                    </select>
                    <Form inline>
                        <FormGroup>
                            <h4>{Locale.detailPanelName}</h4>
                            <FormControl
                                bsSize="small"
                                type="text"
                                value={this.state.names[this.state.language]}
                                placeholder={Locale.detailPanelNamePlaceholder}
                                onChange={this.handleChangeName}
                            />
                            <Button bsSize="small" onClick={this.processDialogue}>{Locale.menuPanelSave}</Button>
                        </FormGroup>
                    </Form>
                </div>
            );
        } else {
            return (
                <div className="detailPanelEmpty">
                </div>
            );
        }
    }






    /*

     if (this.state.type === NodeCommonModel){
            return (<div className="detailPanel">
                <h2>{Locale.detailPanelTitle}</h2>

                <select value={this.state.language} onChange={this.handleChangeLanguage}>
                    {this.languages}
                </select>
                <fieldset>
                    <input type="text" value={this.state.}
                </fieldset>
            </div>);
        } else if (this.state.type === CommonLinkModel){
            return (<div className="detailPanel">
                <h2>{Locale.detailPanelTitle}</h2>

                <select value={this.state.language} onChange={this.handleChangeLanguage}>
                    {this.languages}
                </select>
                <fieldset>
                    <input type="text" value={this.state.language}
                </fieldset>
            </div>);
        } else {
            return(
                <div className="detailPanel">
                    <h2>{Locale.detailPanelTitle}</h2>

                    <select value={this.state.language} onChange={this.handleChangeLanguage}>
                        {this.languages}
                    </select>
                    <fieldset>
                        <input type="text" value={this.state.language}
                    </fieldset>
                </div>
            );
        }
    }

    render()
    {
        let object = {};
        if (this.props.panelObject instanceof NodeCommonModel){
            object.name = this.props.panelObject.names[this.state.language];
            object.attrs = this.props.panelObject.attributes[this.state.language];
        }

        let key = 0;
        let attrsmap = [];

        key = 0;
        let tablist = [];
        for (let language in LanguagePool){
            tablist.push(<Tab>{LanguagePool[language]}</Tab>)
        }
        let tabpanellist = [];
        for (let language in LanguagePool){
            tabpanellist.push(<TabPanel>{LanguagePool[language]}</TabPanel>)
        }

        return(<div className="detailPanel">
            <h2>{Locale.detailPanelTitle}</h2>
            {object.name}
            <h4>{Locale.detailPanelName}</h4>
            <Tabs>
                <TabList>
                    {tablist}
                </TabList>
                {tabpanellist}
            </Tabs>
        </div>);

    }
    */
}