import React from 'react';
import {Button, Form, Modal, Tab, Tabs} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as LocaleMain from "../../../locale/LocaleMain.json";
import TableList from "../../../components/TableList";
import {Languages, ProjectSettings, Stereotypes} from "../../../var/Variables";
// @ts-ignore
import {RIEInput} from "riek";
import {SourceData} from "../../../components/SourceData";
import {addSTP} from "../../../misc/Helper";
import {Defaults} from "../../../config/Defaults";
import {fetchClasses} from "../../../interface/SemanticWebInterface";

interface Props {
    modal: boolean;
    close: Function;
    projectLanguage: string;
    update: Function;
}

interface State {
    stereotype: string;
    name: { [key: string]: string };
    changes: boolean;
    inputManual: string;
    inputTTL: string;
    inputSource:string;
}

export default class SettingsStereotypeModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            stereotype: Object.keys(Stereotypes)[0],
            name: Stereotypes[Object.keys(Stereotypes)[0]].labels,
            changes: false,
            inputManual: "",
            inputTTL: "",
            inputSource: ""
        }
    }

    addStereotype() {
        if (this.state.inputManual !== "") {
            addSTP(new SourceData(this.state.inputManual, this.state.inputManual, "", "Manual"));
            this.setState({inputManual: ""});
        }
    }

    deleteName(language: string) {
        let name = this.state.name;
        name[language] = "";
        this.setState({name: name, changes: true});

    }
    addStereotypeTTL(){
        if (this.state.inputTTL !== "" && this.state.inputSource !== "") {
            fetchClasses(this.state.inputSource, this.state.inputTTL, Defaults.classIRI, true, Defaults.sourceLanguage, () => {
                this.setState({inputTTL: "", inputSource:""});
            });
        }
    }

    replaceStereotypeTTL(){
        if (this.state.inputTTL !== "" && this.state.inputSource !== "") {
            fetchClasses(this.state.inputSource, this.state.inputTTL, Defaults.classIRI, false, Defaults.sourceLanguage, () => {
                this.setState({inputTTL: "", inputSource:""});
            });
        }
    }


    deleteStereotype() {
        delete Stereotypes[this.state.stereotype];
        this.setState({
            stereotype: Object.keys(Stereotypes)[0],
            name: Stereotypes[Object.keys(Stereotypes)[0]].labels,
            changes: false
        });
        this.props.update();
    }

    confirm() {
        Stereotypes[this.state.stereotype].labels = this.state.name;
        this.setState({changes: false});
        this.props.update();
    }

    handleChangeName(event: {
        textarea: string;
    }, language: string) {
        let name = this.state.name;
        name[language] = event.textarea;
        this.setState({name: name, changes: true});
    }

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMain.nodesSettings}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs id="stereotypeMenu">
                    <Tab eventKey={1} title={LocaleMenu.editStereotype}>
                        <p>{LocaleMenu.selectStereotype}</p>
                        <Form inline>
                            <Form.Control as={"select"} value={this.state.stereotype}
                                          onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                              this.setState({stereotype: event.currentTarget.value, name: Stereotypes[event.currentTarget.value].labels});
                                          }}>
                                {Object.keys(Stereotypes).map((str) => (<option
                                    value={str}>{Stereotypes[str].labels[this.props.projectLanguage]}</option>))}
                            </Form.Control>
                            <Button onClick={() => {
                                this.deleteStereotype()
                            }} variant={"danger"}>{LocaleMain.del}</Button>
                        </Form>
                        <div className={"fixed"}>
                            <TableList headings={[LocaleMenu.fileProjectSettingsTitles, LocaleMenu.language]}>
                                {Object.keys(Languages).map((language) => (
                                    <tr key={language}>
                                        <td>
                                            <RIEInput
                                                className={"rieinput"}
                                                value={this.state.name[language].length > 0 ? this.state.name[language] : "<blank>"}
                                                change={(event: { textarea: string }) => {
                                                    this.handleChangeName(event, language);
                                                }}
                                                propName="textarea"
                                            />
                                            &nbsp;
                                            <a href="#" onClick={() => this.deleteName(language)}>
                                                {LocaleMenu.deleteProjectName}</a>
                                        </td>
                                        <td>{Languages[language]}</td>
                                    </tr>
                                ))}
                            </TableList>
                        </div>
                        <p style={{display: (this.state.changes ? "inline-block" : "disabled")}}
                           className={"red modal-warning"}>{LocaleMenu.saveWarning}</p>
                        <Button onClick={() => {
                            this.confirm();
                        }}>{LocaleMenu.confirm}</Button>
                    </Tab>

                    <Tab eventKey={2} title={LocaleMenu.addStereotypes}>
                        <h5>{LocaleMenu.addManually}</h5>
                        <Form inline>
                            <Form.Control
                                as={"input"}
                                value={this.state.inputManual}
                                placeholder={LocaleMain.stereotypeRDFPlaceholder}
                                onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputManual: event.currentTarget.value});
                                }}
                            />
                            <Button onClick={() => {
                                this.addStereotype();
                            }}>{LocaleMain.addNode}</Button>
                        </Form>
                        <h5>{LocaleMenu.addSource}</h5>
                        <Form inline>
                            <Form.Control
                                as={"input"}
                                value={this.state.inputTTL}
                                placeholder={LocaleMain.stereotypeSourcePlaceholder}
                                onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputTTL: event.currentTarget.value});
                                }}
                            />
                            <Form.Control
                                as={"input"}
                                value={this.state.inputSource}
                                placeholder={LocaleMain.stereotypeSourceNamePlaceholder}
                                onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputSource: event.currentTarget.value});
                                }}
                            />
                            <Button onClick={() => {
                                this.addStereotypeTTL();
                            }}>{LocaleMain.loadStereotypes}</Button>
                            <Button onClick={() => {
                                this.replaceStereotypeTTL();
                            }}>{LocaleMain.replaceStereotypes}</Button>
                        </Form>
                    </Tab>
                </Tabs>


            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }} variant="secondary">{LocaleMenu.cancel}</Button>
            </Modal.Footer>
        </Modal>);
    }
}