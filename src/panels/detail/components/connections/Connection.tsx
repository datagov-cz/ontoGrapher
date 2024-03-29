import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import classNames from "classnames";
import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../../config/Locale";
import { AppSettings } from "../../../../config/Variables";
import { deleteLink } from "../../../../function/FunctionLink";

interface Props {
  onDragStart: Function;
  onDragEnd: Function;
  onClick: Function;
  selected: boolean;
  link: string;
  selectedLanguage: string;
  direction: boolean;
  backgroundColor: string;
  elementLabel: JSX.Element;
  infoFunction?: (link: string) => void;
  performTransaction: (...queries: string[]) => void;
  readOnly: boolean;
  update?: Function;
  title: string;
  sourceCardinality: string;
  targetCardinality: string;
}

export default class Connection extends React.Component<Props> {
  getSvg() {
    return (
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="arrow"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id={this.props.link}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
          </marker>
        </defs>
        <line
          x1="0%"
          y1="50%"
          x2="97%"
          y2="50%"
          strokeWidth="2"
          stroke="#000"
          markerStart={this.props.direction ? `url(#${this.props.link})` : ""}
        />
        <line
          x1="97%"
          y1="50%"
          x2="97%"
          y2="100%"
          strokeWidth="2"
          stroke="#000"
          markerEnd={!this.props.direction ? `url(#${this.props.link})` : ""}
        />
      </svg>
    );
  }

  render() {
    return (
      <div
        draggable
        onDragStart={(event) => this.props.onDragStart(event)}
        onDragEnd={() => this.props.onDragEnd()}
        onClick={() => this.props.onClick()}
        className={classNames("connection", {
          selected: this.props.selected,
        })}
      >
        <span className={"link"}>
          <span className="texts">
            {this.getSvg()}
            <span className={"name cardLeft"}>
              {this.props.sourceCardinality}
            </span>
            <span className={"name title"}>{this.props.title}</span>
            <span className={"name cardRight"}>
              {this.props.targetCardinality}
            </span>
          </span>

          {this.props.infoFunction && (
            <OverlayTrigger
              delay={1000}
              placement="left"
              overlay={
                <Tooltip>
                  {Locale[AppSettings.interfaceLanguage].linkInfo}
                </Tooltip>
              }
            >
              <Button
                onClick={(evt) => {
                  evt.stopPropagation();
                  this.props.infoFunction!(this.props.link);
                }}
                className="plainButton"
                variant="light"
              >
                <InfoIcon />
              </Button>
            </OverlayTrigger>
          )}
        </span>
        <span className="info">
          <span
            className={"element"}
            style={{ backgroundColor: this.props.backgroundColor }}
          >
            {this.props.elementLabel}
          </span>
          {this.props.infoFunction && (
            <OverlayTrigger
              delay={1000}
              placement="left"
              overlay={
                <Tooltip>
                  {Locale[AppSettings.interfaceLanguage].deleteLink}
                </Tooltip>
              }
            >
              <Button
                disabled={this.props.readOnly}
                variant="light"
                className="plainButton"
              >
                <DeleteIcon
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteLink(this.props.link);
                    if (this.props.update) this.props.update();
                  }}
                />
              </Button>
            </OverlayTrigger>
          )}
        </span>
      </div>
    );
  }
}
