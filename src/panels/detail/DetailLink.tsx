import React from 'react';
import {CardinalityPool, Languages, Links, ProjectLinks, ProjectSettings, Schemes} from "../../config/Variables";
import {Form} from "react-bootstrap";
import TableList from "../../components/TableList";
import * as LocaleMain from "../../locale/LocaleMain.json";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import IRIlabel from "../../components/IRIlabel";
import IRILink from "../../components/IRILink";
import {ResizableBox} from "react-resizable";
import {graph} from "../../graph/graph";
import DescriptionTabs from "./components/DescriptionTabs";
import {getLinkOrVocabElem} from "../../function/FunctionGetVars";
import {updateProjectLink} from "../../interface/TransactionInterface";

interface Props {
    projectLanguage: string;
    headers: { [key: string]: { [key: string]: string } }
    save: Function;
    retry: boolean;
    handleChangeLoadingStatus: Function;
}

interface State {
    id: string,
    iri: string,
    sourceCardinality: string;
    targetCardinality: string;
    changes: boolean;
}

export default class DetailLink extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            id: "",
            iri: Object.keys(Links)[0],
            sourceCardinality: "0",
            targetCardinality: "0",
            changes: false
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
        if (prevState !== this.state && (this.state.changes)) {
            this.save();
        } else if (prevProps !== this.props && (this.props.retry && ProjectSettings.lastSource === DetailLink.name)) {
            this.save();
        }
    }

    prepareDetails(id: string) {
        let sourceCard = ProjectLinks[id].sourceCardinality;
        let targetCard = ProjectLinks[id].targetCardinality;
        this.setState({
            sourceCardinality: "0",
            targetCardinality: "0"
        });
        CardinalityPool.forEach((card, i) => {
            if (sourceCard.getString() === card.getString()) {
                this.setState({sourceCardinality: i.toString(10)});
            }
            if (targetCard.getString() === card.getString()) {
                this.setState({targetCardinality: i.toString(10)});
            }
        })
        this.setState({
            id: id,
            iri: ProjectLinks[id].iri,
            changes: false
        });
    }

    save() {
        this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
        ProjectLinks[this.state.id].sourceCardinality = CardinalityPool[parseInt(this.state.sourceCardinality, 10)];
        ProjectLinks[this.state.id].targetCardinality = CardinalityPool[parseInt(this.state.targetCardinality, 10)];
        ProjectLinks[this.state.id].iri = this.state.iri;
        updateProjectLink(ProjectSettings.contextEndpoint, this.state.id, DetailLink.name).then((result) => {
            if (result) {
                let links = graph.getLinks();
                for (let link of links) {
                    if (link.id === this.state.id) {
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
                        if (ProjectLinks[this.state.id].sourceCardinality.getString() !== LocaleMain.none) {
                            link.appendLabel({
                                attrs: {text: {text: ProjectLinks[this.state.id].sourceCardinality.getString()}},
                                position: {distance: 20}
                            });
                        }
                        if (ProjectLinks[this.state.id].targetCardinality.getString() !== LocaleMain.none) {
                            link.appendLabel({
                                attrs: {text: {text: ProjectLinks[this.state.id].targetCardinality.getString()}},
                                position: {distance: -20}
                            });
                        }
                        link.appendLabel({
                            attrs: {text: {text: getLinkOrVocabElem(this.state.iri).labels[this.props.projectLanguage]}},
                            position: {distance: 0.5}
                        });
                    }
                }
                this.setState({changes: false});
                this.props.save();
                this.props.handleChangeLoadingStatus(false, "", false);
            } else {
                this.props.handleChangeLoadingStatus(false, "", true);
            }
        })
    }

    render() {
        return this.state.id !== "" && (<ResizableBox
            width={300}
            height={1000}
            axis={"x"}
            handleSize={[8, 8]}
            resizeHandles={['nw']}
            className={"details"}>
            <div>
                <h3>{getLinkOrVocabElem(this.state.iri).labels[this.props.projectLanguage]}</h3>
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
                            <Form.Control as="select" value={this.state.iri} onChange={(event) => {
                                this.setState({
                                    iri: event.currentTarget.value,
                                    changes: true
                                })
                            }}>
                                {Object.keys(Languages).map((languageCode) => (
                                    <option key={languageCode}
                                            value={languageCode}>{Languages[languageCode]}</option>))}
                            </Form.Control>
                        </td>
                        <IRIlabel label={getLinkOrVocabElem(this.state.iri).labels[this.props.projectLanguage]}
                                  iri={this.state.iri}/>
                    </tr>
                </TableList>
                <h5>{<IRILink label={this.props.headers.labels[this.props.projectLanguage]}
                              iri={"http://www.w3.org/2004/02/skos/core#prefLabel"}/>}</h5>
                <TableList>
                    {
                        Object.keys(getLinkOrVocabElem(this.state.iri).labels).map(lang => (
                            <tr>
                                <td>{getLinkOrVocabElem(this.state.iri).labels[lang]}</td>
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
                                         readOnly={true}/>
                    </div> : ""}
            </div>
        </ResizableBox>);
    }
}