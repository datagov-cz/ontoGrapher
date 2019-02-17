import React from 'react';
import {LanguagePool} from "../config/LanguagePool";
import {Locale} from "../config/Locale";
import {ButtonGroup, DropdownButton, FormControl, MenuItem, Button, Modal, FormGroup, Form} from "react-bootstrap";

import {LocaleHelp} from "../config/LocaleHelp";


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
            name: this.props.name,
            language: this.props.language,
            languageName: "",
            notes: this.props.notes
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
    }

    handleChangeNotes(event){
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

    handleOpenLanguagesModal() {
        this.setState({modalSettingsLanguage: true});
    }

    handleCloseLanguagesModal() {
        this.setState({modalSettingsLanguage: false});
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
        this.handleCloseLoadModal();
        this.props.handleDeserialize(this.state.modalLoadValue);
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
    }

    render() {

        let languagePool = Object.keys(LanguagePool).map((language, i) => {
            return (
                <option key={language} value={language}>{LanguagePool[language]}</option>
            )
        });
        let attrlen = languagePool.length;
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
                        </DropdownButton>
                        <DropdownButton title={Locale.menuPanelView} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem onClick={this.props.centerView} eventKey="1">{Locale.menuPanelCenter}</MenuItem>
                            <MenuItem onClick={this.props.restoreZoom} eventKey="2">{Locale.menuPanelZoom}</MenuItem>
                        </DropdownButton>
                        <DropdownButton title={Locale.menuPanelSettings} bsSize="small" id={Locale.menuPanelSettings}>
                            <MenuItem eventKey="1"
                                      onClick={this.handleOpenLanguagesModal}>{Locale.menuPanelLanguages}</MenuItem>
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
                                placeholder={Locale.detailPanelNamePlaceholder}
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
                            {Object.keys(LocaleHelp).map((obj, i) => {
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
                                size={attrlen}
                                style={{height: 12 + (attrlen) * 15}}
                            >
                                {languagePool}
                            </FormControl><br/>
                            <Form inline>
                                <Button onClick={this.deleteLanguage} bsStyle="danger">{Locale.del}</Button>
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
                </div>
            );
        }

    }

}