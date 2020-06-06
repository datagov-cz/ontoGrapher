import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import {testContext} from "../../../interface/ContextInterface";
import {ProjectSettings} from "../../../config/Variables";

interface Props {
    modal: boolean;
    close: Function;
    loadContext: Function;
}

interface State {
    contextEndpoint: string;
    contextIRI: string;
    output: string;
}

export default class FileFetchContextModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            contextIRI: ProjectSettings.contextIRI,
            contextEndpoint: ProjectSettings.contextEndpoint,
            output: ""
        }
    }

    getOutput(response: { labels: string[], imports: string[], error: any }): string {
        if (response.labels.length === 0) {
            return "Workspace not found with error:\n" + response.error;
        } else {
            let construct = "Workspace found\nwith label(s) ";
            construct += response.labels.join("/") + "\nwith found contexts: " + response.imports.length + "\n";
            construct += response.imports.join("\n");
            return construct;
        }
    }

    render() {
        return (<Modal size="lg" centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.fileFetchContextTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={async (event: any) => {
                    event.preventDefault();
                    let out = await testContext(this.state.contextIRI, this.state.contextEndpoint);
                    let output: string = this.getOutput(out);
                    this.setState({output: output});
                }}>
                    <Form.Group controlId="formEndpoint">
                        <Form.Label>
                            {LocaleMenu.contextEndpoint}
                        </Form.Label>
                        <Form.Control placeholder={LocaleMenu.iri} value={this.state.contextEndpoint}
                                      onChange={(event: { currentTarget: { value: any; }; }) => {
                                          this.setState({contextEndpoint: event.currentTarget.value})
                                      }} required/>
                    </Form.Group>
                    <Form.Group controlId="formContextIRI">
                        <Form.Label>
                            {LocaleMenu.contextIRI}
                        </Form.Label>
                        <Form.Control placeholder={LocaleMenu.iri} value={this.state.contextIRI}
                                      onChange={(event: { currentTarget: { value: any; }; }) => {
                                          this.setState({contextIRI: event.currentTarget.value})
                                      }} required/>
                    </Form.Group>
                    <Button type="submit">{LocaleMenu.test}</Button>
                </Form>
                <br/>
                <Form>
                    <Form.Group controlId="formContextOutput">
                        <Form.Label>
                            {LocaleMenu.output}
                        </Form.Label>
                        <Form.Control value={this.state.output} as="textarea" disabled style={{height: 150}}/>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <p className={"red modal-warning"}>{LocaleMenu.fileNewModalDescription}</p>
                <Button onClick={() => {
                    this.props.loadContext(this.state.contextIRI, this.state.contextEndpoint, true);
                }}>{LocaleMenu.fetch}</Button> &nbsp; <Button onClick={() => {
                this.props.close();
            }} variant="secondary">{LocaleMenu.cancel}</Button>
            </Modal.Footer>
        </Modal>);
    }
}