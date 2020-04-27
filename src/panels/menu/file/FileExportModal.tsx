import React from 'react';
import {Button, Form, Modal, Tab, Tabs} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";
import {exportGlossary, exportModel, parsePrefix} from "../../../misc/Helper";
import {ProjectSettings} from "../../../var/Variables";

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

var structures: {[key:string]: string} = {
    "z-sgov-pojem:základní-struktura": parsePrefix("z-sgov-pojem", "základní-struktura"),
    "z-sgov-pojem:legislativní-struktura": parsePrefix("z-sgov-pojem", "legislativní-struktura"),
    "z-sgov-pojem:agendová-struktura": parsePrefix("z-sgov-pojem", "agendová-struktura"),
    "z-sgov-pojem:datová-struktura": parsePrefix("z-sgov-pojem", "datová-struktura")
};

var structuresShort: {[key:string]: string} = {
    "z-sgov-pojem:základní-struktura": "základní",
    "z-sgov-pojem:legislativní-struktura": "legislativní",
    "z-sgov-pojem:agendová-struktura": "agendová",
    "z-sgov-pojem:datová-struktura": "datová"
};

export default class FileExportModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            exportModelString: "",
            exportGlossaryString: "",
            knowledgeStructure: Object.keys(structures)[0],
            iri: "https://slovník.gov.cz/",
            type: parsePrefix("z-sgov-pojem","model")
        };
        this.exportM = this.exportM.bind(this);
        this.exportG = this.exportG.bind(this);
        this.handleExport = this.handleExport.bind(this);
    }

    handleExport(ks: string){
        this.exportG(ks);
        this.exportM(ks);
    }

    exportM(ks: string){
        exportModel(this.state.iri, this.state.type, ks, structuresShort[ks], (str: string) => {
            this.setState({exportModelString: str});
            //keep this .log
            console.log(str);
        })
    }

    exportG(ks: string){
        exportGlossary(this.state.iri, this.state.type, ks, structuresShort[ks], (str: string) => {
            this.setState({exportGlossaryString: str});
            //keep this .log
            console.log(str);
        })
    }

    render() {
        return (<Modal size={"lg"} centered show={this.props.modal} onShow={()=>{this.handleExport(this.state.knowledgeStructure)}}>
            <Modal.Header>
                <Modal.Title>{Locale.menuModalExportHeading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="knowledgeStructure">
                    <Form.Label>{Locale.knowledgeStructure}</Form.Label>
                    <Form.Control as="select" value={this.state.knowledgeStructure}
                                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                      this.setState({knowledgeStructure: event.currentTarget.value});
                                      ProjectSettings.knowledgeStructure = event.currentTarget.value;
                                      this.handleExport(event.currentTarget.value);
                                  }}>
                        {Object.keys(structures).map((key,i)=><option key={i} value={key}>{key}</option>)}
                    </Form.Control>
                    </Form.Group>
                </Form>
                <br/>
                <Tabs id={"exports"}>
                    <Tab eventKey={1} title={LocaleMenu.glossary}>
                        <Form.Control
                            style={{height: 150, resize: "none"}}
                            as={"textarea"}
                            readOnly
                            value={this.state.exportGlossaryString}
                        />
                    </Tab>
                    <Tab eventKey={2} title={LocaleMenu.model}>
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