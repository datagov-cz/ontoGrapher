import React from 'react';
import {Locale} from "../config/Locale";
import {DefaultLabelModel} from "storm-react-diagrams";
import {CardinalityPool} from "../config/Variables";
import {NodeCommonPortModel} from "../components/common-node/NodeCommonPortModel";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";

export class ContextMenuLink extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({
            subMenuFirstCard: false,
            subMenuSecondCard: false
        });

        this.firstCardinalitySubmenuShow = this.firstCardinalitySubmenuShow.bind(this);
        this.firstCardinalitySubmenuHide = this.firstCardinalitySubmenuHide.bind(this);
        this.secondCardinalitySubmenuShow = this.secondCardinalitySubmenuShow.bind(this);
        this.secondCardinalitySubmenuHide = this.secondCardinalitySubmenuHide.bind(this);
        this.hideAll = this.hideAll.bind(this);
        this.handleClickCardinality = this.handleClickCardinality.bind(this);
        this.handleClickFlipLink = this.handleClickFlipLink.bind(this);
        this.handleClickDeleteMiddlePoints = this.handleClickDeleteMiddlePoints.bind(this);
        this.handleClickDeleteLink = this.handleClickDeleteLink.bind(this);

    }

    handleClickDeleteLink(){
        this.props.contextMenuLink.remove();
    }

    handleClickDeleteMiddlePoints(){
        if (this.props.contextMenuLink.points.length > 2) {
            this.props.contextMenuLink.points.splice(1, this.props.contextMenuLink.points.length - 2);
        }
    }

    handleClickCardinality(event) {
        let cardinality = event.nativeEvent.path[0].innerHTML === Locale.none ? "" : event.nativeEvent.path[0].innerHTML;
        let label = new DefaultLabelModel();
        label.setLabel(cardinality);
        if (this.state.subMenuFirstCard) {
            this.props.contextMenuLink.labels[0] = label;
            this.props.contextMenuLink.sourceCardinality = cardinality;
        } else if (this.state.subMenuSecondCard) {
            this.props.contextMenuLink.labels[2] = label;
            this.props.contextMenuLink.targetCardinality = cardinality;
        }
    }

    handleClickFlipLink(){
        let sourcePort = this.props.contextMenuLink.getSourcePort();
        let targetPort = this.props.contextMenuLink.getTargetPort();
        this.props.contextMenuLink.sourcePort = targetPort;
        this.props.contextMenuLink.targetPort = sourcePort;
        this.props.contextMenuLink.getFirstPoint().updateLocation(this.props.contextMenuLink.model.canvas.engine.getPortCenter(targetPort));
        this.props.contextMenuLink.getLastPoint().updateLocation(this.props.contextMenuLink.model.canvas.engine.getPortCenter(sourcePort));
    }

    firstCardinalitySubmenuShow() {
        this.setState({subMenuFirstCard: true, subMenuSecondCard: false})
    }

    firstCardinalitySubmenuHide() {
        this.setState({subMenuFirstCard: false});
    }


    secondCardinalitySubmenuShow() {
        this.setState({subMenuSecondCard: true, subMenuFirstCard: false});
    }

    secondCardinalitySubmenuHide() {
        this.setState({subMenuSecondCard: false});
    }

    hideAll() {
        this.setState({subMenuFirstCard: false, subMenuSecondCard: false});
    }

    render() {
        if (this.props.contextMenuLink instanceof LinkCommonModel){
            let cardinalityPool = [];
            for (let cardinality of CardinalityPool) {
                cardinalityPool.push(<li key={cardinality} onClick={this.handleClickCardinality}
                                         value={cardinality}>{cardinality}</li>);
            }
            return (
                <div className="contextMenu"
                     style={{
                         display: this.props.contextMenuActive ? "block" : "none",
                         top: this.props.contextMenuY,
                         left: this.props.contextMenuX
                     }}
                >
                    <div className="contextMenu-main">
                        <ul>
                            <li onMouseOver={this.firstCardinalitySubmenuShow}>{Locale.contextMenuFirstCardinality + " >"}</li>
                            <li onMouseOver={this.secondCardinalitySubmenuShow}>{Locale.contextMenuSecondCardinality + " >"}</li>
                            {this.props.contextMenuLink.getSourcePort() instanceof NodeCommonPortModel && this.props.contextMenuLink.getTargetPort() instanceof NodeCommonPortModel ? <li onClick={this.handleClickFlipLink}>{Locale.flipRelationship}</li> : ""}
                            {this.props.contextMenuLink.points.length > 2 ? <li onClick={this.handleClickDeleteMiddlePoints}>{Locale.deleteMiddlePoints}</li> : ""}
                            <li onClick={this.handleClickDeleteLink}>{Locale.deleteRelationship}</li>
                        </ul>
                    </div>
                    <div className="contextMenu-subFirstCard"
                         style={{display: this.state.subMenuFirstCard ? "block" : "none"}}>
                        <ul>
                            {cardinalityPool}
                        </ul>
                    </div>
                    <div className="contextMenu-subSecondCard"
                         style={{display: this.state.subMenuSecondCard ? "block" : "none"}}>
                        <ul>
                            {cardinalityPool}
                        </ul>
                    </div>
                </div>
            );
        } else {
            return null;
        }

    }
}