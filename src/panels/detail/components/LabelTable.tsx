import React from "react";
import TableList from "../../../components/TableList";
// @ts-ignore
import {
  getLabelOrBlank,
  isLabelBlank,
  isTermReadOnly,
} from "../../../function/FunctionGetVars";
import { AppSettings, Languages } from "../../../config/Variables";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { removeNewlines } from "../../../function/FunctionEditVars";
import IRILink from "../../../components/IRILink";

interface Props {
  labels: { [key: string]: string };
  iri: string;
  showCopyIRI?: boolean;
  default?: string;
  selectAsDefault?: Function;
  onEdit?: Function;
}

interface State {
  hover: { [key: number]: boolean };
}

export default class LabelTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hover: {},
    };
  }

  render() {
    return (
      <TableList>
        {Object.keys(this.props.labels).map((lang, i) => (
          <tr
            key={i}
            onMouseEnter={() => {
              let res = this.state.hover;
              res[i] = true;
              this.setState({ hover: res });
            }}
            onMouseLeave={() => {
              let res = this.state.hover;
              res[i] = false;
              this.setState({ hover: res });
            }}
          >
            <td className={"stretch"}>
              
              {/* TODO: Replace RIEC */}
              {/* {isLabelBlank(getLabelOrBlank(this.props.labels, lang)) &&
              !isTermReadOnly(this.props.iri) ? (
                <InlineEdit
                  type={InputType.Text}
                  value={getLabelOrBlank(this.props.labels, lang)}
                  onChange={(label) => {
                    if (this.props.onEdit)
                      this.props.onEdit(removeNewlines(label), lang);
                  }}
                  valueKey="id"
                  labelKey="name"
                  viewClass={"rieinput"}
                />
              ) : (
                <span>
                  {this.props.showCopyIRI ? (
                    <IRILink
                      iri={this.props.iri}
                      label={getLabelOrBlank(this.props.labels, lang)}
                    />
                  ) : (
                    <span>{getLabelOrBlank(this.props.labels, lang)}</span>
                  )}
                  <span className={"right"}>
                    {getLabelOrBlank(this.props.labels, lang) !==
                      this.props.default &&
                      this.props.selectAsDefault &&
                      AppSettings.canvasLanguage === lang &&
                      this.state.hover[i] && (
                        <OverlayTrigger
                          placement="left"
                          overlay={
                            <Tooltip id="button-tooltip">
                              {
                                Locale[AppSettings.interfaceLanguage]
                                  .setAsDisplayName
                              }
                            </Tooltip>
                          }
                        >
                          <button
                            className={"buttonlink"}
                            onClick={() => {
                              if (this.props.selectAsDefault)
                                this.props.selectAsDefault(
                                  getLabelOrBlank(this.props.labels, lang)
                                );
                            }}
                          >
                            <span
                              role="img"
                              aria-label={"Set as display label"}
                            >
                              🏷️
                            </span>
                          </button>
                        </OverlayTrigger>
                      )}
                    {getLabelOrBlank(this.props.labels, lang) ===
                      this.props.default && (
                      <span role="img" aria-label={"Current display label"}>
                        🏷️
                      </span>
                    )}
                  </span>
                </span>
              )}*/}
            </td> 
            <td className={"short"}>{Languages[lang]}</td>
          </tr>
        ))}
      </TableList>
    );
  }
}
