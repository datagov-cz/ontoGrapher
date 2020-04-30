import React from 'react';
import {Links, ProjectLinks, VocabularyElements} from "../../../config/Variables";
import IRIlabel from "../../../components/IRIlabel";
import TableList from "../../../components/TableList";
import {Tab} from 'react-bootstrap';
import * as LocaleMain from "../../../locale/LocaleMain.json";
import * as LocaleMenu from "../../../locale/LocaleMenu.json";
import {getLabelOrBlank} from "../../../function/FunctionGetVars";

interface Props {
    projectLanguage: string;
    connections: string[];
    iri: string;
    eventKey: number;
}

export default class ElemConnections extends React.Component<Props> {

    render() {
        return (
            <Tab eventKey={this.props.eventKey} title={LocaleMain.connections}>
                <TableList
                    headings={[LocaleMenu.connectionVia, LocaleMenu.connectionTo, LocaleMenu.diagram]}>
                    {this.props.connections.map((conn) => {
                            return (<tr>
                                <IRIlabel
                                    label={Links[ProjectLinks[conn].iri].labels[this.props.projectLanguage]}
                                    iri={ProjectLinks[conn].iri}/>
                                <td>{getLabelOrBlank(VocabularyElements[ProjectLinks[conn].target], this.props.projectLanguage)}</td>
                                <td>{ProjectLinks[conn].diagram}</td>
                            </tr>);
                        }
                    )}
                    {this.props.iri in VocabularyElements ? VocabularyElements[this.props.iri].domainOf.map((conn: string) => {
                            let range = VocabularyElements[conn].range;
                            if (range) {
                                return (<tr>
                                    <IRIlabel label={VocabularyElements[conn].labels[this.props.projectLanguage]}
                                              iri={conn}/>
                                    <td>{getLabelOrBlank(VocabularyElements[range], this.props.projectLanguage)}</td>
                                    <td>{LocaleMenu.fromModel}</td>
                                </tr>);
                            } else return ""
                        }
                    ) : ""}
                </TableList>
            </Tab>
        );
    }
}