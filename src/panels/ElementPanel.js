import React from 'react';
import {PanelNodeItem} from "./PanelNodeItem";
import {OverlayTrigger, Tab, Tabs, Tooltip} from "react-bootstrap";
import {PanelLinkItem} from "./PanelLinkItem";
import {StereotypePool} from "../config/Variables";
import {LinkPool} from "../config/LinkVariables";


export class ElementPanel extends React.Component {
    constructor(props: PanelNodeItem) {
        super(props);
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.state = {
            loaded: false
        };
    }

    handleChangeSelectedLink(linkType) {
        this.props.handleChangeSelectedLink(linkType);
    }

    render() {
        let stereotypeItems = [];
        for (let stereotype = 0; stereotype < StereotypePool.length; stereotype++) {
                stereotypeItems.push(
                    <div>
                        <PanelNodeItem key={stereotype} model={{
                            stereotype: stereotype
                        }} name={StereotypePool[stereotype].name}/>
                    </div>

                );
            }

        return (
            <div className="stereotypePanel" id="stereotypePanel">
                <Tabs id="stereotypePanelTabs" animation={false}>
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