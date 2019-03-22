import React from 'react';
import {PanelNodeItem} from "./PanelNodeItem";
import {Defaults} from "../config/Defaults";
import {Tabs} from "react-bootstrap";
import {Tab} from "react-bootstrap";
import {PanelLinkItem} from "./PanelLinkItem";
import {StereotypePool} from "../config/Variables";
import * as RDF from "../misc/RDF";
import {LinkPool} from "../config/LinkVariables";


export class ElementPanel extends React.Component {
    constructor(props: PanelNodeItem) {
        super(props);
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.state = {
            loaded: false
        };
    }

    componentDidMount() {
        RDF.fetchStereotypes(Defaults.stereotypeUrl, true, function(){
            this.forceUpdate();
        }.bind(this));
    }

    handleChangeSelectedLink(linkType) {
        this.props.handleChangeSelectedLink(linkType);
    }

    render() {
        let stereotypeItems = [];
        for (let stereotype in StereotypePool) {
                stereotypeItems.push(<PanelNodeItem key={StereotypePool[stereotype].toUpperCase()} model={{
                    type: StereotypePool[stereotype].toLowerCase(),
                    rdf: stereotype
                }} name={StereotypePool[stereotype]}/>);
            }

        return (
            <div className="stereotypePanel">
                <Tabs id="stereotypePanel" animation={false}>
                    <Tab eventKey={1} title={
                        <svg height={10} width={15}>
                            <rect width={15} height={10} fill="white" stroke="black" strokeWidth={4}/>
                        </svg>
                    }>
                        <div className="stereotypes">
                            {stereotypeItems}
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
                        {Object.keys(LinkPool).map((link) => (
                            <PanelLinkItem
                                key={link}
                                selectedLink={this.props.selectedLink}
                                handleChangeSelectedLink={this.handleChangeSelectedLink}
                                linkType={link}
                            />
                        ))}
                    </Tab>
                </Tabs>


            </div>
        );
    }

}

ElementPanel.defaultProps = {};