import React from 'react';
import {Locale} from "../config/Locale";
import {DefaultLabelModel} from "storm-react-diagrams";
import {CardinalityPool} from "../config/Variables";

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
        this.handleClick = this.handleClick.bind(this);

        this.cardinalityPool = [];
        for (let cardinality of CardinalityPool) {
            this.cardinalityPool.push(<li key={cardinality} onClick={this.handleClick}
                                          value={cardinality}>{cardinality}</li>);
        }
    }

    handleClick(event) {
        let cardinality = event.nativeEvent.path[0].innerHTML === Locale.none ? "" : event.nativeEvent.path[0].innerHTML;
        let label = new DefaultLabelModel();
        label.setLabel(cardinality);
        if (this.state.subMenuFirstCard) {
            this.props.contextMenuLink.labels[0] = label;
        } else if (this.state.subMenuSecondCard) {
            this.props.contextMenuLink.labels[2] = label;
        }
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
                    </ul>
                </div>
                <div className="contextMenu-subFirstCard"
                     style={{display: this.state.subMenuFirstCard ? "block" : "none"}}>
                    <ul>
                        {this.cardinalityPool}
                    </ul>
                </div>
                <div className="contextMenu-subSecondCard"
                     style={{display: this.state.subMenuSecondCard ? "block" : "none"}}>
                    <ul>
                        {this.cardinalityPool}
                    </ul>
                </div>
            </div>
        );
    }
}