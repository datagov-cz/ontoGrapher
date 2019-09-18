import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {Form, FormControl} from "react-bootstrap";
import {AttributeTypePool, CardinalityPool, LanguagePool, StereotypePool} from "../../../config/Variables";
import {LinkPool} from "../../../config/LinkVariables";

export class MenuSettingsLanguages extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state = {
            language: Object.keys(LanguagePool)[0],
        };
        this.focus = this.focus.bind(this);
        this.handleChangeLanguageName = this.handleChangeLanguageName.bind(this);
        this.addLanguage = this.addLanguage.bind(this);
        this.deleteLanguage = this.deleteLanguage.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
    }

    focus() {
        if (Object.entries(LanguagePool).length === 1) {
            this.setState({
                language: LanguagePool[0],
                languageName: "",
            });
        }
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
                        <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}