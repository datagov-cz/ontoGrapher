import React from "react";
import {LanguagePool} from "./LanguagePool";
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {NodeCommonModel} from "../components/nodes/NodeCommonModel";
import Modal from 'react-modal';
import {AttributeObject} from "../components/nodes/AttributeObject";
/*
export class ModalTabList extends React.Component {
    tablist: [];

    constructor(props){
        super(props);
        this.tablist = [];
        console.log(LanguagePool.cs);
        for (let language in LanguagePool){
            this.tablist.push(<Tab className={language}>{LanguagePool[language]}</Tab>);
        }
    }
    render(){
        console.log(this.tablist.length);
        return (
            <TabList>
                {this.tablist}
            </TabList>
        );

    }
}
*/
export class ModalDialogue extends React.Component {
    node: NodeCommonModel;

    constructor(props){
        super(props);
        this.state={
            modalIsOpen: false,
            language: this.props.node.model.language,
            name: this.props.node.getName(this.props.node.model.language),
            attrs: this.props.node.getAttributesByLanguage(this.props.node.model.language),
            newAttrType: "",
            newAttrName: ""
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.processModal = this.processModal.bind(this);
        this.handleChange1 = this.handleChange1.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
        this.handleChange3 = this.handleChange3.bind(this);
        this.handleChange4 = this.handleChange4.bind(this);
        this.addAttribute = this.addAttribute.bind(this);
        this.languagePool = [];
        for (let language in LanguagePool) {
            this.languagePool.push(<option key={language} value={language}>{LanguagePool[language]}</option>)
        }
    }

    openModal(){
        this.setState({modalIsOpen: true});
    }

    closeModal(){
        this.setState({modalIsOpen: false});
    }
    processModal(event){
        event.preventDefault();
        this.props.node.setName(this.state.name, this.state.language);
        this.forceUpdate();
    }
    handleChange1(event){
        this.setState({name: event.target.value});
    }

    handleChange2(event){
        this.setState({newAttrName: event.target.value});
    }

    handleChange3(event) {
        let language = event.target.value;
        this.setState({
            language: language,
            attrs: this.props.node.getAttributesByLanguage(language),
            name: this.props.node.getName(language)
        });

    }

    handleChange4(event){
        this.setState({newAttrType: event.target.value});
    }

    addAttribute(event){
        this.props.node.addAttribute(this.state.language, new AttributeObject(this.state.newAttrName,this.state.newAttrType));
        this.setState({
            newAttrName: "",
            newAttrType: ""
        });
        console.log(this.props.node.attributes);
    }

    deleteAttribute(attr, event){
        this.props.node.removeAttributeByIndex(attr-1,this.state.language);
    }

    render(){
        let attrkey = 0;
        const attrsmap = this.state.attrs.map((attr) =>
            <li key={attrkey++}>{attr.first + ": " + attr.second}<button onClick={event => {this.deleteAttribute(attrkey,event)}}>Smazat</button></li>
        );
        return(
            <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal}>
                <h2>{this.state.name}</h2>
                <select value={this.state.language} onChange={this.handleChange3}>
                    {this.languagePool}
                </select>
                 <form onSubmit={this.processModal}>
                     <fieldset>
                    <label>
                        Jméno:
                        <input type="text" onChange={this.handleChange1} value={this.state.name} />
                        <input type="Submit" value="Odeslat" />
                    </label>
                     <h3>atributy</h3>
                    <ul>
                        {attrsmap}
                    </ul><br />
                         <input type="text" onChange={this.handleChange2} value={this.state.newAttrName} placeholder="Název" />
                         <input type="text" onChange={this.handleChange4} value={this.state.newAttrType} placeholder="Typ" />
                         <button onClick={this.addAttribute}>Nový atribut</button><br />

                     </fieldset>
                 </form>
                <button onClick={this.closeModal}>Zavřít</button>
            </Modal>
        );
    }
}

ModalDialogue.defaultProps = {
  node: NodeCommonModel
};

