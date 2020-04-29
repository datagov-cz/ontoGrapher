import React from 'react';
import {Button, Modal, Tab, Tabs, Form} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import TableList from "../../../components/TableList";
import {Languages, ProjectSettings} from "../../../config/Variables";
// @ts-ignore
// import {RIEInput} from "riek";

interface Props{
    modal: boolean;
    //saveProjectSettings: Function;
    close: Function;
}

interface State{
    name: { [key: string]: string };
    description: { [key: string]: string };
}

export default class FileProjectSettingsModal extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.deleteName = this.deleteName.bind(this);
        this.saveProjectSettings = this.saveProjectSettings.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeDescription = this.handleChangeDescription.bind(this);
        this.close = this.close.bind(this);
        this.state = {
            name: ProjectSettings.name,
            description: ProjectSettings.description
        }
    }

    deleteName(language: string){
        let name = this.state.name;
        name[language] = "";
        this.setState({name: name});
    }

    handleChangeDescription(event: React.ChangeEvent<HTMLInputElement>, language: string){
            let description = this.state.description;
            description[language] = event.target.value;
            this.setState({description: description});
    }

    handleChangeName(event: {
        textarea: string;
    }, language: string){
        let name = this.state.name;
        name[language] = event.textarea;
        this.setState({name: name});
    }

    saveProjectSettings(){
        ProjectSettings.name = this.state.name;
        ProjectSettings.description = this.state.description;
        this.props.close();
    }

    close(){
        this.setState({
            name: ProjectSettings.name,
            description: ProjectSettings.description
        });
        this.props.close();
    }

    render(){
        return(<Modal centered show={this.props.modal} size={"lg"}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.fileProjectSettingsTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>{LocaleMenu.fileProjectSettingsTitles}</h4>
                <TableList headings={[LocaleMenu.title, LocaleMenu.language]}>
                    {Object.keys(Languages).map((language,i) => (
                        <tr key={i}>
                            <td>
                                {this.state.name[language].length > 0 ? this.state.name[language] : "<blank>" }
                                {/*<RIEInput*/}
                                {/*    className={"rieinput"}*/}
                                {/*    value={this.state.name[language].length > 0 ? this.state.name[language] : "<blank>" }*/}
                                {/*    change={(event: {textarea: string}) => {*/}
                                {/*        this.handleChangeName(event, language);}}*/}
                                {/*    propName="textarea"*/}
                                {/*/>*/}
                                {/*&nbsp;*/}
                                {/*<button className={"buttonlink"} onClick={() => this.deleteName(language)}>*/}
                                {/*    {LocaleMenu.deleteProjectName}</button>*/}
                            </td>
                            <td>{Languages[language]}</td>
                        </tr>
                    ))}
                </TableList>
                <h4>{LocaleMenu.definitions}</h4>
                <Tabs id={"descriptions"}>
                    {Object.keys(Languages).map((language) => (<Tab eventKey={language} title={Languages[language]}>
                        <Form.Control
                            as={"textarea"}
                            rows={3}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.handleChangeDescription(event, language);}}
                            value={this.state.description[language]}
                        />
                    </Tab>))}
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <p className={"red modal-warning"}>{LocaleMenu.saveWarning}</p>
                <Button onClick={() => {this.close();}} variant="secondary">{LocaleMenu.cancel}</Button>
                <Button onClick={() => {this.saveProjectSettings();}}>{LocaleMenu.confirm}</Button>
            </Modal.Footer>
        </Modal>);
    }
}