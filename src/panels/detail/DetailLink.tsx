import React from 'react';
import {CardinalityPool, Languages, Links, ModelElements, Schemes, VocabularyElements} from "../../config/Variables";
import {vocabOrModal} from "../../function/FunctionEditVars";
import * as LocaleMain from "../../locale/LocaleMain.json";
import {Button, Form, Tab, Tabs} from "react-bootstrap";
import TableList from "../../components/TableList";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import IRIlabel from "../../components/IRIlabel";
import IRILink from "../../components/IRILink";
import {ResizableBox} from "react-resizable";

interface Props {

}

interface State {

}

export default class DetailLink extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
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
                <h3>{this.state.iriLink in Links ? Links[this.state.iriLink].labels[this.props.projectLanguage] : vocabOrModal(this.state.iriLink).labels[this.props.projectLanguage]}</h3>
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
                        <IRIlabel label={this.state.iriLink in Links ?
                            Links[this.state.iriLink].labels[this.props.projectLanguage] :
                            this.state.iriLink in ModelElements ? ModelElements[this.state.iriLink].labels[this.props.projectLanguage] : VocabularyElements[this.state.iriLink].labels[this.props.projectLanguage]
                        } iri={this.state.iriLink}/>
                    </tr>
                </TableList>
                <h5>{<IRILink label={headers.labels[this.props.projectLanguage]}
                              iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
                <TableList>
                    {this.state.iriLink in Links ? Object.keys(Links[this.state.iriLink].skos.prefLabel).map(lang => (
                            <tr>
                                <td>{Links[this.state.iriLink].skos.prefLabel[lang]}</td>
                                <td>{Languages[lang]}</td>
                            </tr>
                        ))
                        :
                        Object.keys(vocabOrModal(this.state.iriLink).skos.prefLabel).map(lang => (
                            <tr>
                                <td>{vocabOrModal(this.state.iriLink).skos.prefLabel[lang]}</td>
                                <td>{Languages[lang]}</td>
                            </tr>
                        ))
                    }
                </TableList>
                <h5>{<IRILink label={headers.inScheme[this.props.projectLanguage]}
                              iri={"http://www.w3.org/2004/02/skos/core#inScheme"}/>}</h5>
                <TableList>
                    {this.state.iriLink in Links ? Object.keys(Schemes[Links[this.state.iriLink].skos.inScheme].labels).map(lang => (
                            <tr>
                                <IRIlabel
                                    label={Schemes[Links[this.state.iriLink].skos.inScheme].labels[lang]}
                                    iri={Links[this.state.iriLink].skos.inScheme}/>
                                <td>{Languages[lang]}</td>
                            </tr>
                        ))
                        :
                        Object.keys(Schemes[vocabOrModal(this.state.iriLink).skos.inScheme].labels).map(lang => (
                            <tr>
                                <IRIlabel
                                    label={Schemes[vocabOrModal(this.state.iriLink).skos.inScheme].labels[lang]}
                                    iri={vocabOrModal(this.state.iriLink).skos.inScheme}/>
                                <td>{Languages[lang]}</td>
                            </tr>
                        ))
                    }
                </TableList>

                {((this.state.iriLink in Links && Object.keys(Links[this.state.iriLink].skos.definition).length > 0) || (Object.keys(vocabOrModal(this.state.iriLink).skos.definition).length > 0)) ?
                    <h5>{<IRILink label={headers.definition[this.props.projectLanguage]}
                                  iri={"http://www.w3.org/2004/02/skos/core#definition"}/>}</h5> : ""}
                <Tabs id={"descriptions"}>
                    {this.state.iriLink in Links ? Object.keys(Links[this.state.iriLink].skos.definition).map((language, i) => (
                            <Tab eventKey={i} title={Languages[language]}>
                                <Form.Control
                                    as={"textarea"}
                                    rows={3}
                                    disabled={true}
                                    value={Links[this.state.iriLink].skos.definition[language]}
                                />
                            </Tab>)) :
                        Object.keys(vocabOrModal(this.state.iriLink).skos.definition).map((language, i) => (
                            <Tab eventKey={i} title={Languages[language]}>
                                <Form.Control
                                    as={"textarea"}
                                    rows={3}
                                    disabled={true}
                                    value={vocabOrModal(this.state.iriLink).skos.definition[language]}
                                />
                            </Tab>))
                    }
                </Tabs>
            </div>
        </ResizableBox>);
    }
}