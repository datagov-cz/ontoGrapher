import React from "react";
import classNames from "classnames";

interface Props {
  onDragStart: Function;
  onDragEnd: Function;
  onClick: Function;
  selected: boolean;
  linkLabel: string;
  direction: boolean;
  markerID: string;
  backgroundColor: string;
  elementLabel: JSX.Element;
}

interface State {}

export default class Connection extends React.Component<Props, State> {
  render() {
    return (
      <tr
        draggable
        onDragStart={(event) => this.props.onDragStart(event)}
        onDragEnd={() => this.props.onDragEnd}
        onClick={() => this.props.onClick}
        className={classNames("connectionComponent", "connection", {
          selected: this.props.selected,
        })}
      >
        <td className={"link"}>
          <span className={"text"}>{this.props.linkLabel}</span>
          <svg width="100%" height="25px" preserveAspectRatio="none">
            <defs>
              <marker
                id={this.props.markerID}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="8"
                markerHeight="10"
                orient={this.props.direction ? "180" : "0"}
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#333333" />
              </marker>
            </defs>
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              strokeWidth="2"
              stroke="#333333"
              {...(this.props.direction
                ? {
                    markerStart: `url(#${this.props.markerID})`,
                  }
                : {
                    markerEnd: `url(#${this.props.markerID})`,
                  })}
            />
          </svg>
        </td>
        <td
          className={"element"}
          style={{ backgroundColor: this.props.backgroundColor }}
        >
          {this.props.elementLabel}
        </td>
      </tr>
    );
  }
}
