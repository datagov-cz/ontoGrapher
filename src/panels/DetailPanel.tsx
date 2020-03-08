import React from 'react';
import {ResizableBox} from "react-resizable";
import {graph, Languages, ProjectElements} from "../var/Variables";
import * as LocaleMain from "../locale/LocaleMain.json";
import _ from 'underscore';
import {Button, ButtonGroup, Form, Modal, Tab, Tabs} from "react-bootstrap";
import {AttributeType} from "../components/AttributeType";
import TableList from "../components/TableList";
import * as LocaleMenu from "../locale/LocaleMenu.json";
import * as VariableLoader from "../var/VariableLoader";
import {getName} from "../misc/Helper";
// @ts-ignore
import {RIEInput} from "riek";

interface Props {
    projectLanguage: string;
}

interface State {
    hidden: boolean;
    changes: boolean;
    model: any;
    inputNames: {[key:string]: string};
    inputDescriptions: {[key:string]: string};
    inputAttributes: {[key:string]: AttributeType};
    inputDiagrams: string[];
}

export default class DetailPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hidden: true,
            model: undefined,
            changes: false,
            inputNames: VariableLoader.initLanguageObject(""),
            inputDescriptions: VariableLoader.initLanguageObject(""),
            inputAttributes: {},
            inputDiagrams: [],
        };
        this.hide = this.hide.bind(this);
        this.save = this.save.bind(this);
    }

    deleteName(language: string){
        let name = this.state.inputNames;
        name[language] = "";
        this.setState({inputNames: name});
    }

    handleChangeDescription(event: React.ChangeEvent<HTMLInputElement>, language: string){
        let description = this.state.inputDescriptions;
        description[language] = event.target.value;
        this.setState({inputDescriptions: description, changes: true});
    }

    handleChangeName(event: {
        textarea: string;
    }, language: string){
        let name = this.state.inputNames;
        name[language] = event.textarea;
        this.setState({inputNames: name, changes: true});
    }

    hide(){
        this.setState({hidden: true});
    }

    prepareDetails(id: string){
        this.setState({
            hidden: false,
            model: id,
            inputNames: ProjectElements[id].names,
            inputDescriptions: ProjectElements[id].descriptions,
            inputAttributes: ProjectElements[id].attributes,
            inputDiagrams: ProjectElements[id].diagrams,
        });

    }

    save(){
        this.setState({
           changes: false
        });
        ProjectElements[this.state.model].names = this.state.inputNames;
        ProjectElements[this.state.model].descriptions = this.state.inputDescriptions;
        ProjectElements[this.state.model].attributes = this.state.inputAttributes;
        ProjectElements[this.state.model].diagrams = this.state.inputDiagrams;
        graph.getCell(this.state.model).attr({
            label: {
                text: ProjectElements[this.state.model].names[this.props.projectLanguage]
            }
        });
    }

    render() {
        if (this.state.hidden){
            return (<div></div>)
        } else {
            return(<ResizableBox
                width={300}
                height={1000}
                axis={"x"}
                handleSize={[8, 8]}
                resizeHandles={['nw']}
                className={"details"}>
                <div>
                    <h3>{LocaleMain.detailPanelTitle}</h3>
                    {this.state.changes ? <p className={"red"}>{LocaleMain.saveChanges}</p> : <p></p>}
                    <div className={"separated"}>
                        <ButtonGroup>
                            <Button onClick={()=>{this.save();}}>{LocaleMain.menuPanelSave}</Button>
                            <Button>{LocaleMain.locate}</Button>
                        </ButtonGroup>
                    </div>
                    <Tabs id={"detailsTabs"}>
                        <Tab eventKey={1} title={LocaleMain.description}>
                            <TableList headings={[LocaleMenu.title, LocaleMenu.language]}>
                                {Object.keys(Languages).map((language) => (
                                    <tr key={language}>
                                        <td>
                                            <RIEInput
                                                className={"rieinput"}
                                                value={this.state.inputNames[language].length > 0 ? this.state.inputNames[language] : "<blank>" }
                                                change={(event: {textarea: string}) => {
                                                    this.handleChangeName(event, language);}}
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
                            <h5>{LocaleMenu.fileProjectSettingsDescriptions}</h5>
                            <Tabs id={"descriptions"}>
                                {Object.keys(Languages).map((language) => (<Tab eventKey={language} title={Languages[language]}>
                                    <Form.Control
                                        as={"textarea"}
                                        rows={3}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.handleChangeDescription(event, language);}}
                                        value={this.state.inputDescriptions[language]}
                                    />
                                </Tab>))}
                            </Tabs>
                        </Tab>
                        <Tab eventKey={2} title={LocaleMain.detailPanelAttributes}></Tab>
                        <Tab eventKey={3} title={LocaleMain.connections}></Tab>
                        <Tab eventKey={4} title={LocaleMain.diagram}></Tab>
                    </Tabs>
                </div>
            </ResizableBox>);
        }

    }
}