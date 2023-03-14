import classNames from "classnames";
import React from "react";
import { Button, Form } from "react-bootstrap";
import { Representation } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Links,
  WorkspaceVocabularies,
} from "../../../../config/Variables";
import { ElementFilter } from "../../../../datatypes/ElementFilter";
import { ReactComponent as HiddenElementSVG } from "../../../../svg/hiddenElement.svg";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

interface Props {
  projectLanguage: string;
  updateFilter: (key: keyof ElementFilter, value: string) => void;
  showFilter: boolean;
  filter: ElementFilter;
  vocabularies: string[];
}

export default class ConnectionFilter extends React.Component<Props> {
  render() {
    return (
      <div className={classNames("filter")}>
        <div className="filterLink">
          <Button
            variant="light"
            onClick={() =>
              this.props.updateFilter(
                "direction",
                this.props.filter.direction !== "target" ? "target" : ""
              )
            }
            className={classNames("plainButton", "filter", {
              selected: this.props.filter.direction === "target",
            })}
          >
            <svg height={24} width={18}>
              <polygon points={"18,20 18,4 0,12"} />
            </svg>
          </Button>
          &nbsp;
          {AppSettings.representation === Representation.FULL && (
            <Form.Control
              size="sm"
              as="select"
              onChange={(event) =>
                this.props.updateFilter("connection", event.target.value)
              }
              value={this.props.filter.connection}
            >
              <option key={""} value={""}>
                {Locale[AppSettings.interfaceLanguage].anyLink}
              </option>
              {Object.keys(Links).map((shape) => (
                <option key={shape} value={shape}>
                  {Links[shape].labels[this.props.projectLanguage]}
                </option>
              ))}
            </Form.Control>
          )}
          &nbsp;
          <Button
            variant="light"
            onClick={() =>
              this.props.updateFilter(
                "direction",
                this.props.filter.direction !== "source" ? "source" : ""
              )
            }
            className={classNames("plainButton", "filter", {
              selected: this.props.filter.direction === "source",
            })}
          >
            <svg height={24} width={18}>
              <polygon points={"0,20 0,4 18,12"} />
            </svg>
          </Button>
          <svg className={"line"} width={"100%"} height={"24px"}>
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
        <div
          className="element"
          style={{
            backgroundColor: this.props.filter.scheme
              ? WorkspaceVocabularies[this.props.filter.scheme].color
              : "#FFFFFF",
          }}
        >
          <Form.Control
            size="sm"
            value={this.props.filter.search}
            placeholder={
              Locale[AppSettings.interfaceLanguage].filterSearchPlaceholder
            }
            type={"search"}
            onChange={(event) =>
              this.props.updateFilter("search", event.target.value)
            }
          />
          <div
            className={classNames("hidden", {
              selected: this.props.filter.hidden,
            })}
          >
            <Button
              variant="light"
              className={classNames("plainButton", "filter", {
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
            </Button>
          </div>
          <Form.Control
            className="schemeSelect"
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
              {Locale[AppSettings.interfaceLanguage].anyVocabulary}
            </option>
            {this.props.vocabularies.map((scheme) => (
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
          <LocalLibraryIcon className="library" />
        </div>
      </div>
    );
  }
}
