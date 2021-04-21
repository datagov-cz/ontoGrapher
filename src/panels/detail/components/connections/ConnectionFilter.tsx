import React from "react";
import classNames from "classnames";
import { Shapes } from "../../../../config/visual/Shapes";
import {
  AppSettings,
  Links,
  Stereotypes,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { ReactComponent as HiddenElementSVG } from "../../../../svg/hiddenElement.svg";
import { ElementFilter } from "../../../../datatypes/ElementFilter";
import { Form } from "react-bootstrap";
import { Locale } from "../../../../config/Locale";

interface Props {
  projectLanguage: string;
  updateFilter: (key: keyof ElementFilter, value: string) => void;
  showFilter: boolean;
  filter: ElementFilter;
}

interface State {}

export default class ConnectionFilter extends React.Component<Props, State> {
  render() {
    return (
      <div className={classNames("filter")}>
        <div
          className={classNames("hidden", {
            selected: this.props.filter.hidden,
          })}
        >
          <button
            className={classNames("buttonlink", "filter", {
              selected: this.props.filter.hidden,
            })}
            onClick={() =>
              this.props.updateFilter(
                "hidden",
                this.props.filter.hidden ? "" : "hidden"
              )
            }
          >
            <HiddenElementSVG />
          </button>
        </div>
        <div
          className={classNames("element")}
          style={{
            backgroundColor: this.props.filter.scheme
              ? WorkspaceVocabularies[this.props.filter.scheme].color
              : "#FFFFFF",
          }}
        >
          <span className={"schemeSelect"}>
            <Form.Control
              size="sm"
              as="select"
              value={this.props.filter.scheme}
              onChange={(event) =>
                this.props.updateFilter("scheme", event.target.value)
              }
            >
              <option
                value={""}
                onClick={() => this.props.updateFilter("scheme", "")}
              >
                {Locale[AppSettings.viewLanguage].anyVocabulary}
              </option>
              {Object.keys(WorkspaceVocabularies)
                .filter(
                  (scheme) => !scheme.startsWith(AppSettings.ontographerContext)
                )
                .map((scheme) => (
                  <option
                    style={{
                      backgroundColor: WorkspaceVocabularies[scheme].color,
                    }}
                    value={scheme}
                    onClick={() => this.props.updateFilter("scheme", scheme)}
                    key={scheme}
                  >
                    {
                      WorkspaceVocabularies[scheme].labels[
                        this.props.projectLanguage
                      ]
                    }
                  </option>
                ))}
            </Form.Control>
          </span>
          <Form.Control
            size="sm"
            as="select"
            onChange={(event) =>
              this.props.updateFilter("typeType", event.target.value)
            }
            value={this.props.filter.typeType}
          >
            <option key={""} value={""}>
              {Locale[AppSettings.viewLanguage].anyStereotypeType}
            </option>
            {Object.keys(Shapes)
              .filter((shape) => shape in Stereotypes)
              .map((shape) => (
                <option key={shape} value={shape}>
                  {Stereotypes[shape].labels[this.props.projectLanguage]}
                </option>
              ))}
          </Form.Control>
          <Form.Control
            size="sm"
            as="select"
            value={this.props.filter.ontoType}
            onChange={(event) =>
              this.props.updateFilter("ontoType", event.target.value)
            }
          >
            <option key={""} value={""}>
              {Locale[AppSettings.viewLanguage].anyStereotypeOnto}
            </option>
            {Object.keys(Stereotypes)
              .filter((stereotype) => !(stereotype in Shapes))
              .map((shape) => (
                <option key={shape} value={shape}>
                  {Stereotypes[shape].labels[this.props.projectLanguage]}
                </option>
              ))}
          </Form.Control>
          <Form.Control
            size="sm"
            value={this.props.filter.search}
            placeholder={
              Locale[AppSettings.viewLanguage].filterSearchPlaceholder
            }
            type={"search"}
            onChange={(event) =>
              this.props.updateFilter("search", event.target.value)
            }
          />
        </div>
        <div className={classNames("connection")}>
          <span>
            <button
              onClick={() =>
                this.props.updateFilter(
                  "direction",
                  this.props.filter.direction !== "target" ? "target" : ""
                )
              }
              className={classNames("buttonlink", "filter", {
                selected: this.props.filter.direction === "target",
              })}
            >
              <svg height={24} width={24}>
                <polygon points={"24,20 24,4 0,12"} />
              </svg>
            </button>
            &nbsp;
            <Form.Control
              size="sm"
              as="select"
              onChange={(event) =>
                this.props.updateFilter("connection", event.target.value)
              }
              value={this.props.filter.connection}
            >
              <option key={""} value={""}>
                {Locale[AppSettings.viewLanguage].anyConnection}
              </option>
              {Object.keys(Links).map((shape) => (
                <option key={shape} value={shape}>
                  {Links[shape].labels[this.props.projectLanguage]}
                </option>
              ))}
            </Form.Control>
            &nbsp;
            <button
              onClick={() =>
                this.props.updateFilter(
                  "direction",
                  this.props.filter.direction !== "source" ? "source" : ""
                )
              }
              className={classNames("buttonlink", "filter", {
                selected: this.props.filter.direction === "source",
              })}
            >
              <svg height={24} width={24}>
                <polygon points={"0,20 0,4 24,12"} />
              </svg>
            </button>
          </span>
          <svg className={"line"} height={"24px"}>
            <line
              x1={0}
              y1={14}
              x2={"100%"}
              y2={14}
              strokeWidth={1}
              stroke={"black"}
            />
          </svg>
        </div>
      </div>
    );
  }
}
