import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {Form, FormControl, FormGroup, Tab, Tabs} from "react-bootstrap";
import {StereotypePool, VocabularyPool} from "../../../config/Variables";
import {LinkPool} from "../../../config/LinkVariables";
import {LocaleImportVocabularies} from "../../../config/locale/LocaleImportVocabularies";
import {DefaultVocabularies} from "../../../config/Defaults";
import {getElements} from "../../../misc/SPARQLinterface";

export class MenuSettingsVocabularies extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state={
            vocabulary: "",
            wizardStep: 1,
            sourceName: "",
            sourceIRI: "",
            sourceEndpoint: "",
            sourceTypeIRI: "",
            sourceLanguage: "",
            sourceStereotypeIRI: "",
            sourceRelationshipIRI: "",
            sourceAttributeIRI: "",
            result: true,
            vocabularyName: ""
        };
        this.focus = this.focus.bind(this);
        this.handleChangeVocabulary = this.handleChangeVocabulary.bind(this);
        this.deleteVocabulary = this.deleteVocabulary.bind(this);
        this.step1check = this.step1check.bind(this);
        this.handleChangeSourceName = this.handleChangeSourceName.bind(this);
        this.handleChangeSourceIRI = this.handleChangeSourceIRI.bind(this);
        this.incrementStep1 = this.incrementStep1.bind(this);
        this.handleChangeSourceEndpoint = this.handleChangeSourceEndpoint.bind(this);
        this.goBack = this.goBack.bind(this);
        this.handleChangeSourceTypeIRI = this.handleChangeSourceTypeIRI.bind(this);
        this.handleChangeSourceLanguage = this.handleChangeSourceLanguage.bind(this);
        this.incrementStep2 = this.incrementStep2.bind(this);
        this.step2check = this.step2check.bind(this);
        this.handleChangeSourceStereotypeIRI = this.handleChangeSourceStereotypeIRI.bind(this);
        this.handleChangeSourceRelationshipIRI = this.handleChangeSourceRelationshipIRI.bind(this);
        this.handleChangeSourceAttributeIRI = this.handleChangeSourceAttributeIRI.bind(this);
        this.incrementStep3 = this.incrementStep3.bind(this);
        this.step3check = this.step3check.bind(this);
        this.submit = this.submit.bind(this);
        this.handleChangeVocabularyName = this.handleChangeVocabularyName.bind(this);
        this.addVocabulary = this.addVocabulary.bind(this);


        this.sourceResult = "";
    }



    focus() {
        if (VocabularyPool.length === 1) {
            this.setState({
                vocabulary: VocabularyPool[0]
            });
        }
    }

    addVocabulary(){
        if (this.state.vocabularyName !== ""){
            VocabularyPool.push(this.state.vocabularyName);
            this.setState({vocabularyName: ""});
        }
    }

    handleChangeVocabularyName(event){
        this.setState({vocabularyName: event.target.value});
    }

    handleChangeVocabulary(event){
        this.setState({vocabulary: event.target.value});
    }

    handleChangeSourceName(event){
        this.setState({sourceName: event.target.value});
    }

    handleChangeSourceIRI(event){
        this.setState({sourceIRI: event.target.value});
    }

    handleChangeSourceEndpoint(event){
        this.setState({sourceEndpoint: event.target.value});
    }

    handleChangeSourceTypeIRI(event){
        this.setState({sourceTypeIRI: event.target.value});
    }

    handleChangeSourceLanguage(event){
        this.setState({sourceLanguage: event.target.value});
    }

    handleChangeSourceStereotypeIRI(event){
        this.setState({sourceStereotypeIRI: event.target.value});
    }

    handleChangeSourceRelationshipIRI(event){
        this.setState({sourceRelationshipIRI: event.target.value});
    }

    handleChangeSourceAttributeIRI(event){
        this.setState({sourceAttributeIRI: event.target.value});
    }


    step1check(){
        return this.state.sourceName !== "" && this.state.sourceIRI !== "" && this.state.sourceEndpoint !== "";
    }

    incrementStep1(){
        if (this.step1check()){
            this.setState({wizardStep: 2});
        }
    }

    step2check(){
        return this.state.sourceTypeIRI !== "" && this.state.sourceLanguage !== "";
    }

    incrementStep2(){
        if (this.step2check()){
            this.setState({wizardStep: 3});
        }
    }
    incrementStep3(){
        this.setState({wizardStep: 4});
        this.sourceResult = `{
            name: "${this.state.sourceName}",
            endpoint: "${this.state.sourceEndpoint}",
            language: "${this.state.sourceLanguage}",
            typeIRI: "${this.state.sourceTypeIRI}",
            sourceIRI: "${this.state.sourceIRI}",
            labelIRI: "http://www.w3.org/2004/02/skos/core#prefLabel",
            definitionIRI: "http://www.w3.org/2004/02/skos/core#definition",
            stereotypeIRI: ["${this.state.sourceStereotypeIRI}"],
            relationshipIRI: ["${this.state.sourceRelationshipIRI}"],
            attributeIRI: ["${this.state.sourceAttributeIRI}"]
        }`;

    }

    submit(){
        let parseResult = {
            name: this.state.sourceName,
            endpoint: this.state.sourceEndpoint,
            language: this.state.sourceLanguage,
            classIRI: this.state.sourceTypeIRI,
            sourceIRI: this.state.sourceIRI,
            labelIRI: "http://www.w3.org/2004/02/skos/core#prefLabel",
            definitionIRI: "http://www.w3.org/2004/02/skos/core#definition",
            stereotypeIRI: [this.state.sourceStereotypeIRI],
            relationshipIRI: [this.state.sourceRelationshipIRI],
            attributeIRI: [this.state.sourceAttributeIRI]
        };
        getElements(parseResult,function(){}, function(){});
        this.handleCloseModal();
    }

    step3check(){
        return this.state.sourceStereotypeIRI !== "" && this.state.sourceRelationshipIRI !== "" && this.state.sourceAttributeIRI !== "";
    }


    goBack(){
        this.setState({wizardStep: this.state.wizardStep-1});
    }


    getWizardStep(step: number){
        switch (step){
            case 1:
                return (<div>
                    <p>{LocaleImportVocabularies.intro}</p>
                    <FormControl
                        type="text"
                        value={this.state.sourceName}
                        placeholder={Locale.stereotypeNamePlaceholder}
                        onChange={this.handleChangeSourceName}
                    />
                    <FormControl
                        type="text"
                        value={this.state.sourceIRI}
                        placeholder={LocaleImportVocabularies.sourceIRIPlaceholder}
                        onChange={this.handleChangeSourceIRI}
                    />
                    <FormControl
                        type="text"
                        value={this.state.sourceEndpoint}
                        placeholder={LocaleImportVocabularies.sourceEndpointPlaceholder}
                        onChange={this.handleChangeSourceEndpoint}
                    />
                    <br />
                    <Button onClick={this.incrementStep1} bsStyle={this.step1check() ? "primary" : "danger"}>{LocaleImportVocabularies.next}</Button>
                </div>);
                break;
            case 2:
                return (<div>
                    <p>{LocaleImportVocabularies.step2}</p>
                    <FormControl
                        type="text"
                        value={this.state.sourceTypeIRI}
                        placeholder={LocaleImportVocabularies.placeholderTypeIRI}
                        onChange={this.handleChangeSourceTypeIRI}
                    />
                    <FormControl
                        type="text"
                        value={this.state.sourceLanguage}
                        placeholder={LocaleImportVocabularies.placeholderLanguage}
                        onChange={this.handleChangeSourceLanguage}
                    />
                    <br/>
                    <p>{LocaleImportVocabularies.step2explain}</p>
                    <p><code>{this.state.sourceTypeIRI === "" ? <i>{LocaleImportVocabularies.placeholderTypeIRI}</i> : this.state.sourceTypeIRI}</code></p>
                    <p><code>{this.state.sourceIRI}</code></p>
                    <Button onClick={this.goBack} bsStyle="warning">{LocaleImportVocabularies.back}</Button>
                    <Button onClick={this.incrementStep2} bsStyle={this.step2check() ? "primary" : "danger"}>{LocaleImportVocabularies.next}</Button>
                </div>);
                break;
            case 3:
                return (<div>
                    {LocaleImportVocabularies.step3}
                    <FormControl
                        type="text"
                        value={this.state.sourceStereotypeIRI}
                        placeholder={LocaleImportVocabularies.sourceStereotypeIRIPlaceholder}
                        onChange={this.handleChangeSourceStereotypeIRI}
                    />
                    <FormControl
                        type="text"
                        value={this.state.sourceRelationshipIRI}
                        placeholder={LocaleImportVocabularies.sourceRelationshipIRIPlaceholder}
                        onChange={this.handleChangeSourceRelationshipIRI}
                    />
                    <FormControl
                        type="text"
                        value={this.state.sourceAttributeIRI}
                        placeholder={LocaleImportVocabularies.sourceAttributeIRIPlaceholder}
                        onChange={this.handleChangeSourceAttributeIRI}
                    /><br/>
                    <Button onClick={this.goBack} bsStyle="warning">{LocaleImportVocabularies.back}</Button>
                    <Button onClick={this.incrementStep3} bsStyle={"primary"}>{LocaleImportVocabularies.next}</Button>
                </div>);
                break;
            case 4:
                return (<div>
                    {LocaleImportVocabularies.step4}
                    <FormControl
                        style={{height: 150, resize: "none"}}
                        bsSize="small"
                        componentClass="textarea"
                        value={this.sourceResult}
                        disabled    ={true}
                    /><br/>
                    <Button onClick={this.goBack} bsStyle="warning">{LocaleImportVocabularies.back}</Button>
                    <Button onClick={this.submit} bsStyle="success">{LocaleImportVocabularies.finish}</Button>
                    {this.state.result ? "Nice" : "Damn"}
                </div>);
                break;
        }
    }

    deleteVocabulary() {
        if (VocabularyPool.includes(this.state.vocabulary)){
            for (let i = StereotypePool.length - 1; i >= 0; i--){
                if (StereotypePool[i].source === this.state.vocabulary){
                    StereotypePool.splice(i,1);
                }
            }
            for (let link in LinkPool){
                if (LinkPool[link][6] === this.state.vocabulary){
                    delete LinkPool[link];
                }
            }
        }
        VocabularyPool.splice(VocabularyPool.indexOf(this.state.vocabulary),1);
    }

    render(){
        let vocabularyPool = VocabularyPool.map((vocabulary) => {
            return (
                <option key={vocabulary} value={vocabulary}>{vocabulary}</option>
            )
        });
        let vocabularyPoolLength = vocabularyPool.length;
        let details = "";
        let detailObject = DefaultVocabularies.find(vocabulary => {
            return vocabulary.name === this.state.vocabulary;
        })
        if (detailObject !== undefined){
            details = <div>
                <p><strong>{LocaleImportVocabularies.name}:</strong>{detailObject.name}</p>
                <p><strong>{LocaleImportVocabularies.sourceIRIPlaceholder}:</strong>{detailObject.sourceIRI}</p>
                <p><strong>SPARQL endpoint:</strong>{detailObject.endpoint}</p>
            </div>
        }


        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.vocabularySettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs id="vocabulariesTabs" animation={false}>
                            <Tab eventKey={1} title={Locale.manageVocabularies}>
                                <FormGroup>
                                    <FormControl
                                        componentClass="select"
                                        bsSize="small"
                                        value={this.state.vocabulary}
                                        onChange={this.handleChangeVocabulary}
                                        onFocus={this.focus}
                                        size={vocabularyPoolLength}
                                        style={{height: 200}}
                                    >
                                        {vocabularyPool}
                                    </FormControl>
                                    {details}
                                <br/>
                                    <Button onClick={this.deleteVocabulary}
                                            bsStyle="danger">{Locale.deleteSelected}</Button><br/>
                                    {Locale.deleteVocabWarning}

                                </FormGroup>
                                {/*<h4>{Locale.createNew+Locale.vocabulary}</h4>*/}
                                {/*<Form>*/}
                                {/*    <FormControl*/}
                                {/*        type="text"*/}
                                {/*        value={this.state.vocabularyName}*/}
                                {/*        placeholder={Locale.vocabularyPlaceholder}*/}
                                {/*        onChange={this.handleChangeVocabularyName}*/}
                                {/*    />*/}
                                {/*    <Button onClick={this.addVocabulary} bsStyle="primary">{Locale.addVocabulary}</Button>*/}
                                {/*</Form>*/}
                            </Tab>
                            <Tab eventKey={2} title={Locale.addVocabularyWizard}>
                                {this.getWizardStep(this.state.wizardStep)}
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}