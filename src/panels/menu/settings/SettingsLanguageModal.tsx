import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";
import TableList from "../../../components/TableList";
import {CardinalityPool, Languages, ProjectElements, ProjectLinks, ProjectSettings} from "../../../var/Variables";

interface Props {
    modal:boolean;
    close: Function;

}

interface State {
    languageCode: string;
    languageName: string;
}

export default class SettingsLanguageModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.setState({
            languageName: "",
            languageCode: ""
        });
    }

    deleteLanguage(string: string) {
        delete Languages[string];
    }
    addLanguage() {
        if (this.state.languageCode !== "" && this.state.languageName !== ""){
            for (let key of Object.keys(ProjectElements)){
                ProjectElements[key].labels[this.state.languageCode] = "";
                ProjectElements[key].descriptions[this.state.languageCode] = "";
            }
            ProjectSettings.name[this.state.languageCode] = "";
            ProjectSettings.description[this.state.languageCode] = "";

            Languages[this.state.languageCode] = this.state.languageName;
            this.setState({languageName: "", languageCode: ""});
        }


    }


    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{Locale.cardinalitySettings}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <TableList headings={["",""]}>
                    {Object.keys(Languages).map((lan,i) => (
                        <tr><td>{lan }&nbsp;<a href="#" onClick={()=>this.deleteLanguage(lan)}>{Locale.del}</a></td><td>{Languages[lan]}</td></tr>
                    ))}
                </TableList>
                <h4>{Locale.createNew + Locale.language}</h4>
                <Form inline>

                    <Form.Control
                        type="text"
                        value={this.state.languageName} placeholder={Locale.languageName} onChange={(event: { currentTarget: { value: any; }; }) => {
                        this.setState({languageName: event.currentTarget.value});
                    }}
                        style={{width: "50px"}}
                    />
                    ..
                    <Form.Control
                        type="text"
                        value={this.state.languageCode} placeholder={Locale.languageCode} onChange={(event: { currentTarget: { value: any; }; }) => {
                        this.setState({languageCode: event.currentTarget.value});
                    }}
                        style={{width: "50px"}}
                    />
                    <Button onClick={this.addLanguage} variant="primary">{Locale.addCardinality}</Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }} variant="secondary">{LocaleMenu.cancel}</Button>
            </Modal.Footer>
        </Modal>);
    }
}