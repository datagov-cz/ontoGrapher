import React from 'react';
import {CardinalityPool, Languages, Links, ProjectLinks, Schemes, VocabularyElements} from "../../config/Variables";
import {Button, Form} from "react-bootstrap";
import TableList from "../../components/TableList";
import * as LocaleMain from "../../locale/LocaleMain.json";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import IRIlabel from "../../components/IRIlabel";
import IRILink from "../../components/IRILink";
import {ResizableBox} from "react-resizable";
import {graph} from "../../graph/graph";
import DescriptionTabs from "./components/DescriptionTabs";
import {getLinkOrVocabElem} from "../../function/FunctionGetVars";

interface Props {
    projectLanguage: string;
    headers: { [key: string]: { [key: string]: string } }
    id: string;
    save: Function;
}

interface State {
    iri: string,
    sourceCardinality: string;
    targetCardinality: string;
    changes: boolean;
}

export default class DetailLink extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            iri: "",
            sourceCardinality: "0",
            targetCardinality: "0",
            changes: false
        }
    }


    save() {
        ProjectLinks[this.props.id].sourceCardinality = CardinalityPool[parseInt(this.state.sourceCardinality, 10)];
        ProjectLinks[this.props.id].targetCardinality = CardinalityPool[parseInt(this.state.targetCardinality, 10)];
        ProjectLinks[this.props.id].iri = this.state.iri;
        let links = graph.getLinks();
        for (let link of links) {
            if (link.id === this.props.id) {
                switch (link.labels.length) {
                    case 1:
                        link.removeLabel(0);
                        break;
                    case 2:
                        link.removeLabel(0);
                        link.removeLabel(0);
                        break;
                    case 3:
                        link.removeLabel(0);
                        link.removeLabel(0);
                        link.removeLabel(0);
                        break;
                }
                if (ProjectLinks[this.props.id].sourceCardinality.getString() !== LocaleMain.none) {
                    link.appendLabel({
                        attrs: {text: {text: ProjectLinks[this.props.id].sourceCardinality.getString()}},
                        position: {distance: 20}
                    });
                }
                if (ProjectLinks[this.props.id].targetCardinality.getString() !== LocaleMain.none) {
                    link.appendLabel({
                        attrs: {text: {text: ProjectLinks[this.props.id].targetCardinality.getString()}},
                        position: {distance: -20}
                    });
                }
                link.appendLabel({
                    attrs: {text: {text: Links[this.state.iri].labels[this.props.projectLanguage]}},
                    position: {distance: 0.5}
                });
            }
        }
        this.props.save();
    }

    render() {
        return (<ResizableBox
            width={300}
            height={1000}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={['nw']}
            className={"details"}>
            <div>
                <h3>{getLinkOrVocabElem(this.state.iri).labels[this.props.projectLanguage]}</h3>
                {this.state.changes ?
                    <p className={"bordered"}>{LocaleMain.saveChanges}<br/><br/><Button onClick={() => {
                        this.save();
                    }}>{LocaleMain.menuPanelSave}</Button></p> : <p/>}
                <TableList headings={[LocaleMenu.linkInfo, ""]}>
                    <tr>
                        <td>
                            <span>{LocaleMain.sourceCardinality}</span>
                        </td>
                        <td>
                            <Form.Control as="select" value={this.state.sourceCardinality}
                                          onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                              this.setState({
                                                  sourceCardinality: event.currentTarget.value,
                                                  changes: true
                                              });
                                          }
                                          }>
                                {CardinalityPool.map((card, i) =>
                                    (<option key={i} value={i.toString(10)}>{card.getString()}</option>)
                                )}
                            </Form.Control>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <span>{LocaleMain.targetCardinality}</span>
                        </td>
                        <td>
                            <Form.Control as="select" value={this.state.targetCardinality}
                                          onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                              this.setState({
                                                  targetCardinality: event.currentTarget.value,
                                                  changes: true
                                              });
                                          }
                                          }>
                                {CardinalityPool.map((card, i) =>
                                    (<option key={i} value={i.toString(10)}>{card.getString()}</option>)
                                )}
                            </Form.Control>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span>{LocaleMain.linkType}</span>
                        </td>
                        <IRIlabel label={this.state.iri in Links ?
                            Links[this.state.iri].labels[this.props.projectLanguage] :
                            VocabularyElements[this.state.iri].labels[this.props.projectLanguage]
                        } iri={this.state.iri}/>
                    </tr>
                </TableList>
                <h5>{<IRILink label={this.props.headers.labels[this.props.projectLanguage]}
                              iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
                <TableList>
                    {
                        Object.keys(getLinkOrVocabElem(this.state.iri).labels).map(lang => (
                            <tr>
                                <td>{VocabularyElements[this.state.iri].labels[lang]}</td>
                                <td>{Languages[lang]}</td>
                            </tr>
                        ))
                    }
                </TableList>
                <h5>{<IRILink label={this.props.headers.inScheme[this.props.projectLanguage]}
                              iri={"http://www.w3.org/2004/02/skos/core#inScheme"}/>}</h5>
                <TableList>
                    {Object.keys(Schemes[getLinkOrVocabElem(this.state.iri).inScheme].labels).map(lang => (
                        <tr>
                            <IRIlabel
                                label={Schemes[Links[this.state.iri].inScheme].labels[lang]}
                                iri={Links[this.state.iri].inScheme}/>
                            <td>{Languages[lang]}</td>
                        </tr>
                    ))}
                </TableList>

                {Object.keys(getLinkOrVocabElem(this.state.iri).definitions).length > 0 ?
                    <div>
                        <h5>{<IRILink label={this.props.headers.definition[this.props.projectLanguage]}
                                      iri={"http://www.w3.org/2004/02/skos/core#definition"}/>}</h5>
                        <DescriptionTabs descriptions={getLinkOrVocabElem(this.state.iri).definitions}
                                         readOnly={false}/>
                    </div> : ""}
            </div>
        </ResizableBox>);
    }
}