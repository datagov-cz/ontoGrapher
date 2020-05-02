import React from 'react';
import {Tab} from 'react-bootstrap';
import TableList from "../../../components/TableList";
import {Diagrams} from "../../../config/Variables";
import * as LocaleMain from "../../../locale/LocaleMain.json";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";

interface Props {
    diagrams: number[];
}

export default class ElemDiagrams extends React.Component<Props> {

    render() {
        return (
            <Tab title={LocaleMain.diagram} eventKey={"detail-tab-diagrams"}>
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