import React from 'react';
import {NodeCommonModel} from "../components/nodes/NodeCommonModel";
import {Locale} from "../config/Locale";
import {Tabs, TabList, Tab, TabPanel} from 'react-tabs';
import {LanguagePool} from "../config/LanguagePool";
import "react-tabs/style/react-tabs.css";
import {CommonLinkModel} from "../components/commonlink/CommonLinkModel";
import {PointModel} from "storm-react-diagrams";
import {AttributeTypePool} from "../config/AttributeTypePool";
import {AttributeObject} from "../components/nodes/AttributeObject";
import {CardinalityPool} from "../config/CardinalityPool";

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
                newLabel: copy.name
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

            return (
                <div className="detailPanel" >
                    <h2>{Locale.detailPanelTitle}</h2>

                    <select value={this.state.language} onChange={this.handleChangeLanguage}>
                        {this.languages}
                    </select>
                    <fieldset>
                        <h4>{Locale.detailPanelName}</h4>
                        <input type="text" value={this.state.names[this.state.language]} onChange={this.handleChangeName} placeholder={Locale.detailPanelNamePlaceholder}/>
                        <button onClick={this.processDialogue}>{Locale.menuPanelSave}</button>
                        <h4>{Locale.detailPanelAttributes}</h4>
                        <fieldset>
                            <select
                                onFocus={this.focus}
                                value={this.state.attribute}
                                size={this.state.attrs[this.state.language].length}
                                onChange={this.handleChangeAttribute}>
                                {attributeList}
                            </select><br />
                            <input type="text" value={this.state.newAttrName} onChange={this.handleChangeAttributeName} placeholder={Locale.detailPanelNamePlaceholder}/>
                            <select value={this.state.newAttrType} onChange={this.handleChangeAttributeType}>{this.attributeTypes}</select>
                            <button onClick={this.saveAttribute}>{Locale.menuPanelSave}</button><br />
                            <button onClick={this.addAttribute}>{Locale.detailPanelNewAttr}</button>
                            <button onClick={this.deleteAttribute}>{Locale.detailPanelDeleteAttr}</button>
                        </fieldset>
                    </fieldset>
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