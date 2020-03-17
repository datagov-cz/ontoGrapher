import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";
import {AttributeTypePool, Stereotypes} from "../../../var/Variables";
import {AttributeType} from "../../../components/AttributeType";
import TableList from "../../../components/TableList";

interface Props {
    modal:boolean;
    close: Function;

}

interface State {

    attributeTypeName: string;
    attributeTypeIRI: string;
    attributeTypeType: string;
    attributeType: string;
}

export default class SettingsAttributeTypeModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state= {
            attributeTypeName: "",
            attributeTypeIRI: "",
            attributeTypeType: "",
            attributeType: Object.keys(AttributeTypePool)[0]
        }
        this.addAttributeType = this.addAttributeType.bind(this);
    }

    addAttributeType() {
        if (this.state.attributeTypeName !== "" && this.state.attributeTypeIRI !== ""){
            AttributeTypePool[this.state.attributeTypeIRI] = {name: this.state.attributeTypeName, array:false};
            this.setState({attributeTypeName: "", attributeTypeType: "", attributeTypeIRI: ""});
        }
    }


    deleteAttributeType(string: string) {
        delete AttributeTypePool[string];

    }

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{LocaleMenu.attrSettings}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form inline>
                    <Form.Control as={"select"} value={this.state.attributeType}
                                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                      this.setState({attributeType: event.currentTarget.value});
                                  }}>
                        {Object.keys(AttributeTypePool).map((attr) => (<option
                            value={attr}>{AttributeTypePool[attr].name}</option>))}
                    </Form.Control>
                    <Button onClick={() => {
                        this.deleteAttributeType(this.state.attributeType);
                    }} variant={"danger"}>{Locale.del}</Button>
                </Form>
                <TableList headings={["",""]}>
                    <tr>
                       <td>{Locale.name}</td>
                        <td>{AttributeTypePool[this.state.attributeType].name}</td>
                    </tr>
                    <tr>
                        <td>{LocaleMenu.iri}</td>
                        <td>{this.state.attributeType}</td>

                    </tr>
                </TableList>
                <h4>{Locale.createNew + Locale.attributeType}</h4>
                <Form>

                    <Form.Control
                        as="input"
                        value={this.state.attributeTypeName}
                        placeholder={Locale.attributeTypePlaceholder}
                        onChange={(event: { currentTarget: { value: any; }; }) => {
                            this.setState({attributeTypeName: event.currentTarget.value});
                        }}
                    />
                    <Form.Control
                        as="input"
                        value={this.state.attributeTypeIRI}
                        placeholder={Locale.attributeTypeIRIPlaceholder}
                        onChange={(event: { currentTarget: { value: any; }; }) => {
                            this.setState({attributeTypeIRI: event.currentTarget.value});
                        }}
                    />
                </Form>
                <Button onClick={this.addAttributeType}
                        variant="primary">{Locale.addAttributeType}</Button>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => {
                    this.props.close();
                }} variant="secondary">{LocaleMenu.cancel}</Button>
            </Modal.Footer>
        </Modal>);
    }
}