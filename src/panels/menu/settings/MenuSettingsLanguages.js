import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {Form, FormControl} from "react-bootstrap";
import {AttributeTypePool, CardinalityPool, LanguagePool, LinkPool, StereotypePool} from "../../../config/Variables";

export class MenuSettingsLanguages extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state = {
            language: Object.keys(LanguagePool)[0],
        };;
        this.focus = this.focus.bind(this);
        this.handleChangeLanguageName = this.handleChangeLanguageName.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
        this.deleteLanguage = this.deleteLanguage.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.handleChangeLanguageCode = this.handleChangeLanguageCode.bind(this);
    }

    focus() {
        if (Object.entries(LanguagePool).length === 1) {
            this.setState({
                language: LanguagePool[0],
                languageName: "",
                languageCode: ""
            });
        }
    }

    addLanguage() {
        LanguagePool[this.state.languageCode] = this.state.languageName;
        let nodes = this.props.canvas.engine.getDiagramModel().getNodes();
        let links = this.props.canvas.engine.getDiagramModel().getLinks();
        for (let node in nodes){
            nodes[node].names[this.state.languageCode] = Locale.untitled;
            nodes[node].notes[this.state.languageCode] = "";
            nodes[node].attributes[this.state.languageCode] = nodes[node].attributes[Object.keys(LanguagePool)[0]];
        }
        for (let link in links){
            links[link].names[this.state.languageCode] = Locale.none;
            links[link].notes[this.state.languageCode] = "";
        }
        
        this.setState({languageName: "", languageCode: ""});
    }

    deleteLanguage() {
        if (Object.entries(LanguagePool).length > 1) {
            delete LanguagePool[this.state.language];
        }
    }

    handleChangeLanguageName(event) {
        this.setState({languageName: event.target.value});
    }

    handleChangeLanguageCode(event) {
        this.setState({languageCode: event.target.value});
    }

    handleChangeLanguage(event) {
        this.setState({language: event.target.value});
    }


    render(){
        let languagePool = Object.keys(LanguagePool).map((language) => {
            return (
                <option key={language} value={language}>{LanguagePool[language]}</option>
            )
        });

        let languagePoolLength = languagePool.length;

        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
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
                        <Button onClick={this.deleteLanguage}
                                bsStyle="danger">{Locale.deleteSelected}</Button>
                        <h4>{Locale.createNew+Locale.language}</h4>
                        <Form inline>

                            <FormControl
                                type="text"
                                value={this.state.languageName}
                                placeholder={Locale.languageName}
                                onChange={this.handleChangeLanguageName}
                            />
                            <FormControl
                                type="text"
                                value={this.state.languageCode}
                                placeholder={Locale.languageCode}
                                onChange={this.handleChangeLanguageCode}
                            />
                            <Button onClick={this.addLanguage} bsStyle="primary">{Locale.addLanguage}</Button>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}