import React from 'react';
import {PanelNodeItem} from "./PanelNodeItem";
import {Form, FormControl, FormGroup, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import {PanelLinkItem} from "./PanelLinkItem";
import {
    Packages,
    LinkPool,
    Models,
    StereotypePool,
    VocabularyPool,
    StereotypePoolPackage, ClassPackage
} from "../../config/Variables";
import {Locale} from "../../config/locale/Locale";
import {PanelModelItem} from "./PanelModelItem";
import {PanelPackageItem} from "./PanelPackageItem";
import Button from "react-bootstrap/lib/Button";
import Modal from "react-bootstrap/lib/Modal";
import * as Helper from "../../misc/Helper";
import {Class} from "../../components/misc/Class";
const arrow = (
    <svg height={10} width={15}>
        <line x1={0} y1={5} x2={10} y2={5} stroke="black" strokeWidth={2}/>
        <polygon
            points="10,0 10,10 15,5"
            fill="black"
            stroke="black"
            strokeWidth="1"
        />
    </svg>
);

const box = (
    <svg height={10} width={15}>
        <rect width={15} height={10} fill="white" stroke="black" strokeWidth={4}/>
    </svg>
);

export class ElementPanel extends React.Component {
    constructor(props: PanelNodeItem) {
        super(props);
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.handleChangeVocabulary = this.handleChangeVocabulary.bind(this);
        this.handleChangePackage = this.handleChangePackage.bind(this);
        this.handleChangeSelectedModel = this.handleChangeSelectedModel.bind(this);
        this.handleCloseModelModal = this.handleCloseModelModal.bind(this);
        this.handleOpenModelModal = this.handleOpenModelModal.bind(this);
        this.handleChangeModelName = this.handleChangeModelName.bind(this);
        this.deleteModel = this.deleteModel.bind(this);
        this.addModel = this.addModel.bind(this);
        this.handleChangeModel = this.handleChangeModel.bind(this);
        this.handleClosePackageModal = this.handleClosePackageModal.bind(this);
        this.handleOpenPackageModal = this.handleOpenPackageModal.bind(this);
        this.handleOpenNewModal = this.handleOpenNewModal.bind(this);
        this.handleCloseNewModal = this.handleCloseNewModal.bind(this);
        this.handleChangeNewName = this.handleChangeNewName.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.removePackage = this.removePackage.bind(this);
        this.state = {
            loaded: false,
            vocabulary: "&*",
            package: Object.keys(Packages)[0],
            model: "",
            packageModal: false,
            modelModal: false,
            modelName: "",
            newModal: false,
            newName: "",
            modalDialogue: Object.keys(Models)[0]
        };
    }

    removePackage(){
        delete Packages[this.state.package];
        this.setState({package: Object.keys(Packages)[0]});
    }

    handleNew(){
        if (this.state.newName !== ""){
            Packages[this.state.newName] = false;
            ClassPackage[this.state.newName] = [];
            this.setState({newName: ""});
        }
        this.handleCloseNewModal();
    }

    handleChangeModelName(event){
        this.setState({modelName: event.target.value});
    }

    handleChangeNewName(event){
        this.setState({newName: event.target.value});
    }

    handleChangeModel(event){
        this.setState({modalDialogue: event.target.value});
    }

    addModel(){
        if (this.state.modelName !== ""){
            Models[this.state.modelName] = "";
            this.setState({modelName: ""});
        }
    }

    deleteModel() {
        if (this.state.modalDialogue !== undefined){
            delete Models[this.state.modalDialogue];
        }
    }


    handleOpenNewModal(){
        this.setState({newModal: true});
    }

    handleCloseNewModal(){
        this.setState({newModal: false});
    }


    handleOpenModelModal(){
        this.setState({modelModal: true});
    }

    handleCloseModelModal(){
        this.setState({modelModal: false});
    }

    handleOpenPackageModal(){
        this.setState({packageModal: true});
    }

    handleClosePackageModal(){
        this.setState({packageModal: false});
    }

    handleChangeVocabulary(event){
        this.setState({vocabulary: event.target.value});
    }

    handleChangePackage(event){
        this.setState({package: event.target.value});
    }

    handleChangeSelectedModel(model){
        this.props.handleChangeSelectedModel(model);
    }

    handleChangeSelectedLink(linkType) {
        this.props.handleChangeSelectedLink(linkType);
    }

    render() {
        let i = 0;
        let vocabularyPool = [];
        vocabularyPool.push(<option key={i++} value={"&*"}>{Locale.all}</option>);
        for (let vocabulary of VocabularyPool){
            vocabularyPool.push(<option key={i++} value={vocabulary}>{vocabulary}</option>)
        }
        vocabularyPool.push(<option key={i++} value={""}>{Locale.otherVocabulary}</option>);
        let selectedPkg = "";
        if (Packages[this.state.package]){
            if (this.state.package in StereotypePoolPackage){
                selectedPkg = StereotypePoolPackage[this.state.package].map((cls) =>
                    <PanelNodeItem key={i++} model={{
                        stereotype: cls,
                        newNode: false
                    }} name={cls.name}/>)
            }
        } else if (!Packages[this.state.package]){
            if (this.state.package in ClassPackage){
                selectedPkg = ClassPackage[this.state.package].map((cls) =>
                    <PanelNodeItem key={i++} model={{
                        stereotype: cls.stereotype,
                        newNode: false
                    }} name={cls.name}/>)
            }
        }
        return (
            <div className="stereotypePanel" id="stereotypePanel">
                <Tabs id="stereotypePanelTabs" animation={false}>
                    <Tab eventKey={1} title={box}>
                        <FormControl componentClass="select" bsSize="small" value={this.state.vocabulary}
                                     onChange={this.handleChangeVocabulary}>
                            {vocabularyPool}
                        </FormControl>
                        <div className="stereotypes">
                            {
                                StereotypePool.map((stereotype, i) => {
                                    if (stereotype.source === this.state.vocabulary || this.state.vocabulary === "&*" || (this.state.vocabulary === "" && !VocabularyPool.includes(stereotype.source))){
                                        return (<PanelNodeItem key={i++} model={{
                                                stereotype: stereotype,
                                                newNode: true
                                            }} name={stereotype.name}/>);
                                    }
                                })
                            }
                        </div>
                    </Tab>
                    <Tab eventKey={2} title={arrow}>
                        <FormControl componentClass="select" bsSize="small" value={this.state.vocabulary}
                                     onChange={this.handleChangeVocabulary}>
                            {vocabularyPool}
                        </FormControl>
                        {Object.keys(LinkPool).map((link) => {
                                if (LinkPool[link][6] === this.state.vocabulary || this.state.vocabulary === "&*" || (this.state.vocabulary === "" && !VocabularyPool.includes(LinkPool[link][6]) )){
                                    return <PanelLinkItem
                                        key={i++}
                                        selectedLink={this.props.selectedLink}
                                        handleChangeSelectedLink={this.handleChangeSelectedLink}
                                        linkType={link}
                                    />
                                }
                            }
                        )}
                    </Tab>
                    <Tab eventKey={3} title={"P"}>
                        <Button onClick={this.handleOpenNewModal}>{Locale.addPackage}</Button>
                        <Button onClick={this.removePackage}>{Locale.removePackage}</Button>
                        <FormControl componentClass="select" bsSize="small" value={this.state.package}
                                     onChange={this.handleChangePackage}>
                            {Object.keys(Packages).map((pkg) => (<option key={i++} value={pkg}>{Packages[pkg] ? "📄"+pkg : "✏"+pkg }</option>))}
                        </FormControl>
                        {!Packages[this.state.package] ?
                            <Button onClick={this.handleOpenPackageModal} bsSize={"small"}>Manage</Button>
                            : ""}

                            {selectedPkg}
                    </Tab>
                    <Tab eventKey={4} title={"M"}>

                            <Button onClick={this.handleOpenModelModal} bsSize={"small"}>Manage</Button>
                            {Object.keys(Models).map((model) => <PanelModelItem
                                key={i++}
                                selectedModel={this.props.selectedModel}
                                handleChangeSelectedModel={this.handleChangeSelectedModel}
                                model={model}
                            />)}
                    </Tab>
                </Tabs>

                <Modal show={this.state.modelModal} onHide={this.handleCloseModelModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.modelSettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <FormGroup>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.modalDialogue}
                                onChange={this.handleChangeModel}
                                //onFocus={this.focus}
                                size={Object.keys(Models).length}
                                style={{height: 200}}
                            >
                                {Object.keys(Models).map((model, i) => <option key={i} value={model}>{model}</option>)}
                            </FormControl>

                            <Button onClick={this.deleteModel}
                                    bsStyle="danger">{Locale.deleteSelected}</Button>

                        </FormGroup>
                        <h4>{Locale.createNew+Locale.model}</h4>
                                <Form>
                                    <FormControl
                                        type="text"
                                        value={this.state.modelName}
                                        placeholder={Locale.modelPlaceholder}
                                        onChange={this.handleChangeModelName}
                                    />
                                    <Button onClick={this.addModel} bsStyle="primary">{Locale.addModel}</Button>
                                </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModelModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.packageModal} onHide={this.handleClosePackageModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {this.state.package + " " + Locale.packageSettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

{
    this.state.package in ClassPackage ?
                    <FormGroup>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.packageItem}
                                onChange={this.handleChangePackageItem}
                                //onFocus={this.focus}
                                size={ClassPackage[this.state.package]}
                                style={{height: 200}}
                            >
                                {ClassPackage[this.state.package].map((cls, i) => <option key={i} value={cls.id}>{cls.name}</option>)}
                            </FormControl>

                            <Button onClick={this.deleteModel}
                                    bsStyle="danger">{Locale.deleteSelected}</Button>

                        </FormGroup> : ""
}
                        <h4>{Locale.createNew+Locale.model}</h4>
                        <Form>
                            <FormControl
                                type="text"
                                value={this.state.modelName}
                                placeholder={Locale.modelPlaceholder}
                                onChange={this.handleChangeModelName}
                            />
                            <Button onClick={this.addModel} bsStyle="primary">{Locale.addModel}</Button>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleClosePackageModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.newModal} onHide={this.handleCloseNewModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.modalNewHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{Locale.modalNewText}</p>
                        <FormControl
                            bsSize="small"
                            type="text"
                            value={this.state.newName}
                            placeholder={Locale.handleChangeNewName}
                            onChange={this.handleChangeNewName}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseNewModal}>{Locale.close}</Button>
                        <Button onClick={this.handleNew} bsStyle="primary">{Locale.confirm}</Button>
                    </Modal.Footer>
                </Modal>

            </div>
        );
    }

}

ElementPanel.defaultProps = {};