import React from 'react';
import {Button, Form, Modal, Tab, Tabs} from "react-bootstrap";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import * as Locale from "../../../locale/LocaleMain.json";
import {AttributeTypePool, CardinalityPool, Languages, Stereotypes} from "../../../var/Variables";
import TableList from "../../../components/TableList";
import {Cardinality} from "../../../components/Cardinality";

interface Props {
    modal: boolean;
    close: Function;

}

interface State {
    cardinalityName1: string;
    cardinalityName2: string;
}

export default class SettingsCardinalityModal extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            cardinalityName1: "",
            cardinalityName2: ""
        };
        this.addCardinality = this.addCardinality.bind(this);
        this.deleteCardinality = this.deleteCardinality.bind(this);
    }

    addCardinality() {
        CardinalityPool.push(new Cardinality(this.state.cardinalityName1, this.state.cardinalityName2));
        this.setState({cardinalityName1: "", cardinalityName2: ""});
    }

    deleteCardinality(index: number) {
        CardinalityPool.splice(index, 1);
        this.forceUpdate();
    }

    render() {
        return (<Modal centered show={this.props.modal}>
            <Modal.Header>
                <Modal.Title>{Locale.cardinalitySettings}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <TableList headings={[""]}>
                    {CardinalityPool.map((card,i) => (
                        <tr><td>{card.getString() }&nbsp;<a href="#" onClick={()=>this.deleteCardinality(i)}>{Locale.del}</a></td></tr>
                    ))}
                </TableList>
                <h4>{Locale.createNew + Locale.cardinality}</h4>
                <Form inline>

                    <Form.Control
                        type="text"
                        value={this.state.cardinalityName1} onChange={(event: { currentTarget: { value: any; }; }) => {
                        this.setState({cardinalityName1: event.currentTarget.value});
                    }}
                        style={{width: "50px"}}
                    />
                    ..
                    <Form.Control
                        type="text"
                        value={this.state.cardinalityName2} onChange={(event: { currentTarget: { value: any; }; }) => {
                        this.setState({cardinalityName2: event.currentTarget.value});
                    }}
                        style={{width: "50px"}}
                    />
                    <Button onClick={this.addCardinality} variant="primary">{Locale.addCardinality}</Button>
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