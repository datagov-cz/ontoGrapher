import React from 'react';
import {Tab} from 'react-bootstrap';
import TableList from "../../../components/TableList";
import {Diagrams} from "../../../config/Variables";
import * as LocaleMain from "../../../locale/LocaleMain.json";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";

interface Props {
    diagrams: number[];
    eventKey: number;
}

export default class ElemDiagrams extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <Tab eventKey={this.props.eventKey} title={LocaleMain.diagram}>
                <TableList headings={[LocaleMenu.diagram]}>
                    {this.props.diagrams.map((conn) =>
                        (<tr>
                            <td>{Diagrams[conn].name}</td>
                        </tr>)
                    )}
                </TableList>
            </Tab>
        );
    }
}