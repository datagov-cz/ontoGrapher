import React from "react";
import {LanguagePool} from "./LanguagePool";
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import {NodeCommonModel} from "../components/nodes/NodeCommonModel";
import Modal from 'react-modal';

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

export class ModalDialogue extends React.Component {
    constructor(props){
        super(props);
        this.state={
            modalIsOpen: false
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        console.log("happen2");
    }

    openModal(){
        this.setState({modalIsOpen: true});
    }

    closeModal(){
        this.setState({modalIsOpen: false});
    }
    processModal(event){
        event.preventDefault();
    }

    render(){
        return(
            <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal}>
                <h2>{this.props.node.getName(this.props.node.model.language)}</h2>
            </Modal>
        );
    }
}

ModalDialogue.defaultProps = {
  node: NodeCommonModel
};

