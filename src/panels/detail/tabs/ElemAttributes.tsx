import React from 'react';
import {AttributeTypePool, ProjectElements} from "../../../config/Variables";
import {AttributeObject} from "../../../datatypes/AttributeObject";
import {Form, Tab} from 'react-bootstrap';
import * as LocaleMain from "../../../locale/LocaleMain.json";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import TableList from "../../../components/TableList";
// @ts-ignore
import {RIEInput} from "riek";

interface Props {
    readOnly: boolean;
    changes: Function;
    elemID: string;
}

interface State {
    inputAttributes: AttributeObject[];
    changes: boolean;
}

export default class ElemAttributes extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            changes: false,
            inputAttributes: []
        }
    }

    prepareDetails() {
        this.setState({
            inputAttributes: ProjectElements[this.props.elemID].attributes
        });
    }

    save() {
        ProjectElements[this.props.elemID].attributes = this.state.inputAttributes;
    }

    handleChangeNameAttribute(event: { textarea: string }, pos: number) {
        let attrs = this.state.inputAttributes;
        attrs[pos].name = event.textarea;
        this.setState({
            inputAttributes: attrs,
            changes: true,
        });
    }

    createAttribute() {
        let attr = new AttributeObject("", Object.keys(AttributeTypePool)[0]);
        let attrs = this.state.inputAttributes;
        attrs.push(attr);
        this.setState({
            inputAttributes: attrs,
            changes: true,
        })
    }

    handleChangeAttributeType(event: React.FormEvent<HTMLInputElement>, i: number) {
        let attrs = this.state.inputAttributes;
        attrs[i].type = event.currentTarget.value;
        this.setState({
            inputAttributes: attrs,
            changes: true,
        })
    }

    deleteAttribute(i: number) {
        let attrs = this.state.inputAttributes;
        attrs.splice(i, 1);
        this.setState({
            inputAttributes: attrs,
            changes: true,
        })
    }

    render() {
        return (
            <Tab eventKey={LocaleMain.detailPanelAttributes} title={LocaleMain.detailPanelAttributes}>
                <TableList headings={[LocaleMenu.title, LocaleMenu.attributeType]}>
                    {this.state.inputAttributes.map((attr, i) =>
                        this.props.readOnly ? <tr key={i}>
                            <td>{attr.name.length > 0 ? attr.name : "<blank>"}</td>
                            <td>{AttributeTypePool[attr.type].name}</td>
                        </tr> : <tr key={i}>
                            <td>
                                <RIEInput
                                    className={"rieinput"}
                                    value={attr.name.length > 0 ? attr.name : "<blank>"}
                                    change={(event: { textarea: string }) => {
                                        this.handleChangeNameAttribute(event, i);
                                    }}
                                    propName="textarea"
                                />
                                &nbsp;
                                <button className={"buttonlink"} onClick={() => {
                                    this.deleteAttribute(i);
                                }}>
                                    {LocaleMenu.delete}</button>
                            </td>
                            <td>
                                <Form inline>
                                    <Form.Control as="select" value={attr.type}
                                                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                      this.handleChangeAttributeType(event, i);
                                                  }}>
                                        {Object.keys(AttributeTypePool).map((attrtype) => <option
                                            value={attrtype}>{AttributeTypePool[attrtype].name}</option>)}
                                    </Form.Control>
                                </Form>
                            </td>
                        </tr>
                    )}
                </TableList>
                <button className={"buttonlink"} onClick={() => {
                    this.createAttribute();
                }}>
                    {LocaleMenu.createAttribute}</button>
            </Tab>
        );
    }
}