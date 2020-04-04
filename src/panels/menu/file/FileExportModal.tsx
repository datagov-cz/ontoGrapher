import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";
import {exportProject, parsePrefix} from "../../../misc/Helper";
import {Prefixes} from "../../../var/Variables";

interface Props {
    modal: boolean;
    close: Function;
}

interface State {
    exportString: string;
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

export default class FileExportModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            exportString: "",
            knowledgeStructure: Object.keys(structures)[0],
            iri: parsePrefix("ex", Date.now().toString()),
            type: parsePrefix("z-sgov-pojem","model")
        };
        this.export = this.export.bind(this);
    }

    export(){
        exportProject(this.state.iri, this.state.type, this.state.knowledgeStructure, (str: string) => {
            this.setState({exportString: str});
            console.log(str);
        })
    }

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{Locale.menuModalExportHeading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={this.export}>
                    <Form.Group controlId="projectIRI">
                    <Form.Label>{Locale.projectIRI}</Form.Label>
                    <Form.Control
                        as={"input"}
                        value={this.state.iri}
                        onChange={(event: { currentTarget: { value: any; }; }) => {
                            this.setState({iri: event.currentTarget.value});
                        }}
                    />
                    </Form.Group>
                    <Form.Group controlId="projectType">
                    <Form.Label>{Locale.projectType}</Form.Label>
                    <Form.Control
                        as={"input"}
                        value={this.state.type}
                        onChange={(event: { currentTarget: { value: any; }; }) => {
                            this.setState({type: event.currentTarget.value});
                        }}
                    />
                    </Form.Group>
                    <Form.Group controlId="knowledgeStructure">
                    <Form.Label>{Locale.knowledgeStructure}</Form.Label>
                    <Form.Control as="select" value={this.state.knowledgeStructure}
                                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                      this.setState({knowledgeStructure: event.currentTarget.value});
                                  }}>
                        {Object.keys(structures).map((key,i)=><option key={i} value={structures[key]}>{key}</option>)}
                    </Form.Control>
                    </Form.Group>
                    <Button onClick={this.export}>{Locale.exportButton}</Button>
                </Form>
                <Form.Control
                    style={{height: 150, resize: "none"}}
                    as={"textarea"}
                    disabled
                    value={this.state.exportString}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }} variant="secondary">{LocaleMenu.cancel}</Button>
            </Modal.Footer>
        </Modal>);
    }
}