import React from 'react';
import {Button, Form, Modal, Tab, Tabs} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";
import {parsePrefix} from "../../../function/FunctionEditVars";
import {Structures, StructuresShort} from "../../../config/Variables";
import {exportGlossary, exportModel} from "../../../function/FunctionExport";

interface Props {
    modal: boolean;
    close: Function;
}

interface State {
    exportModelString: string;
    exportGlossaryString: string;
    iri: string;
    type: string;
    knowledgeStructure: string;
}

export default class FileExportModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            exportModelString: "",
            exportGlossaryString: "",
            knowledgeStructure: Object.keys(Structures)[0],
            iri: "https://slovník.gov.cz/",
            type: parsePrefix("z-sgov-pojem", "model")
        };
        this.exportM = this.exportM.bind(this);
        this.exportG = this.exportG.bind(this);
        this.handleExport = this.handleExport.bind(this);
    }

    handleExport(ks: string) {
        this.exportG(ks);
        this.exportM(ks);
    }

    exportM(ks: string) {
        exportModel(this.state.iri, this.state.type, ks, StructuresShort[ks], (str: string) => {
            this.setState({exportModelString: str});
            //keep this .log
            console.log(str);
        })
    }

    exportG(ks: string) {
        exportGlossary(this.state.iri, this.state.type, ks, StructuresShort[ks], (str: string) => {
            this.setState({exportGlossaryString: str});
            //keep this .log
            console.log(str);
        })
    }

    render() {
        return (<Modal size={"lg"} centered show={this.props.modal} onShow={() => {
            this.handleExport(this.state.knowledgeStructure)
        }}>
            <Modal.Header>
                <Modal.Title>{Locale.menuModalExportHeading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="knowledgeStructure">
                        <Form.Label>{Locale.knowledgeStructure}</Form.Label>
                        <Form.Control as="select" value={this.state.knowledgeStructure}
                                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                          this.setState({knowledgeStructure: event.currentTarget.value});
                                          this.handleExport(event.currentTarget.value);
                                      }}>
                            {Object.keys(Structures).map((key, i) => <option key={i} value={key}>{key}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Form>
                <br/>
                <Tabs id={"exports"}>
                    <Tab eventKey={LocaleMenu.glossary} title={LocaleMenu.glossary}>
                        <Form.Control
                            style={{height: 150, resize: "none"}}
                            as={"textarea"}
                            readOnly
                            value={this.state.exportGlossaryString}
                        />
                    </Tab>
                    <Tab eventKey={LocaleMenu.model} title={LocaleMenu.model}>
                        <Form.Control
                            style={{height: 150, resize: "none"}}
                            as={"textarea"}
                            readOnly
                            value={this.state.exportModelString}
                        />
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }} variant="secondary">{LocaleMenu.close}</Button>
            </Modal.Footer>
        </Modal>);
    }
}