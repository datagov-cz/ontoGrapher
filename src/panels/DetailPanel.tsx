import React from 'react';
import {ResizableBox} from "react-resizable";
import {
    AttributeTypePool,
    CardinalityPool,
    Diagrams,
    graph,
    Languages,
    Links,
    ModelElements,
    ProjectElements,
    ProjectLinks,
    Schemes,
    Stereotypes,
    VocabularyElements
} from "../var/Variables";
import * as LocaleMain from "../locale/LocaleMain.json";
import {Button, Form, Tab, Tabs} from "react-bootstrap";
import TableList from "../components/TableList";
import * as LocaleMenu from "../locale/LocaleMenu.json";
import * as VariableLoader from "../var/VariableLoader";
import {getName, getStereotypeList, vocabOrModal} from "../misc/Helper";
// @ts-ignore
import {RIEInput} from "riek";
import {AttributeObject} from "../components/AttributeObject";
import IRIlabel from "../components/IRIlabel";
import IRILink from "../components/IRILink";

const headers: {[key:string]: {[key:string]:string}} = {
    labels: {"cs":"Název","en":"Label"},
    inScheme: {"cs":"Ze slovníku", "en":"In vocabulary"},
    definition:{"cs":"Definice", "en":"Definition"},
    stereotype:{"cs":"Stereotyp","en":"Stereotype"}
}

interface Props {
    projectLanguage: string;
    resizeElem: Function;
    update: Function;
}

interface State {
    hidden: boolean;
    changes: boolean;
    model: any;
    inputNames: { [key: string]: string };
    inputDescriptions: { [key: string]: string };
    inputAttributes: AttributeObject[];
    inputDiagrams: number[];
    sourceCardinality: string;
    targetCardinality: string;
    inputConnections: [];
    inputProperties: AttributeObject[];
    iriElem: string[];
    iriLink: string;
    iriModel: string;
    type: string;
    newStereotype: string;
    iriModelVocab: string;
}

export default class DetailPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hidden: true,
            model: undefined,
            changes: false,
            inputNames: VariableLoader.initLanguageObject(""),
            inputDescriptions: VariableLoader.initLanguageObject(""),
            inputAttributes: [],
            inputDiagrams: [],
            inputConnections: [],
            inputProperties: [],
            iriElem: [],
            iriLink: "",
            iriModel: "",
            iriModelVocab: "",
            sourceCardinality: "0",
            targetCardinality: "0",
            type: "",
            newStereotype: ""
        };
        this.hide = this.hide.bind(this);
        this.save = this.save.bind(this);
    }

    deleteName(language: string) {
        let name = this.state.inputNames;
        name[language] = "";
        this.setState({inputNames: name, changes: true});
    }

    handleChangeNameAttribute(event: { textarea: string }, pos: number) {
        let attrs = this.state.inputAttributes;
        attrs[pos].first = event.textarea;
        this.setState({inputAttributes: attrs, changes: true});
    }

    handleChangeNameProperty(event: { textarea: string }, pos: number) {
        let attrs = this.state.inputProperties;
        attrs[pos].first = event.textarea;
        this.setState({inputProperties: attrs, changes: true});
    }

    createAttribute() {
        let attr = new AttributeObject("", AttributeTypePool[Object.keys(AttributeTypePool)[0]]);
        let attrs = this.state.inputAttributes;
        attrs.push(attr);
        this.setState({inputAttributes: attrs, changes: true});
    }

    handleChangeAttributeType(event: React.FormEvent<HTMLInputElement>, i: number) {
        let attrs = this.state.inputAttributes;
        attrs[i].second = AttributeTypePool[event.currentTarget.value];
        this.setState({inputAttributes: attrs, changes: true});
    }

    handleChangeDescription(event: React.ChangeEvent<HTMLInputElement>, language: string) {
        let description = this.state.inputDescriptions;
        description[language] = event.target.value;
        this.setState({inputDescriptions: description, changes: true});
    }

    deleteAttribute(i: number) {
        let attrs = this.state.inputAttributes;
        attrs.splice(i, 1);
        this.setState({inputAttributes: attrs, changes: true});
    }

    handleChangeName(event: {
        textarea: string;
    }, language: string) {
        let name = this.state.inputNames;
        name[language] = event.textarea;
        this.setState({inputNames: name, changes: true});
    }

    hide() {
        this.setState({hidden: true});
    }

    prepareDetails(id: string) {
        if (graph.getCell(id).isElement() && ProjectElements[id].active) {
            this.setState({
                hidden: false,
                model: id,
                inputNames: ProjectElements[id].untitled ? VariableLoader.initLanguageObject("") : ProjectElements[id].names,
                inputDescriptions: ProjectElements[id].descriptions,
                inputAttributes: ProjectElements[id].attributes,
                inputDiagrams: ProjectElements[id].diagrams,
                inputConnections: ProjectElements[id].connections,
                inputProperties: ProjectElements[id].properties,
                iriElem: ProjectElements[id].iri,
                type: "elem",
                newStereotype: Object.keys(Stereotypes)[0],
                iriModelVocab: ProjectElements[id].iriVocab ? ProjectElements[id].iriVocab : ""
            });
        } else if (graph.getCell(id).isLink()) {
            this.setState({
                sourceCardinality: CardinalityPool.indexOf(ProjectLinks[id].sourceCardinality).toString(10),
                targetCardinality: CardinalityPool.indexOf(ProjectLinks[id].targetCardinality).toString(10),
                iriLink: ProjectLinks[id].iri,
                model: id,
                type: "link",
                hidden: false
            });
        } else if (graph.getCell(id).isElement() && !ProjectElements[id].active) {
            this.setState({
                type: "model",
                model: id,
                iriModel: ProjectElements[id].iri,
                inputDiagrams: ProjectElements[id].diagrams,
                inputConnections: ProjectElements[id].connections,
                hidden: false,
            });
        }
    }

    save() {
        this.setState({
            changes: false
        });
        if (this.state.type === "elem") {
            ProjectElements[this.state.model].untitled = false;
            ProjectElements[this.state.model].names = this.state.inputNames;
            ProjectElements[this.state.model].descriptions = this.state.inputDescriptions;
            ProjectElements[this.state.model].attributes = this.state.inputAttributes;
            ProjectElements[this.state.model].diagrams = this.state.inputDiagrams;
            let name = getStereotypeList(this.state.iriElem, this.props.projectLanguage).map((str)=>"«"+str.toLowerCase()+"»\n").join("") + ProjectElements[this.state.model].names[this.props.projectLanguage];
            graph.getCell(this.state.model).attr({
                label: {
                    text: name
                }
            });
            this.props.resizeElem(this.state.model);
            this.props.update();
        } else {
            ProjectLinks[this.state.model].sourceCardinality = CardinalityPool[parseInt(this.state.sourceCardinality, 10)];
            ProjectLinks[this.state.model].targetCardinality = CardinalityPool[parseInt(this.state.targetCardinality, 10)];
            ProjectLinks[this.state.model].iri = this.state.iriLink;
            let links = graph.getLinks();
            for (let link of links) {
                if (link.id === this.state.model) {
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
                    if (ProjectLinks[this.state.model].sourceCardinality.getString() !== LocaleMain.none) {
                        link.appendLabel({
                            attrs: {
                                text: {
                                    text: ProjectLinks[this.state.model].sourceCardinality.getString()
                                }
                            },
                            position: {
                                distance: 20
                            }
                        });
                    }
                    if (ProjectLinks[this.state.model].targetCardinality.getString() !== LocaleMain.none) {
                        link.appendLabel({
                            attrs: {
                                text: {
                                    text: ProjectLinks[this.state.model].targetCardinality.getString()
                                }
                            },
                            position: {
                                distance: -20
                            }
                        });
                    }
                    link.appendLabel({
                        attrs: {
                            text: {
                                text: Links[this.state.iriLink].labels[this.props.projectLanguage]
                            }
                        },
                        position: {
                            distance: 0.5
                        }
                    });
                }
            }
        }

    }

    render() {
        if (!this.state.hidden) {
            if (this.state.type === "elem") {
                return (<ResizableBox
                    width={300}
                    height={1000}
                    axis={"x"}
                    handleSize={[8, 8]}
                    resizeHandles={['nw']}
                    className={"details"}>
                    <div>
                        <h3>{this.state.inputNames[this.props.projectLanguage].length > 0 ? this.state.inputNames[this.props.projectLanguage] : "<blank>"}</h3>
                        {this.state.changes ?
                            <p className={"bordered"}>{LocaleMain.saveChanges}<br/><br/><Button onClick={() => {
                                this.save();
                            }}>{LocaleMain.menuPanelSave}</Button></p> : <p></p>}
                        <Tabs id={"detailsTabs"}>
                            <Tab eventKey={1} title={LocaleMain.description}>
                                <h5>{headers.stereotype[this.props.projectLanguage]}</h5>
                                <TableList>
                                    {this.state.iriElem.map(iri =>
                                        <tr key={iri}>
                                            <td>
                                            <IRILink
                                                label={
                                                    iri in Stereotypes ?
                                                        Stereotypes[iri].labels[this.props.projectLanguage]
                                                        : VocabularyElements[iri].labels[this.props.projectLanguage]
                                                }
                                                iri={iri}/>
                                                &nbsp;
                                                {this.state.iriElem.length === 1 ? "" : <button className={"buttonlink"} onClick={()=>{
                                                    let result = this.state.iriElem;
                                                    result.splice(result.indexOf(iri),1);
                                                    this.setState({
                                                        iriElem: result,
                                                        changes: true
                                                    });
                                                }}>
                                                    {LocaleMenu.deleteProjectName}</button>}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td>
                                            <Form inline>
                                                <Form.Control size="sm" as="select" value={this.state.newStereotype} onChange={(event)=>{this.setState({newStereotype: event.currentTarget.value})}}>
                                                    {Object.keys(Stereotypes).map((stereotype) => (<option key={stereotype} value={stereotype}>{getName(stereotype, this.props.projectLanguage)}</option>))}
                                                </Form.Control>
                                                <Button size="sm" onClick={()=>{
                                                    let result = this.state.iriElem;
													if (!(this.state.iriElem.includes(this.state.newStereotype))){
														result.push(this.state.newStereotype);
                                                    this.setState({
                                                        iriElem: result,
                                                        changes: true,
                                                        newStereotype: Object.keys(Stereotypes)[0]
                                                    })
													}
                                                    
                                                }}>{LocaleMain.add}</Button>
                                            </Form>
                                        </td>
                                    </tr>
                                </TableList>

                                <h5>{<IRILink label={headers.labels[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
                                <TableList>
                                    {Object.keys(this.state.inputNames).map((language) => (
                                        <tr key={language}>
                                            <td>
                                                <RIEInput
                                                    className={"rieinput"}
                                                    value={this.state.inputNames[language].length > 0 ? this.state.inputNames[language] : "<blank>"}
                                                    change={(event: { textarea: string }) => {
                                                        this.handleChangeName(event, language);
                                                    }}
                                                    propName="textarea"
                                                />
                                                &nbsp;
                                                <button className={"buttonlink"} onClick={() => this.deleteName(language)}>
                                                    {LocaleMenu.deleteProjectName}</button>
                                            </td>
                                            <td>{Languages[language]}</td>
                                        </tr>
                                    ))}
                                </TableList>
                                <h5>{<IRILink label={headers.inScheme[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#inScheme"}/>}</h5>
                                <TableList>
                                    {Object.keys(Schemes[ProjectElements[this.state.model].scheme].labels).map(lang => (
                                        <tr>
                                            <IRIlabel
                                                label={Schemes[ProjectElements[this.state.model].scheme].labels[lang].length === 0 ? "<blank>" : Schemes[ProjectElements[this.state.model].scheme].labels[lang]}
                                                iri={ProjectElements[this.state.model].scheme}/>
                                            <td>{Languages[lang]}</td>
                                        </tr>
                                    ))}
                                </TableList>
                                {Object.keys(this.state.inputDescriptions).length > 0 ? <h5>{<IRILink label={headers.definition[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#definition"}/>}</h5> : ""}
                                <Tabs id={"descriptions"}>
                                    {Object.keys(this.state.inputDescriptions).map((language, i) => (
                                        <Tab eventKey={i} title={Languages[language]}>
                                            <Form.Control
                                                as={"textarea"}
                                                rows={3}
                                                value={this.state.inputDescriptions[language]}
                                                onChange={(event: React.ChangeEvent<HTMLInputElement>)=>{this.handleChangeDescription(event,language)}}
                                            />
                                        </Tab>))}
                                </Tabs>
                            </Tab>
                            <Tab eventKey={2} title={LocaleMain.detailPanelAttributes}>
                                <TableList headings={[LocaleMenu.title, LocaleMenu.attributeType]}>
                                    {this.state.inputAttributes.map((attr, i) => (
                                        <tr key={i}>
                                            <td>
                                                <RIEInput
                                                    className={"rieinput"}
                                                    value={attr.first.length > 0 ? attr.first : "<blank>"}
                                                    change={(event: { textarea: string }) => {
                                                        this.handleChangeNameAttribute(event, i);
                                                    }}
                                                    propName="textarea"
                                                />
                                                &nbsp;
                                                <button className={"buttonlink"} onClick={(event) => {
                                                    this.deleteAttribute(i);
                                                }}>
                                                    {LocaleMenu.delete}</button>
                                            </td>
                                            <td>
                                                <Form inline>
                                                    <Form.Control as="select" value={attr.second.iri}
                                                                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                                      this.handleChangeAttributeType(event, i);
                                                                  }}>
                                                        {Object.keys(AttributeTypePool).map((attrtype) => <option
                                                            value={attrtype}>{AttributeTypePool[attrtype].name}</option>)}
                                                    </Form.Control>
                                                </Form>
                                            </td>
                                        </tr>
                                    ))}
                                </TableList>
                                <button className={"buttonlink"} onClick={(event) => {
                                    this.createAttribute();
                                }}>
                                    {LocaleMenu.createAttribute}</button>
                            </Tab>
                            <Tab eventKey={3} title={LocaleMain.diagram}>
                                <TableList headings={[LocaleMenu.diagram]}>
                                    {this.state.inputDiagrams.map((conn, i) =>
                                        (<tr><td>{Diagrams[conn].name}</td></tr>)
                                    )}
                                </TableList>
                            </Tab>
                            <Tab eventKey={4} title={LocaleMain.connections}>
                                <TableList
                                    headings={[LocaleMenu.connectionVia, LocaleMenu.connectionTo, LocaleMenu.diagram]}>
                                    {this.state.inputConnections.map((conn) => {
                                            return (<tr>
                                                <IRIlabel label={Links[ProjectLinks[conn].iri].labels[this.props.projectLanguage]} iri={ProjectLinks[conn].iri}/>
                                                <td>{ProjectElements[ProjectLinks[conn].target].names[this.props.projectLanguage]}</td>
                                                <td>{ProjectLinks[conn].diagram}</td>
                                            </tr>);
                                        }
                                    )}
                                    {this.state.iriModelVocab in VocabularyElements ? VocabularyElements[this.state.iriModelVocab].domainOf.map((conn: string) => {
                                        if (conn in VocabularyElements){
                                            return (<tr>
                                                <IRIlabel label={VocabularyElements[conn].labels[this.props.projectLanguage]} iri={conn}/>
                                                <td>{VocabularyElements[conn].range in VocabularyElements ?
                                                    VocabularyElements[VocabularyElements[conn].range].labels[this.props.projectLanguage] :
                                                    ModelElements[VocabularyElements[conn].range].labels[this.props.projectLanguage]}</td>
                                                <td>{LocaleMenu.fromModel}</td>
                                            </tr>);
                                        } else {
                                            return (<tr>
                                                <IRIlabel label={ModelElements[conn].labels[this.props.projectLanguage]} iri={conn}/>
                                                <td>{ModelElements[conn].range in ModelElements ?
                                                    ModelElements[ModelElements[conn].range].labels[this.props.projectLanguage] :
                                                    VocabularyElements[ModelElements[conn].range].labels[this.props.projectLanguage]}</td>
                                                <td>{LocaleMenu.fromModel}</td>
                                            </tr>);
                                        }

                                        }
                                    ) : ""}
                                </TableList>
                            </Tab>
                            <Tab eventKey={5} title={LocaleMain.properties}>
                                <TableList headings={[LocaleMenu.title, LocaleMenu.attributeType, LocaleMenu.value]}>
                                    {this.state.inputProperties.map((prop, i) => (<tr key={i}>
                                        <td>
                                            {prop.getSecond().name}
                                        </td>
                                        <td>
                                            {prop.getSecond().array ? "[" + prop.getSecond().type + "]" : prop.getSecond().type}
                                        </td>
                                        <td>
                                            <RIEInput
                                                className={"rieinput"}
                                                value={prop.first.length > 0 ? prop.first : "<blank>"}
                                                change={(event: { textarea: string }) => {
                                                    this.handleChangeNameProperty(event, i);
                                                }}
                                                propName="textarea"
                                            />
                                        </td>
                                    </tr>))}
                                </TableList>
                            </Tab>
                        </Tabs>
                    </div>
                </ResizableBox>);
            } else if (this.state.type === "link") {
                return (
                    <ResizableBox
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
                                }}>{LocaleMain.menuPanelSave}</Button></p> : <p></p>}
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
                            {/*{ModelElements[this.state.iriLink] ?*/}
                            {/*        <TableList>*/}
                            {/*            <tr>*/}
                            {/*                <th>{LocaleMenu.domain}</th>*/}
                            {/*                <IRIlabel iri={ModelElements[this.state.iriLink].domain} label={vocabOrModal(ModelElements[this.state.iriLink].domain).labels[this.props.projectLanguage]} />*/}
                            {/*            </tr>*/}
                            {/*            <tr>*/}
                            {/*                <th>{LocaleMenu.range}</th>*/}
                            {/*                <IRIlabel iri={ModelElements[this.state.iriLink].range} label={vocabOrModal(ModelElements[this.state.iriLink].range).labels[this.props.projectLanguage]} />*/}
                            {/*            </tr>*/}
                            {/*        </TableList>*/}
                            {/*    : ""}*/}
                            <h5>{<IRILink label={headers.labels[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
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
                            <h5>{<IRILink label={headers.inScheme[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#inScheme"}/>}</h5>
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

                            {((this.state.iriLink in Links && Object.keys(Links[this.state.iriLink].skos.definition).length > 0) || (Object.keys(vocabOrModal(this.state.iriLink).skos.definition).length > 0)) ? <h5>{<IRILink label={headers.definition[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#definition"}/>}</h5> : ""}
                            <Tabs id={"descriptions"}>
                                {this.state.iriLink in Links ? Object.keys(Links[this.state.iriLink].skos.definition).map((language, i) => (
                                    <Tab eventKey={i} title={Languages[language]}>
                                        <Form.Control
                                            as={"textarea"}
                                            rows={3}
                                            disabled={true}
                                            value={Links[this.state.iriLink].skos.definition[language]}
                                        />
                                    </Tab>)):
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
                    </ResizableBox>
                );

            } else if (this.state.type === "model") {
                return (<ResizableBox
                    width={300}
                    height={1000}
                    axis={"x"}
                    handleSize={[8, 8]}
                    resizeHandles={['nw']}
                    className={"details"}>
                    <div>
                        <h3>{ModelElements[this.state.iriModel].labels[this.props.projectLanguage] ? ModelElements[this.state.iriModel].labels[this.props.projectLanguage] : "<blank>"}</h3>
                        <Tabs id={"detailsTabs"}>
                            <Tab eventKey={1} title={LocaleMain.description}>
                                <h5>{headers.stereotype[this.props.projectLanguage]}</h5>
                                            <TableList>
                                                {ModelElements[this.state.iriModel].iri.map((iri: any) =>
                                                    <tr key={iri}><IRIlabel
                                                        label={
                                                            iri in Stereotypes ?
                                                                Stereotypes[iri].labels[this.props.projectLanguage]
                                                                : VocabularyElements[iri].labels[this.props.projectLanguage]
                                                        }
                                                        iri={iri}/>
                                                    </tr>
                                                )}
                                            </TableList>

                                            {ModelElements[this.state.iriModel].domain && ModelElements[this.state.iriModel].range ?
                                                <div>
                                                    <br />
                                                <TableList>
                                                    <tr>
                                                        <th>{LocaleMenu.domain}</th>
                                                        <IRIlabel iri={ModelElements[this.state.iriModel].domain} label={ModelElements[ModelElements[this.state.iriModel].domain].labels[this.props.projectLanguage]} />
                                                    </tr>
                                                    <tr>
                                                        <th>{LocaleMenu.range}</th>
                                                        <IRIlabel iri={ModelElements[this.state.iriModel].range} label={ModelElements[ModelElements[this.state.iriModel].range].labels[this.props.projectLanguage]} />
                                                    </tr>
                                                </TableList>
                                                </div>
                                                : ""}
                                    <h5>{<IRILink label={headers.labels[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
                                    <TableList>
                                        {Object.keys(ModelElements[this.state.iriModel].skos.prefLabel).map(lang => (
                                            <tr>
                                                <td>{ModelElements[this.state.iriModel].skos.prefLabel[lang]}</td>
                                                <td>{Languages[lang]}</td>
                                            </tr>
                                        ))}
                                    </TableList>
                                            <h5>{<IRILink label={headers.inScheme[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#inScheme"}/>}</h5>
                                            <TableList>
                                                {Object.keys(Schemes[ModelElements[this.state.iriModel].skos.inScheme].labels).map(lang => (
                                                    <tr>
                                                        <IRIlabel
                                                            label={Schemes[ModelElements[this.state.iriModel].skos.inScheme].labels[lang]}
                                                            iri={ModelElements[this.state.iriModel].skos.inScheme}/>
                                                        <td>{Languages[lang]}</td>
                                                    </tr>
                                                ))}
                                            </TableList>
                                {Object.keys(ModelElements[this.state.iriModel].skos.definition).length > 0 ? <h5>{<IRILink label={headers.definition[this.props.projectLanguage]} iri={"http://www.w3.org/2004/02/skos/core#definition"}/>}</h5> : ""}
                                            <Tabs id={"descriptions"}>
                                                {Object.keys(ModelElements[this.state.iriModel].skos.definition).map((language, i) => (
                                                    <Tab eventKey={i} title={Languages[language]}>
                                                        <Form.Control
                                                            as={"textarea"}
                                                            rows={3}
                                                            disabled={true}
                                                            value={ModelElements[this.state.iriModel].skos.definition[language]}
                                                        />
                                                    </Tab>))}
                                            </Tabs>
                                    </Tab>
                            <Tab eventKey={2} title={LocaleMain.detailPanelAttributes}>
                                <TableList headings={[LocaleMenu.title, LocaleMenu.attributeType]}>
                                    {this.state.inputAttributes.map((attr, i) => (
                                        <tr key={i}>
                                            <td>
                                                <tr>
                                                    {attr.first.length > 0 ? attr.first : "<blank>"}
                                                </tr>
                                            </td>
                                            <td>
                                                {attr.second.name}
                                            </td>
                                        </tr>
                                    ))}
                                </TableList>
                            </Tab>
                            <Tab eventKey={3} title={LocaleMain.diagram}>
                                        <TableList headings={[LocaleMenu.diagram]}>
                                            {this.state.inputDiagrams.map((conn, i) =>
                                                (<tr><td>{Diagrams[conn].name}</td></tr>)
                                            )}
                                        </TableList>
                </Tab>
                            <Tab eventKey={4} title={LocaleMain.connections}>
                                <TableList
                                    headings={[LocaleMenu.connectionVia, LocaleMenu.connectionTo, LocaleMenu.diagram]}>
                                    {this.state.inputConnections.map((conn) => {
                                            return (<tr>
                                                <IRIlabel label={Links[ProjectLinks[conn].iri].labels[this.props.projectLanguage]} iri={ProjectLinks[conn].iri}/>
                                                <td>{ProjectElements[ProjectLinks[conn].target].names[this.props.projectLanguage]}</td>
                                                <td>{ProjectLinks[conn].diagram}</td>
                                            </tr>);
                                        }
                                    )}
                                    {ModelElements[this.state.iriModel].domainOf.map((conn: string) => {
                                        if (vocabOrModal(conn) && vocabOrModal(vocabOrModal(conn).range)){
                                            return (<tr>
                                                <IRIlabel label={vocabOrModal(conn).labels[this.props.projectLanguage]} iri={conn}/>
                                                <td>{vocabOrModal(vocabOrModal(conn).range).labels[this.props.projectLanguage]}</td>
                                                <td>{LocaleMenu.fromModel}</td>
                                            </tr>);
                                        } else return "";
                                        }
                                    )}
                                </TableList>
                            </Tab>
                            <Tab eventKey={5} title={LocaleMain.properties}>
                                    <TableList headings={[LocaleMenu.title, LocaleMenu.attributeType, LocaleMenu.value]}>
                                        {this.state.inputProperties.map((prop, i) => (<tr key={i}>
                                            <td>
                                                {prop.getSecond().name}
                                            </td>
                                            <td>
                                                {prop.getSecond().array ? "[" + prop.getSecond().type + "]" : prop.getSecond().type}
                                            </td>
                                            <td>
                                                {prop.first.length > 0 ? prop.first : "<blank>"}
                                            </td>
                                        </tr>))}
                                    </TableList>
                            </Tab>
                        </Tabs>
                    </div>
                </ResizableBox>);
            }
        } else {
            return (<div/>);
        }

    }

}