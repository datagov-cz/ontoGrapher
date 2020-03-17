import React from 'react';
import {Button, Form, Modal, Tab, Tabs} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as LocaleMain from "../../../locale/LocaleMain.json";
import {Languages, Links, StereotypeCategories, Stereotypes} from "../../../var/Variables";
import TableList from "../../../components/TableList";
// @ts-ignore
import {RIEInput} from "riek";
import {addSTP} from "../../../misc/Helper";
import {SourceData} from "../../../components/SourceData";
import * as VariableLoader from "../../../var/VariableLoader";
import {Defaults} from "../../../config/Defaults";
import {fetchRelationships} from "../../../interface/SemanticWebInterface";

interface Props {
    modal:boolean;
    close: Function;
    projectLanguage: string;
}

interface State {
    link: string;
    name: { [key: string]: string };
    changes: boolean;
    inputManual: string;
    inputTTL: string;
    inputSource:string;
}

export default class SettingsLinksModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.setState({link: Object.keys(Links)[0],
            name: Links[Object.keys(Links)[0]].labels,
            changes: false,
            inputManual: "",
            inputTTL: "",
            inputSource: ""
        })
    }

    confirm() {
        Links[this.state.link].labels = this.state.name;
        this.setState({changes: false});
    }


    replaceLinkTTL() {
        if (this.state.inputTTL !== "" && this.state.inputSource !== "") {
            fetchRelationships(this.state.inputSource, this.state.inputTTL, Defaults.relationshipIRI, false, Defaults.sourceLanguage, () => {
                this.setState({inputSource: "", inputTTL: ""});
            });
        }
    }

    addLinkTTL() {
        if (this.state.inputTTL !== "" && this.state.inputSource !== "") {
            fetchRelationships(this.state.inputSource, this.state.inputTTL, Defaults.relationshipIRI, false, Defaults.sourceLanguage, () => {
                this.setState({inputSource: "", inputTTL: ""});
            });
        }
    }


    deleteName(language: string) {
        let name = this.state.name;
        name[language] = "";
        this.setState({name: name, changes: true});

    }


    handleChangeName(event: {
        textarea: string;
    }, language: string) {
        let name = this.state.name;
        name[language] = event.textarea;
        this.setState({name: name, changes: true});
    }

    deleteLink() {
        delete Links[this.state.link];
        this.setState({
            link: Object.keys(Links)[0],
            name: Links[Object.keys(Links)[0]].labels,
            changes: false
        })
    }

    addLink() {
        if (this.state.inputManual !== "") {
            Links[this.state.inputManual] = {
                labels: VariableLoader.initLanguageObject(""),
                descriptions: VariableLoader.initLanguageObject(""),
                category: "Manual"
            };
            if (!(StereotypeCategories.includes("Manual"))){
                StereotypeCategories.push("Manual");
            }
            this.setState({inputManual: ""});
        }
    }

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMain.nodesSettings}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs id="stereotypeMenu">
                    <Tab eventKey={1} title={LocaleMain.linksSettings}>
                        <p>{LocaleMenu.selectLink}</p>
                        <Form inline>
                            <Form.Control as={"select"} value={this.state.link}
                                          onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                              this.setState({link: event.currentTarget.value});
                                          }}>
                                {Object.keys(Links).map((str) => (<option
                                    value={str}>{Links[str].labels[this.props.projectLanguage]}</option>))}
                            </Form.Control>
                            <Button onClick={() => {
                                this.deleteLink()
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

                    <Tab eventKey={2} title={LocaleMenu.addLinks}>
                        <h5>{LocaleMenu.addManually}</h5>
                        <Form inline>
                            <Form.Control
                                as={"text"}
                                value={this.state.inputManual}
                                placeholder={LocaleMain.stereotypeRDFPlaceholder}
                                onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputManual: event.currentTarget.value});
                                }}
                            />
                            <Button onClick={() => {
                                this.addLink();
                            }}>{LocaleMain.addNode}</Button>
                        </Form>
                        <h5>{LocaleMenu.addSource}</h5>
                        <Form inline>
                            <Form.Control
                                as={"text"}
                                value={this.state.inputTTL}
                                placeholder={LocaleMain.stereotypeSourcePlaceholder}
                                onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputTTL: event.currentTarget.value});
                                }}
                            />
                            <Form.Control
                                as={"text"}
                                value={this.state.inputSource}
                                placeholder={LocaleMain.stereotypeSourceNamePlaceholder}
                                onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputSource: event.currentTarget.value});
                                }}
                            />
                            <Button onClick={() => {
                                this.addLinkTTL();
                            }}>{LocaleMain.loadStereotypes}</Button>
                            <Button onClick={() => {
                                this.replaceLinkTTL();
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