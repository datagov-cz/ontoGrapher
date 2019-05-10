import React from 'react';
import {
    Button,
    ButtonGroup,
    DropdownButton,
    Form,
    FormControl,
    FormGroup,
    MenuItem,
    Modal,
    Tab,
    Tabs
} from "react-bootstrap";

import {LocaleHelp} from "../config/LocaleHelp";
import {AttributeTypePool, CardinalityPool, LanguagePool, StereotypePool} from "../config/Variables";
import * as SemanticWebInterface from "../misc/SemanticWebInterface";
import {LinkEndPool, LinkPool} from "../config/LinkVariables";
import Table from "react-bootstrap/es/Table";
import {Locale} from "../config/Locale";
import {Constraint} from "../components/misc/Constraint";


export class MenuPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalSave: false,
            modalLoad: false,
            modalName: false,
            modalNew: false,
            modalHelp: false,
            modalSaveValue: "",
            modalLoadValue: "",
            modalSettingsLanguage: false,
            modalSettingsNodes: false,
            modalSettingsLinks: false,
            modalSettingsCardinalities: false,
            modalSettingsAttributeTypes: false,
            modalImportExportSettings: false,
            modalExportDiagram: false,
            modalValidate: false,
            modalConstraints: false,
            name: this.props.name,
            language: this.props.language,
            languageName: "",
            notes: this.props.notes,
            stereotypeSource: "",
            stereotypeName: "",
            stereotypeRDF: "",
            linkName: "",
            status: "",
            cardinalityName: "",
            attributeTypeName: "",
            validationInput1: "",
            validationInput2: "",
            node: StereotypePool[0],
            linkType: LinkPool[0],
            cardinality: CardinalityPool[0],
            attributeType: AttributeTypePool[0],
            exportSettingsData: "",
            exportURI: "",
            exportName: "",
            exportPrefix: "",
            importSettingsInput: "",
            constraintLink: Object.keys(LinkPool)[0],
            constraint: undefined,
            newConstraint: "",
            failure: false
        };

        this.languagePool = [];
        for (let language in LanguagePool) {
            this.languagePool.push(<option key={language} value={language}>{LanguagePool[language]}</option>)
        }
        this.handleOpenNewModal = this.handleOpenNewModal.bind(this);
        this.handleOpenSaveModal = this.handleOpenSaveModal.bind(this);
        this.handleOpenLoadModal = this.handleOpenLoadModal.bind(this);
        this.handleOpenNameModal = this.handleOpenNameModal.bind(this);
        this.handleCloseNewModal = this.handleCloseNewModal.bind(this);
        this.handleCloseSaveModal = this.handleCloseSaveModal.bind(this);
        this.handleCloseLoadModal = this.handleCloseLoadModal.bind(this);
        this.handleCloseNameModal = this.handleCloseNameModal.bind(this);
        this.handleOpenHelpModal = this.handleOpenHelpModal.bind(this);
        this.handleCloseHelpModal = this.handleCloseHelpModal.bind(this);
        this.handleOpenLanguagesModal = this.handleOpenLanguagesModal.bind(this);
        this.handleCloseLanguagesModal = this.handleCloseLanguagesModal.bind(this);
        this.handleOpenLinksModal = this.handleOpenLinksModal.bind(this);
        this.handleCloseLinksModal = this.handleCloseLinksModal.bind(this);
        this.handleOpenNodesModal = this.handleOpenNodesModal.bind(this);
        this.handleCloseNodesModal = this.handleCloseNodesModal.bind(this);
        this.handleOpenCardinalitiesModal = this.handleOpenCardinalitiesModal.bind(this);
        this.handleCloseCardinalitiesModal = this.handleCloseCardinalitiesModal.bind(this);
        this.handleOpenAttributeTypesModal = this.handleOpenAttributeTypesModal.bind(this);
        this.handleCloseAttributeTypesModal = this.handleCloseAttributeTypesModal.bind(this);
        this.handleChangeLoad = this.handleChangeLoad.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleName = this.handleName.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.focus = this.focus.bind(this);
        this.handleChangeLanguageName = this.handleChangeLanguageName.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
        this.deleteLanguage = this.deleteLanguage.bind(this);
        this.handleChangeNotes = this.handleChangeNotes.bind(this);
        this.handleChangeStereotypeSource = this.handleChangeStereotypeSource.bind(this);
        this.handleLoadStereotypes = this.handleLoadStereotypes.bind(this);
        this.handleReplaceStereotypes = this.handleReplaceStereotypes.bind(this);
        this.handleChangeNode = this.handleChangeNode.bind(this);
        this.addNode = this.addNode.bind(this);
        this.deleteNode = this.deleteNode.bind(this);
        this.addCardinality = this.addCardinality.bind(this);
        this.deleteCardinality = this.deleteCardinality.bind(this);
        this.handleChangeStereotypeName = this.handleChangeStereotypeName.bind(this);
        this.handleChangeStereotypeRDF = this.handleChangeStereotypeRDF.bind(this);
        this.handleChangeCardinality = this.handleChangeCardinality.bind(this);
        this.handleChangeCardinalityName = this.handleChangeCardinalityName.bind(this);
        this.handleChangeAttributeTypeName = this.handleChangeAttributeTypeName.bind(this);
        this.handleChangeAttributeType = this.handleChangeAttributeType.bind(this);
        this.addAttributeType = this.addAttributeType.bind(this);
        this.deleteAttributeType = this.deleteAttributeType.bind(this);
        this.handleEvaluate = this.handleEvaluate.bind(this);
        this.handleOpenValidateModal = this.handleOpenValidateModal.bind(this);
        this.handleCloseValidateModal = this.handleCloseValidateModal.bind(this);
        this.handleChangeValidationInput1 = this.handleChangeValidationInput1.bind(this);
        this.handleChangeValidationInput2 = this.handleChangeValidationInput2.bind(this);
        this.handleValidateSettings = this.handleValidateSettings.bind(this);
        this.handleValidateModel = this.handleValidateModel.bind(this);
        this.handleOpenExportDiagramModal = this.handleOpenExportDiagramModal.bind(this);
        this.handleOpenImportExportSettingsModal = this.handleOpenImportExportSettingsModal.bind(this);
        this.handleCloseExportDiagramModal = this.handleCloseExportDiagramModal.bind(this);
        this.handleCloseImportExportSettingsModal = this.handleCloseImportExportSettingsModal.bind(this);
        this.handleChangeExportName = this.handleChangeExportName.bind(this);
        this.handleChangeExportPrefix = this.handleChangeExportPrefix.bind(this);
        this.handleChangeExportURI = this.handleChangeExportURI.bind(this);
        this.handleExportSettings = this.handleExportSettings.bind(this);
        this.handleChangeImportSettingsInput = this.handleChangeImportSettingsInput.bind(this);
        this.handleImportSettings = this.handleImportSettings.bind(this);
        this.handleCloseConstraintsModal = this.handleCloseConstraintsModal.bind(this);
        this.handleOpenConstraintsModal = this.handleOpenConstraintsModal.bind(this);
        this.handleChangeConstraintLink = this.handleChangeConstraintLink.bind(this);
        this.handleChangeConstraint = this.handleChangeConstraint.bind(this);
        this.deleteConstraint = this.deleteConstraint.bind(this);
        this.handleChangeNewConstraint = this.handleChangeNewConstraint.bind(this);
        this.addConstraint = this.addConstraint.bind(this);
        this.handleValidateCurrent = this.handleValidateCurrent.bind(this);
    }

    handleValidateCurrent(){
        this.props.validateCurrent();
    }

    addConstraint(){
        this.props.addConstraint(new Constraint(this.state.newConstraint,this.state.constraintLink))
        this.setState({newConstraint: ""});
    }

    deleteConstraint(){
        this.props.deleteConstraint(this.state.constraint, this.state.constraintLink);
    }

    handleChangeNewConstraint(event){
        this.setState({newConstraint: event.target.value});
    }

    handleChangeConstraint(event){
        this.setState({constraint: event.target.value});
    }

    handleChangeConstraintLink(event){
        this.setState({constraintLink: event.target.value});
    }

    handleCloseConstraintsModal(){
        this.setState({modalConstraints: false});
    }

    handleOpenConstraintsModal(){
        this.setState({modalConstraints: true});
    }

    handleImportSettings() {
        if (this.state.importSettingsInput !== ""){
            if (!SemanticWebInterface.importSettings(this.state.importSettingsInput)){
                this.setState({failure: true});
            } else {
                this.setState({failure: false});
            }
        }
    }

    handleChangeImportSettingsInput(event) {
        this.setState({importSettingsInput: event.target.value});
    }

    handleChangeExportName(event) {
        this.setState({exportName: event.target.value});
    }

    handleChangeExportPrefix(event) {
        this.setState({exportPrefix: event.target.value});
    }

    handleChangeExportURI(event) {
        this.setState({exportURI: event.target.value});
    }

    handleExportSettings() {
        if (this.state.exportName !== "" && this.state.exportPrefix !== "" && this.state.exportURI !== ""){
            let exportData = SemanticWebInterface.exportSettings(this.state.exportName, this.state.exportPrefix, this.state.exportURI);
            this.setState({exportSettingsData: exportData});
        }
    }

    handleOpenExportDiagramModal() {
        this.props.handleExport();
        this.setState({modalExportDiagram: true});
    }

    handleCloseExportDiagramModal() {
        this.setState({modalExportDiagram: false});
    }

    handleOpenImportExportSettingsModal() {
        this.setState({modalImportExportSettings: true});
    }

    handleCloseImportExportSettingsModal() {
        this.setState({modalImportExportSettings: false});
    }

    handleValidateSettings() {
        if (this.state.validationInput1 !== ""){
            this.props.validateSettings(this.state.validationInput1);
        }
    }

    handleValidateModel() {
        if (this.state.validationInput2 !== ""){
            this.props.validateModel(this.state.validationInput2);
        }
    }

    handleChangeValidationInput1(event) {
        this.setState({validationInput1: event.target.value});
    }

    handleChangeValidationInput2(event) {
        this.setState({validationInput2: event.target.value});
    }

    handleOpenValidateModal() {
        this.setState({modalValidate: true});
    }

    handleCloseValidateModal() {
        this.setState({modalValidate: false});
    }

    handleEvaluate() {
        this.props.handleEvaluate();
    }

    handleChangeAttributeType(event){
        this.setState({attributeType: event.target.value});
    }

    addAttributeType(){
        AttributeTypePool.push(this.state.attributeTypeName);
        this.setState({attributeTypeName: ""});
    }

    deleteAttributeType(){
        AttributeTypePool.splice(AttributeTypePool.indexOf(this.state.attributeType),1);
    }

    handleChangeAttributeTypeName(event){
        this.setState({attributeTypeName: event.target.value});
    }

    handleChangeCardinalityName(event){
        this.setState({cardinalityName: event.target.value});
    }

    addCardinality(){
        CardinalityPool.push(this.state.cardinalityName);
        this.setState({cardinalityName: ""});
    }

    deleteCardinality(){
        CardinalityPool.splice(CardinalityPool.indexOf(this.state.cardinality),1);
    }

    handleChangeCardinality(event){
        this.setState({cardinality: event.target.value});
    }

    addNode() {
        if (this.state.stereotypeName !== "" && this.state.stereotypeRDF !== ""){
            StereotypePool[this.state.stereotypeRDF] = this.state.stereotypeName;
            this.setState({stereotypeRDF: "", stereotypeName: ""});
        }
    }

    handleChangeStereotypeRDF(event) {
        this.setState({stereotypeRDF: event.target.value});
    }

    handleChangeStereotypeName(event) {
        this.setState({stereotypeName: event.target.value});
    }

    deleteNode() {
        if (Object.entries(StereotypePool).length > 1) {
            delete StereotypePool[this.state.node];
        }
    }

    handleChangeNode(event) {
        this.setState({node: event.target.value});
    }

    handleReplaceStereotypes() {
        if (this.state.stereotypeSource !== ""){
            SemanticWebInterface.fetchStereotypes(this.state.stereotypeSource, true, () => {
                this.setState({status: ""});
            });
        }
    }

    handleLoadStereotypes() {
        if (this.state.stereotypeSource !== ""){
            SemanticWebInterface.fetchStereotypes(this.state.stereotypeSource, false, () => {
                this.setState({status: ""});
            });
        }
    }

    handleChangeStereotypeSource(event) {
        this.setState({stereotypeSource: event.target.value});
    }

    handleChangeNotes(event) {
        this.setState({notes: event.target.value});
    }

    addLanguage() {
        LanguagePool[this.state.languageName] = this.state.languageName;
        this.setState({languageName: ""});
    }

    deleteLanguage() {
        if (Object.entries(LanguagePool).length > 1) {
            delete LanguagePool[this.state.language];
        }
    }

    handleChangeLanguageName(event) {
        this.setState({languageName: event.target.value});
    }

    handleChangeLanguage(event) {
        this.setState({language: event.target.value});
    }

    handleChangeLoad(event) {
        this.setState({modalLoadValue: event.target.value});
    }

    handleOpenAttributeTypesModal() {
        this.setState({modalSettingsAttributeTypes: true});
    }

    handleCloseAttributeTypesModal() {
        this.setState({modalSettingsAttributeTypes: false});
    }

    handleOpenCardinalitiesModal() {
        this.setState({modalSettingsCardinalities: true});
    }

    handleCloseCardinalitiesModal() {
        this.setState({modalSettingsCardinalities: false});
    }

    handleOpenLanguagesModal() {
        this.setState({modalSettingsLanguage: true});
    }

    handleCloseLanguagesModal() {
        this.setState({modalSettingsLanguage: false});
    }

    handleOpenLinksModal() {
        this.setState({modalSettingsLinks: true});
    }

    handleCloseLinksModal() {
        this.setState({modalSettingsLinks: false});
    }

    handleCloseNodesModal() {
        this.setState({modalSettingsNodes: false});
    }

    handleOpenNodesModal() {
        this.setState({modalSettingsNodes: true});
    }


    handleOpenSaveModal() {
        this.props.handleSerialize();
        this.setState({modalSave: true});
    }

    handleOpenLoadModal() {
        this.setState({modalLoad: true});
    }

    handleOpenNameModal() {
        this.setState({modalName: true});
    }

    handleOpenNewModal() {
        this.setState({modalNew: true});
    }

    handleCloseSaveModal() {
        this.setState({modalSave: false});
    }

    handleCloseLoadModal() {
        this.setState({modalLoad: false});
    }

    handleCloseNameModal() {
        this.setState({modalName: false});
    }

    handleCloseNewModal() {
        this.setState({modalNew: false});
    }

    handleOpenHelpModal() {
        this.setState({modalHelp: true});
    }

    handleCloseHelpModal() {
        this.setState({modalHelp: false});
    }

    handleChangeName(event) {
        this.setState({name: event.target.value});
    }

    handleNew() {
        this.handleCloseNewModal();
        this.props.handleNew();
    }

    handleLoad() {
        this.props.handleDeserialize(this.state.modalLoadValue);
        setTimeout(() => {
            if (this.props.success) {
                this.handleCloseLoadModal();
            }
        }, 100);
    }

    handleName() {
        this.handleCloseNameModal();
        this.props.handleChangeName(this.state.name);
        this.props.handleChangeNotes(this.state.notes);
    }

    focus() {
        if (Object.entries(LanguagePool).length === 1) {
            this.setState({
                language: LanguagePool[0]
            });
        }
        if (Object.entries(StereotypePool).length === 1) {
            this.setState({
                node: StereotypePool[0]
            });
        }
        if (Object.entries(LinkPool).length === 1) {
            this.setState({
                link: LinkPool[0]
            });
        }
        if (CardinalityPool.length === 1) {
            this.setState({
                cardinality: CardinalityPool[0]
            });
        }
        if (AttributeTypePool.length === 1) {
            this.setState({
                attributeType: AttributeTypePool[0]
            });
        }
        if (LinkPool[this.state.constraintLink][3].length === 1){
            this.setState({
                constraint: LinkPool[this.state.constraintLink][3][0]
            });
        }
    }

    render() {
        let offset = 15;
        let horizontalOffset = 100;
        let linkListItems = Object.keys(LinkPool).map((link, i) =>{
            let linkEnd = LinkEndPool[LinkPool[link][0]];
            return(<tr key={i}>
                <td>{i+1}</td>
                <td>{link}</td>
                <td>
                    <svg width={150} height={30}>
                        <line x1={0} y1={offset} x2={horizontalOffset} y2={offset} stroke="black" strokeWidth={3} strokeDasharray={LinkPool[link][2] ? "10,10" : "none"}/>
                        <polygon
                            points={`${linkEnd.x1 + horizontalOffset},${linkEnd.y1 + offset} ${linkEnd.x2 + horizontalOffset},${linkEnd.y2 + offset} ${linkEnd.x3 + horizontalOffset},${linkEnd.y3 + offset} ${linkEnd.x4 + horizontalOffset},${linkEnd.y4 + offset}`}
                            style={linkEnd.fill ?
                                {fill: "black", stroke: "black", strokeWidth: 2} :
                                {fill: "#eeeeee", stroke: "black", strokeWidth: 2}}
                        />
                        <text x={horizontalOffset} y={offset} alignmentBaseline="middle" textAnchor="middle"
                              fill="white" pointerEvents="none">{linkEnd.text}</text>
                    </svg>
                </td>
            </tr>);
        });

        let languagePool = Object.keys(LanguagePool).map((language) => {
            return (
                <option key={language} value={language}>{LanguagePool[language]}</option>
            )
        });

        let stereotypePool = Object.keys(StereotypePool).map((stereotype) => {
            return (
                <option key={stereotype} value={stereotype}>{StereotypePool[stereotype]}</option>
            )
        });

        let cardinalityPool = Object.keys(CardinalityPool).map((cardinality) => {
            return (
                <option key={cardinality} value={CardinalityPool[cardinality]}>{CardinalityPool[cardinality]}</option>
            )
        });

        let attributeTypePool = Object.keys(AttributeTypePool).map((attributeType) => {
            return (
                <option key={attributeType} value={AttributeTypePool[attributeType]}>{AttributeTypePool[attributeType]}</option>
            )
        });
        let languagePoolLength = languagePool.length;
        let stereotypePoolLength = stereotypePool.length;
        let constraintLinkList = Object.keys(LinkPool).map((link, i) => {
                return(
                    <option key={i} value={link}>{link}</option>
                )
            });
        let constraintList = <option value={""}></option>;
        if (this.state.constraintLink !== undefined){
            constraintList = LinkPool[this.state.constraintLink][3].map((constraint, i) =>
                    <option key={i} value={i}>{constraint.statement}</option>
                );
        }

        let constraintListLength = constraintList.length;

        let validationResults = "";
        if (this.props.validationResults.length > 0){
            validationResults = this.props.validationResults.map((result) => result + "\n");
        }
        if (this.props.readOnly) {
            return (
                <div className="menuPanel">

                    <span className="left">
                        {this.props.name}
                    </span>
                    <ButtonGroup>
                        <DropdownButton title={Locale.menuPanelView} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem eventKey="1">{Locale.menuPanelCenter}</MenuItem>
                            <MenuItem eventKey="2">{Locale.menuPanelZoom}</MenuItem>
                        </DropdownButton>
                    </ButtonGroup>
                    <span className="right">
                {Locale.selectedLanguage + ": "}
                        <FormControl componentClass="select" bsSize="small" value={this.props.language}
                                     onChange={this.props.handleChangeLanguage}>
                    {languagePool}
                </FormControl>
</span>

                </div>
            );
        } else {
            return (
                <div className="menuPanel">
                    <span className="left">
                        {this.props.name}
                    </span>
                    <ButtonGroup>
                        <DropdownButton title={Locale.menuPanelFile} bsSize="small" id={Locale.menuPanelFile}>
                            <MenuItem onClick={this.handleOpenNewModal} eventKey="1">{Locale.menuPanelNew}</MenuItem>
                            <MenuItem onClick={this.handleOpenNameModal}
                                      eventKey="2">{Locale.menuPanelDiagram}</MenuItem>
                            <MenuItem onClick={this.handleOpenLoadModal}
                                      eventKey="3">{Locale.menuPanelLoad + "..."}</MenuItem>
                            <MenuItem onClick={this.handleOpenSaveModal}
                                      eventKey="4">{Locale.menuPanelSaveDiagram}</MenuItem>
                            <MenuItem onClick={this.handleOpenExportDiagramModal}
                                      eventKey="5">{Locale.menuPanelExportDiagram}</MenuItem>
                        </DropdownButton>
                        <DropdownButton title={Locale.menuPanelView} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem onClick={this.props.centerView} eventKey="1">{Locale.menuPanelCenter}</MenuItem>
                            <MenuItem onClick={this.props.restoreZoom} eventKey="2">{Locale.menuPanelZoom}</MenuItem>
                        </DropdownButton>
                        <DropdownButton title={Locale.menuPanelTools} bsSize="small" id={Locale.menuPanelTools}>
                            <MenuItem eventKey="1"
                                      onClick={this.handleEvaluate}>{Locale.menuPanelEvaluate}</MenuItem>
                            <MenuItem eventKey="2"
                                      onClick={this.handleOpenValidateModal}>{Locale.menuPanelValidate}</MenuItem>
                        </DropdownButton>
                        <DropdownButton title={Locale.menuPanelSettings} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem eventKey="1"
                                      onClick={this.handleOpenLanguagesModal}>{Locale.menuPanelLanguages}</MenuItem>
                            <MenuItem eventKey="2"
                                      onClick={this.handleOpenNodesModal}>{Locale.menuPanelStereotypes}</MenuItem>
                            <MenuItem eventKey="3"
                                      onClick={this.handleOpenLinksModal}>{Locale.menuPanelLinks}</MenuItem>
                            <MenuItem eventKey="4"
                                      onClick={this.handleOpenCardinalitiesModal}>{Locale.menuPanelCardinalities}</MenuItem>
                            <MenuItem eventKey="4"
                                      onClick={this.handleOpenAttributeTypesModal}>{Locale.menuPanelAttributeTypes}</MenuItem>
                            <MenuItem onClick={this.handleOpenImportExportSettingsModal}
                                      eventKey="5">{Locale.importExportSettings}</MenuItem>
                            <MenuItem onClick={this.handleOpenConstraintsModal}
                                      eventKey="5">{Locale.constraintSettings}</MenuItem>
                        </DropdownButton>
                        <Button onClick={this.handleOpenHelpModal} bsSize="small">
                            {Locale.menuPanelHelp}
                        </Button>
                    </ButtonGroup>
                    <span className="right">
                        {Locale.selectedLanguage + ": "}
                        <FormControl componentClass="select" bsSize="small" value={this.props.language}
                                     onChange={this.props.handleChangeLanguage}>
                            {languagePool}
                        </FormControl>
                    </span>

                    <Modal show={this.state.modalNew} onHide={this.handleCloseNewModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.menuModalNewHeading}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{Locale.menuModalNewText}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseNewModal}>{Locale.close}</Button>
                            <Button onClick={this.handleNew} bsStyle="primary">{Locale.yes}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalSave} onHide={this.handleCloseSaveModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.menuModalSaveHeading}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{Locale.menuModalSaveText}</p>
                            <FormGroup controlId="formControlsTextarea">
                                <FormControl
                                    style={{height: 150, cursor: "auto", resize: "none"}}
                                    bsSize="small"
                                    componentClass="textarea"
                                    value={this.props.saveData}
                                    disabled={true}
                                />
                            </FormGroup>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="primary" onClick={this.handleCloseSaveModal}>{Locale.confirm}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalExportDiagram} onHide={this.handleCloseExportDiagramModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.menuModalExportHeading}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{Locale.menuModalExportText}</p>
                            <FormGroup controlId="formControlsTextarea">
                                <FormControl
                                    style={{height: 150, cursor: "auto", resize: "none"}}
                                    bsSize="small"
                                    componentClass="textarea"
                                    value={this.props.exportData}
                                    disabled={true}
                                />
                            </FormGroup>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="primary"
                                    onClick={this.handleCloseExportDiagramModal}>{Locale.confirm}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalLoad} onHide={this.handleCloseNewModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.menuModalLoadHeading}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{Locale.menuModalLoadText}</p>
                            <FormGroup controlId="formControlsTextarea">
                                <FormControl
                                    style={{height: 150, resize: "none"}}
                                    bsSize="small"
                                    componentClass="textarea"
                                    placeholder={Locale.menuModalLoadPlaceholder}
                                    value={this.state.modalLoadValue}
                                    onChange={this.handleChangeLoad}
                                />
                            </FormGroup>
                            <p>{this.props.success ? "" : Locale.loadUnsuccessful}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseLoadModal}>{Locale.close}</Button>
                            <Button bsStyle="primary" onClick={this.handleLoad}>{Locale.menuPanelLoad}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalName} onHide={this.handleCloseNameModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.menuModalNameHeading}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{Locale.menuModalNameText}</p>
                            <FormControl
                                bsSize="small"
                                type="text"
                                value={this.state.name}
                                placeholder={Locale.menuModalNameHeading}
                                onChange={this.handleChangeName}
                            />
                            <p>{Locale.notes}</p>
                            <FormControl
                                style={{height: 50, resize: "none"}}
                                bsSize="small"
                                componentClass="textarea"
                                placeholder={Locale.notes}
                                value={this.state.notes}
                                onChange={this.handleChangeNotes}
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseNameModal}>{Locale.close}</Button>
                            <Button onClick={this.handleName} bsStyle="primary">{Locale.confirm}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalHelp} onHide={this.handleCloseHelpModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.menuModalHelpHeading}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {Object.keys(LocaleHelp).map((obj) => {
                                return (
                                    <p key={obj}>{LocaleHelp[obj]}</p>
                                );
                            })}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseHelpModal} bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalSettingsLanguage} onHide={this.handleCloseLanguagesModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.menuModalLanguagesHeading}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.language}
                                onChange={this.handleChangeLanguage}
                                onFocus={this.focus}
                                size={languagePoolLength}
                                style={{height: 300}}
                            >
                                {languagePool}
                            </FormControl><br/>
                            <Form inline>
                                <Button onClick={this.deleteLanguage}
                                        bsStyle="danger">{Locale.del + " " + LanguagePool[this.state.language]}</Button>
                                <FormControl
                                    type="text"
                                    value={this.state.languageName}
                                    placeholder={Locale.languageName}
                                    onChange={this.handleChangeLanguageName}
                                />
                                <Button onClick={this.addLanguage} bsStyle="primary">{Locale.addLanguage}</Button>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseLanguagesModal} bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalValidate} onHide={this.handleCloseValidateModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.validationTools}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Tabs id="validateTabs" animation={false}>
                                <Tab eventKey={1} title={Locale.validateSettings}>
                                    <p>{Locale.validateSettingsDescription}</p>
                                    <FormGroup controlId="formControlsTextarea">
                                        <FormControl
                                            style={{height: 150, resize: "none"}}
                                            bsSize="small"
                                            componentClass="textarea"
                                            placeholder={Locale.menuValidateInputPlaceholder}
                                            value={this.state.validationInput1}
                                            onChange={this.handleChangeValidationInput1}
                                        />
                                    </FormGroup>
                                    <Button onClick={this.handleValidateSettings}
                                            bsStyle="primary">{Locale.validateButton}</Button>
                                    <br/>
                                    <FormGroup controlId="formControlsTextarea">
                                        <FormControl
                                            style={{height: 150, resize: "none"}}
                                            bsSize="small"
                                            componentClass="textarea"
                                            placeholder={Locale.menuValidateInputPlaceholder}
                                            value={this.props.validationResults.length > 0 ? validationResults : Locale.noErrors}
                                            disabled={true}
                                        />
                                    </FormGroup>
                                </Tab>
                                <Tab eventKey={2} title={Locale.validateModel}>
                                    <p>{Locale.validateModelDescription}</p>
                                    <FormGroup controlId="formControlsTextarea">
                                        <FormControl
                                            style={{height: 150, resize: "none"}}
                                            bsSize="small"
                                            componentClass="textarea"
                                            placeholder={Locale.menuValidateInputPlaceholder}
                                            value={this.state.validationInput2}
                                            onChange={this.handleChangeValidationInput2}
                                        />
                                    </FormGroup>
                                    <Button onClick={this.handleValidateModel}
                                            bsStyle="primary">{Locale.validateButton}</Button>
                                    <br/>
                                    <FormGroup controlId="formControlsTextarea">
                                        <FormControl
                                            style={{height: 150, resize: "none"}}
                                            bsSize="small"
                                            componentClass="textarea"
                                            placeholder={Locale.menuValidateInputPlaceholder}
                                            value={this.props.validationResults.length > 0 ? validationResults : Locale.noErrors}
                                            disabled={true}
                                        />
                                    </FormGroup>
                                </Tab>
                                <Tab eventKey={3} title={Locale.validateCurrent}>
                                    <p>{Locale.validateCurrentDescription}</p>
                                    <Button onClick={this.handleValidateCurrent}
                                            bsStyle="primary">{Locale.validateButton}</Button>
                                    <br/>
                                    <FormGroup controlId="formControlsTextarea">
                                        <FormControl
                                            style={{height: 150, resize: "none"}}
                                            bsSize="small"
                                            componentClass="textarea"
                                            placeholder={Locale.menuValidateInputPlaceholder}
                                            value={this.props.validationResults.length > 0 ? validationResults : Locale.noErrors}
                                            disabled={true}
                                        />
                                    </FormGroup>
                                </Tab>
                            </Tabs>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseValidateModal} bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalSettingsNodes} onHide={this.handleCloseNodesModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.nodesSettings}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <FormControl
                                type="text"
                                value={this.state.stereotypeSource}
                                placeholder={Locale.stereotypeSourcePlaceholder}
                                onChange={this.handleChangeStereotypeSource}
                            />
                            <Button onClick={this.handleLoadStereotypes}
                                    bsStyle="primary">{Locale.loadStereotypes}</Button>
                            <Button onClick={this.handleReplaceStereotypes}
                                    bsStyle="primary">{Locale.replaceStereotypes}</Button>
                            <FormGroup>
                                <FormControl
                                    componentClass="select"
                                    bsSize="small"
                                    value={this.state.node}
                                    onChange={this.handleChangeNode}
                                    onFocus={this.focus}
                                    size={stereotypePoolLength}
                                    style={{height: 300}}
                                >
                                    {stereotypePool}
                                </FormControl>
                                <Button onClick={this.deleteNode}
                                        bsStyle="danger">{Locale.del + " " + StereotypePool[this.state.node]}</Button>
                            </FormGroup>
                            <Form inline>

                                <FormControl
                                    type="text"
                                    value={this.state.stereotypeName}
                                    placeholder={Locale.stereotypeNamePlaceholder}
                                    onChange={this.handleChangeStereotypeName}
                                />
                                <FormControl
                                    type="text"
                                    value={this.state.stereotypeRDF}
                                    placeholder={Locale.stereotypeRDFPlaceholder}
                                    onChange={this.handleChangeStereotypeRDF}
                                />
                                <Button onClick={this.addNode} bsStyle="primary">{Locale.addNode}</Button>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseNodesModal} bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalConstraints} onHide={this.handleCloseConstraintsModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.constraintsSettingsHeader}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{Locale.constraintHelp}</p>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.constraintLink}
                                onChange={this.handleChangeConstraintLink}
                            >
                                {constraintLinkList}
                            </FormControl>
                            <FormGroup>
                                <FormControl
                                    componentClass="select"
                                    bsSize="small"
                                    value={this.state.constraint}
                                    onChange={this.handleChangeConstraint}
                                    onFocus={this.focus}
                                    size={constraintListLength < 2 ? 2 : constraintListLength}
                                    style={{height: 300}}
                                >
                                    {constraintList}
                                </FormControl>
                                <Button onClick={this.deleteConstraint}
                                        bsStyle="danger">{Locale.del}</Button>
                            </FormGroup>
                            <Form inline>

                                <FormControl
                                    type="text"
                                    value={this.state.newConstraint}
                                    placeholder={Locale.constraintPlaceholder}
                                    onChange={this.handleChangeNewConstraint}
                                />
                                <Button onClick={this.addConstraint} bsStyle="primary">{Locale.add}</Button>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseConstraintsModal} bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalSettingsLinks} onHide={this.handleCloseLinksModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.linksSettings}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <br/>
                            <div height="300px">
                                <Table striped bordered hover condensed>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{Locale.name}</th>
                                            <th>{Locale.line}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {linkListItems}
                                    </tbody>
                                </Table>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseLinksModal} bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalSettingsCardinalities} onHide={this.handleCloseCardinalitiesModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.cardinalitySettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FormControl
                            componentClass="select"
                            bsSize="small"
                            value={this.state.cardinality}
                            onChange={this.handleChangeCardinality}
                            onFocus={this.focus}
                            size={cardinalityPool.length}
                            style={{height: 300}}
                        >
                            {cardinalityPool}
                        </FormControl><br/>
                        <Form inline>
                            <Button onClick={this.deleteCardinality}
                                    bsStyle="danger">{Locale.del + " " + CardinalityPool[CardinalityPool.indexOf(this.state.cardinality)]}</Button>
                            <FormControl
                                type="text"
                                value={this.state.cardinalityName}
                                placeholder={Locale.cardinalityName}
                                onChange={this.handleChangeCardinalityName}
                            />
                            <Button onClick={this.addCardinality} bsStyle="primary">{Locale.addCardinality}</Button>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseCardinalitiesModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>

                    <Modal show={this.state.modalSettingsAttributeTypes} onHide={this.handleCloseAttributeTypesModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.attributeTypesSettings}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.attributeType}
                                onChange={this.handleChangeAttributeType}
                                onFocus={this.focus}
                                size={attributeTypePool.length}
                                style={{height: 300}}
                            >
                                {attributeTypePool}
                            </FormControl><br/>
                            <Form inline>
                                <Button onClick={this.deleteAttributeType}
                                        bsStyle="danger">{Locale.del + " " + AttributeTypePool[AttributeTypePool.indexOf(this.state.attributeType)]}</Button>
                                <FormControl
                                    type="text"
                                    value={this.state.attributeTypeName}
                                    placeholder={Locale.attributeTypePlaceholder}
                                    onChange={this.handleChangeAttributeTypeName}
                                />
                                <Button onClick={this.addAttributeType} bsStyle="primary">{Locale.addAttributeType}</Button>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseAttributeTypesModal} bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.modalImportExportSettings}
                           onHide={this.handleCloseImportExportSettingsModal}>
                        <Modal.Header>
                            <Modal.Title>
                                {Locale.importExportTools}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Tabs id="importExportTabs" animation={false}>
                                <Tab eventKey={1} title={Locale.importSettings}>
                                    <p>{Locale.importSettingsDescription}</p>
                                    <p style={{color: "red"}}>{Locale.importSettingsWarning}</p>
                                    <FormGroup controlId="formControlsTextarea">
                                        <FormControl
                                            style={{height: 150, resize: "none"}}
                                            bsSize="small"
                                            componentClass="textarea"
                                            placeholder={Locale.menuValidateInputPlaceholder}
                                            value={this.state.importSettingsInput}
                                            onChange={this.handleChangeImportSettingsInput}
                                        />
                                    </FormGroup>
                                    <p>{this.state.failure ? Locale.errorImport : ""}</p>
                                    <Button onClick={this.handleImportSettings}
                                            bsStyle="primary">{Locale.import}</Button>
                                </Tab>
                                <Tab eventKey={2} title={Locale.exportSettings}>
                                    <p>{Locale.exportSettingsDescription}</p>
                                    <FormGroup controlId="formControlsTextarea">
                                        <FormControl
                                            bsSize="small"
                                            type="text"
                                            value={this.state.exportName}
                                            placeholder={Locale.detailPanelName}
                                            onChange={this.handleChangeExportName}
                                        />
                                        <br/>
                                        <FormControl
                                            bsSize="small"
                                            type="text"
                                            value={this.state.exportPrefix}
                                            placeholder={Locale.menuModalPrefix}
                                            onChange={this.handleChangeExportPrefix}
                                        />
                                        <br/>
                                        <FormControl
                                            bsSize="small"
                                            type="text"
                                            value={this.state.exportURI}
                                            placeholder={Locale.menuModalURI}
                                            onChange={this.handleChangeExportURI}
                                        />
                                        <br/>
                                        <Button bsStyle="primary"
                                                onClick={this.handleExportSettings}>{Locale.export}</Button>
                                        <FormControl
                                            style={{height: 150, resize: "none"}}
                                            bsSize="small"
                                            componentClass="textarea"
                                            value={this.state.exportSettingsData}
                                            disabled={true}
                                        />
                                    </FormGroup>
                                </Tab>
                            </Tabs>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleCloseImportExportSettingsModal}
                                    bsStyle="primary">{Locale.close}</Button>
                        </Modal.Footer>
                    </Modal>

                </div>
            );
        }

    }

}