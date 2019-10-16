import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/locale/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Table from "react-bootstrap/lib/Table";
import {LinkEndPool, LinkPool} from "../../../config/LinkVariables";

export class MenuSettingsLinks extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
    }

    render(){
        let offset = 15;
        let horizontalOffset = 100;
        let linkListItems = Object.keys(LinkPool).map((link, i) => {
            let linkEnd = LinkEndPool[LinkPool[link][0]];
            return (<tr key={i}>
                <td>{i + 1}</td>
                <td>{link}</td>
                <td>
                    <svg width={150} height={30}>
                        <line x1={0} y1={offset} x2={horizontalOffset} y2={offset} stroke="black" strokeWidth={3}
                              strokeDasharray={LinkPool[link][2] ? "10,10" : "none"}/>
                        <polygon
                            points={`${linkEnd.x1 + horizontalOffset},${linkEnd.y1 + offset} ${linkEnd.x2 + horizontalOffset},${linkEnd.y2 + offset} ${linkEnd.x3 + horizontalOffset},${linkEnd.y3 + offset} ${linkEnd.x4 + horizontalOffset},${linkEnd.y4 + offset}`}
                            style={linkEnd.fill ?
                                {fill: "black", stroke: "black", strokeWidth: 2} :
                                {fill: "#eeeeee", stroke: "black", strokeWidth: 2}}
                        />
                        <text x={horizontalOffset} y={offset} alignmentBaseline="middle" textAnchor="middle"
                              fill="white" pointerEvents="none">{linkEnd.text}</text>
                    </svg>
                </td>
            </tr>);
        });
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.linksSettings}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <br/>
                        <div height="300px">
                            <Table striped bordered hover condensed>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{Locale.name}</th>
                                    <th>{Locale.line}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {linkListItems}
                                </tbody>
                            </Table>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}