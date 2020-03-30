import React from 'react';
import {ResizableBox} from "react-resizable";
import {
    AttributeTypePool,
    CardinalityPool,
    Diagrams,
    graph,
    Languages,
    Links, ModelElements,
    ProjectElements,
    ProjectLinks, Schemes,
    Stereotypes
} from "../var/Variables";
import * as LocaleMain from "../locale/LocaleMain.json";
import {Button, Form, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import TableList from "../components/TableList";
import * as LocaleMenu from "../locale/LocaleMenu.json";
import * as VariableLoader from "../var/VariableLoader";
import {getName} from "../misc/Helper";
// @ts-ignore
import {RIEInput} from "riek";
import {AttributeObject} from "../components/AttributeObject";
import IRIlabel from "../components/IRIlabel";

interface Props {
    projectLanguage: string;
    resizeElem: Function;
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
    iri: string;
    type: string;
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
            iri: "",
            sourceCardinality: "0",
            targetCardinality: "0",
            type: ""
        };
        this.hide = this.hide.bind(this);
        this.save = this.save.bind(this);
    }

    deleteName(language: string) {
        let name = this.state.inputNames;
        name[language] = "";
        this.setState({inputNames: name});
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
                inputNames: ProjectElements[id].names,
                inputDescriptions: ProjectElements[id].descriptions,
                inputAttributes: ProjectElements[id].attributes,
                inputDiagrams: ProjectElements[id].diagrams,
                inputConnections: ProjectElements[id].connections,
                inputProperties: ProjectElements[id].properties,
                iri: ProjectElements[id].iri,
                type: "elem"
            });
        } else if (graph.getCell(id).isLink()) {
            this.setState({
                sourceCardinality: CardinalityPool.indexOf(ProjectLinks[id].sourceCardinality).toString(10),
                targetCardinality: CardinalityPool.indexOf(ProjectLinks[id].targetCardinality).toString(10),
                iri: ProjectLinks[id].iri,
                model: id,
                type: "link",
                hidden: false
            });
        } else if (graph.getCell(id).isElement() && !ProjectElements[id].active) {
            this.setState({
                type: "model",
                model: id,
                iri: ProjectElements[id].iri,
                hidden: false,
            });
        }
    }

    save() {
        this.setState({
            changes: false
        });
        if (this.state.type === "elem") {

            ProjectElements[this.state.model].names = this.state.inputNames;
            ProjectElements[this.state.model].descriptions = this.state.inputDescriptions;
            ProjectElements[this.state.model].attributes = this.state.inputAttributes;
            ProjectElements[this.state.model].diagrams = this.state.inputDiagrams;
            graph.getCell(this.state.model).attr({
                label: {
                    text: "«" + getName(this.state.iri, this.props.projectLanguage).toLowerCase() + "»" + "\n" + ProjectElements[this.state.model].names[this.props.projectLanguage]
                }
            });
            this.props.resizeElem(this.state.model);
        } else {
            ProjectLinks[this.state.model].sourceCardinality = CardinalityPool[parseInt(this.state.sourceCardinality, 10)];
            ProjectLinks[this.state.model].targetCardinality = CardinalityPool[parseInt(this.state.targetCardinality, 10)];
            ProjectLinks[this.state.model].iri = this.state.iri;
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
                                text: Links[this.state.iri].labels[this.props.projectLanguage]
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
                        <h3>{LocaleMain.detailPanelTitle}</h3>
                        {this.state.changes ?
                            <p className={"bordered"}>{LocaleMain.saveChanges}<br/><br/><Button onClick={() => {
                                this.save();
                            }}>{LocaleMain.menuPanelSave}</Button></p> : <p></p>}
                        <Tabs id={"detailsTabs"}>
                            <Tab eventKey={1} title={LocaleMain.description}>
                                <TableList>
                                    <tr>
                                        <td style={{width: "20%"}}><b>{LocaleMenu.stereotype}</b></td>
                                        <td><IRIlabel
                                            label={Stereotypes[this.state.iri].labels[this.props.projectLanguage]}
                                            iri={this.state.iri}/></td>
                                    </tr>
                                </TableList>
                                <h5>{LocaleMenu.skoslabels}</h5>
                                <TableList>
                                    {Object.keys(Languages).map((language) => (
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
                                                <a href="#" onClick={() => this.deleteName(language)}>
                                                    {LocaleMenu.deleteProjectName}</a>
                                            </td>
                                            <td>{Languages[language]}</td>
                                        </tr>
                                    ))}
                                </TableList>
                                <h5>{LocaleMenu.inScheme}</h5>
                                <TableList>
                                    {Object.keys(Schemes[Stereotypes[this.state.iri].skos.inScheme].labels).map(lang => (
                                        <tr>
                                            <td><IRIlabel
                                                label={Schemes[Stereotypes[this.state.iri].skos.inScheme].labels[lang]}
                                                iri={Stereotypes[this.state.iri].skos.inScheme}/></td>
                                            <td>{Languages[lang]}</td>
                                        </tr>
                                    ))}
                                </TableList>
                                <h5>{LocaleMenu.skosdefinitions}</h5>
                                <Tabs id={"descriptions"}>
                                    {Object.keys(Stereotypes[this.state.iri].skos.definition).map((language, i) => (
                                        <Tab eventKey={i} title={Languages[language]}>
                                            <Form.Control
                                                as={"textarea"}
                                                rows={3}
                                                disabled={true}
                                                value={Stereotypes[this.state.iri].skos.definition[language]}
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
                                                <a href="#" onClick={(event) => {
                                                    this.deleteAttribute(i);
                                                }}>
                                                    {LocaleMenu.delete}</a>
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
                                <a href="#" onClick={(event) => {
                                    this.createAttribute();
                                }}>
                                    {LocaleMenu.createAttribute}</a>
                            </Tab>
                            <Tab eventKey={3} title={LocaleMain.diagram}>
                                <TableList headings={[LocaleMenu.diagram]}>
                                    {this.state.inputDiagrams.map((conn, i) =>
                                        (<tr>
                                            <td>{Diagrams[conn].name}&nbsp;<a href="#" onClick={() => {
                                                if (this.state.inputDiagrams.length > 1) {
                                                    this.state.inputDiagrams.splice(i, 1);
                                                    this.setState({changes: true});
                                                }
                                            }}>{LocaleMain.del}</a></td>
                                        </tr>)
                                    )}
                                </TableList>
                            </Tab>
                            <Tab eventKey={4} title={LocaleMain.connections}>
                                <TableList
                                    headings={[LocaleMenu.connectionVia, LocaleMenu.connectionTo, LocaleMenu.diagram]}>
                                    {this.state.inputConnections.map((conn) => {
                                            return (<tr>
                                                <td><IRIlabel label={Links[ProjectLinks[conn].iri].labels[this.props.projectLanguage]} iri={ProjectLinks[conn].iri}/></td>
                                                <td>{ProjectElements[ProjectLinks[conn].target].names[this.props.projectLanguage]}</td>
                                                <td>{ProjectLinks[conn].diagram}</td>
                                            </tr>);
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
                            <h3>{LocaleMain.detailPanelTitleRelationship}</h3>
                            {this.state.changes ?
                                <p className={"bordered"}>{LocaleMain.saveChanges}<br/><br/><Button onClick={() => {
                                    this.save();
                                }}>{LocaleMain.menuPanelSave}</Button></p> : <p></p>}
                            <TableList headings={[LocaleMenu.linkInfo, ""]}>
                                <tr>
                                    <td>
                                        <OverlayTrigger overlay={<Tooltip
                                            id="tooltipS">{LocaleMain.sourceCardinalityExplainer}</Tooltip>}
                                                        placement={"bottom"}>
                                            <span>{LocaleMain.sourceCardinality}</span>
                                        </OverlayTrigger>
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
                                        <OverlayTrigger overlay={<Tooltip
                                            id="tooltipS">{LocaleMain.targetCardinalityExplainer}</Tooltip>}
                                                        placement={"bottom"}>
                                            <span>{LocaleMain.targetCardinality}</span>
                                        </OverlayTrigger>
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
                                        <OverlayTrigger
                                            overlay={<Tooltip id="tooltipS">{LocaleMain.linkTypeExplainer}</Tooltip>}
                                            placement={"bottom"}>
                                            <span>{LocaleMain.linkType}</span>
                                        </OverlayTrigger>
                                    </td>
                                    <td>
                                        <Form.Control as="select" value={this.state.iri}
                                                      onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                          this.setState({
                                                              iri: event.currentTarget.value,
                                                              changes: true
                                                          });
                                                      }
                                                      }>
                                            {Object.keys(Links).map((iri, i) =>
                                                (<option key={i}
                                                         value={iri}>{Links[iri].labels[this.props.projectLanguage]}</option>)
                                            )}
                                        </Form.Control>
                                    </td>
                                </tr>

                            </TableList>
                            <h5>{LocaleMenu.inScheme}</h5>
                            <TableList>
                                {Object.keys(Schemes[Links[this.state.iri].skos.inScheme].labels).map(lang => (
                                    <tr>
                                        <td><IRIlabel
                                            label={Schemes[Links[this.state.iri].skos.inScheme].labels[lang]}
                                            iri={Links[this.state.iri].skos.inScheme}/></td>
                                        <td>{Languages[lang]}</td>
                                    </tr>
                                ))}
                            </TableList>
                            <h5>{LocaleMenu.skoslabels}</h5>
                            <TableList>
                                {Object.keys(Links[this.state.iri].skos.prefLabel).map(lang => (
                                    <tr>
                                        <td>{Links[this.state.iri].skos.prefLabel[lang]}</td>
                                        <td>{Languages[lang]}</td>
                                    </tr>
                                ))}
                            </TableList>
                            <h5>{LocaleMenu.skosdefinitions}</h5>
                            <Tabs id={"descriptions"}>
                                {Object.keys(Links[this.state.iri].skos.definition).map((language, i) => (
                                    <Tab eventKey={i} title={Languages[language]}>
                                        <Form.Control
                                            as={"textarea"}
                                            rows={3}
                                            disabled={true}
                                            value={Links[this.state.iri].skos.definition[language]}
                                        />
                                    </Tab>))}
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
                        <h3>{LocaleMain.detailPanelModel}</h3>
                        <TableList>
                            <tr>
                                <td>{LocaleMenu.stereotype}</td>
                                <td><IRIlabel label={ModelElements[this.state.iri].labels[this.props.projectLanguage]}
                                              iri={this.state.iri}/></td>
                            </tr>
                        </TableList>
                        <h5>{LocaleMenu.inScheme}</h5>
                        <TableList>
                            {Object.keys(Schemes[ModelElements[this.state.iri].skos.inScheme].labels).map(lang => (
                                <tr>
                                    <td><IRIlabel
                                        label={Schemes[ModelElements[this.state.iri].skos.inScheme].labels[lang]}
                                        iri={ModelElements[this.state.iri].skos.inScheme}/></td>
                                    <td>{Languages[lang]}</td>
                                </tr>
                            ))}
                        </TableList>
                        <h5>{LocaleMenu.skoslabels}</h5>
                        <TableList>
                            {Object.keys(ModelElements[this.state.iri].skos.prefLabel).map(lang => (
                                <tr>
                                    <td>{ModelElements[this.state.iri].skos.prefLabel[lang]}</td>
                                    <td>{Languages[lang]}</td>
                                </tr>
                            ))}
                        </TableList>
                        <h5>{LocaleMenu.skosdefinitions}</h5>
                        <Tabs id={"descriptions"}>
                            {Object.keys(ModelElements[this.state.iri].skos.definition).map((language, i) => (
                                <Tab eventKey={i} title={Languages[language]}>
                                    <Form.Control
                                        as={"textarea"}
                                        rows={3}
                                        disabled={true}
                                        value={ModelElements[this.state.iri].skos.definition[language]}
                                    />
                                </Tab>))}
                        </Tabs>
                    </div>
                </ResizableBox>);
            }
        } else {
            return (<div/>);
        }

    }

}