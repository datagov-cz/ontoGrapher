import React from 'react';
import {PanelNodeItem} from "./PanelNodeItem";
import {FormControl, OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import {PanelLinkItem} from "./PanelLinkItem";
import {LanguagePool, StereotypePool, VocabularyPool} from "../config/Variables";
import {LinkPool} from "../config/LinkVariables";
import {Locale} from "../config/locale/Locale";


export class ElementPanel extends React.Component {
    constructor(props: PanelNodeItem) {
        super(props);
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.handleChangeVocabulary = this.handleChangeVocabulary.bind(this);
        this.state = {
            loaded: false,
            vocabulary: "&*"
        };
    }

    handleChangeVocabulary(event){
        this.setState({vocabulary: event.target.value});
    }

    handleChangeSelectedLink(linkType) {
        this.props.handleChangeSelectedLink(linkType);
    }

    render() {
        let i = 0;
        let vocabularyPool = [];
        vocabularyPool.push(<option key={i++} value={"&*"}>{Locale.all}</option>);
        for (let vocabulary of VocabularyPool){
            vocabularyPool.push(<option key={i++} value={vocabulary}>{vocabulary}</option>)
        }
        vocabularyPool.push(<option key={i++} value={""}>{Locale.otherVocabulary}</option>);


        return (
            <div className="stereotypePanel" id="stereotypePanel">
                <FormControl componentClass="select" bsSize="small" value={this.state.vocabulary}
                             onChange={this.handleChangeVocabulary}>
                    {vocabularyPool}
                </FormControl>
                <Tabs id="stereotypePanelTabs" animation={false}>
                    <Tab eventKey={1} title={
                        <svg height={10} width={15}>
                            <rect width={15} height={10} fill="white" stroke="black" strokeWidth={4}/>
                        </svg>
                    }>
                        <div className="stereotypes">
                            {
                                StereotypePool.map((stereotype, i) => {
                                    if (stereotype.source === this.state.vocabulary || this.state.vocabulary === "&*" || (this.state.vocabulary === "" && !VocabularyPool.includes(stereotype.source))){
                                        return (<PanelNodeItem key={i++} model={{
                                                stereotype: StereotypePool.indexOf(stereotype)
                                            }} name={stereotype.name}/>);
                                    }
                                })
                            }
                        </div>
                    </Tab>
                    <Tab eventKey={2} title={
                        <svg height={10} width={15}>
                            <line x1={0} y1={5} x2={10} y2={5} stroke="black" strokeWidth={2}/>
                            <polygon
                                points="10,0 10,10 15,5"
                                fill="black"
                                stroke="black"
                                strokeWidth="1"
                            />
                        </svg>
                    }>
                        {Object.keys(LinkPool).map((link) => {
                                if (LinkPool[link][6] === this.state.vocabulary || this.state.vocabulary === "&*" || (this.state.vocabulary === "" && !VocabularyPool.includes(LinkPool[link][6]) )){
                                    return <PanelLinkItem
                                        key={i++}
                                        selectedLink={this.props.selectedLink}
                                        handleChangeSelectedLink={this.handleChangeSelectedLink}
                                        linkType={link}
                                    />
                                }
                            }
                        )}
                    </Tab>
                </Tabs>


            </div>
        );
    }

}

ElementPanel.defaultProps = {};