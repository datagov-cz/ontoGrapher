import React from "react";
import TableList from "../../../components/TableList";
import { AppSettings, Languages } from "../../../config/Variables";
import InlineEdit, { InputType } from "riec";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import { removeNewlines } from "../../../function/FunctionEditVars";

interface Props {
  labels: { label: string; language: string }[];
  readOnly: boolean;
  default: string;
  onEdit: Function;
  selectAsDefault: Function;
  addAltLabel: Function;
}

interface State {
  newAltInput: string;
  hover: number;
}

export default class AltLabelTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      newAltInput: "",
      hover: -1,
    };
  }

  render() {
    return (
      <TableList>
        {Object.keys(this.props.labels).map((entry, i) => (
          <tr
            key={i}
            onMouseEnter={() => {
              this.setState({ hover: i });
            }}
            onMouseLeave={() => {
              this.setState({ hover: -1 });
            }}
          >
            <td colSpan={this.props.readOnly ? 2 : 1} className={"stretch"}>
              {this.props.readOnly ? (
                this.props.labels[i].label
              ) : (
                <InlineEdit
                  viewClass={"rieinput"}
                  value={this.props.labels[i].label}
                  onChange={(value: string) => {
                    this.props.onEdit(
                      removeNewlines(value),
                      this.props.labels[i].language,
                      i
                    );
                  }}
                  type={InputType.TextArea}
                />
              )}
              <span className={"right"}>
                {this.props.labels[i].label !== this.props.default &&
                  AppSettings.selectedLanguage ===
                    this.props.labels[i].language &&
                  this.state.hover === i && (
                    <OverlayTrigger
                      placement="left"
                      overlay={
                        <Tooltip id="button-tooltip">
                          {Locale[AppSettings.viewLanguage].setAsDisplayName}
                        </Tooltip>
                      }
                    >
                      <button
                        className={"buttonlink"}
                        onClick={() =>
                          this.props.selectAsDefault(
                            this.props.labels[i].language,
                            i
                          )
                        }
                      >
                        <span role="img" aria-label={""}>
                          🏷️
                        </span>
                      </button>
                    </OverlayTrigger>
                  )}
                {this.props.labels[i].label === this.props.default && (
                  <span role="img" aria-label={""}>
                    🏷️
                  </span>
                )}
              </span>
            </td>
            <td className={"short"}>
              {this.props.readOnly &&
              this.props.labels[i].language in Languages ? (
                Languages[this.props.labels[i].language]
              ) : (
                <InlineEdit
                  type={InputType.Select}
                  value={this.props.labels[i].language}
                  onChange={(language) =>
                    this.props.onEdit(
                      removeNewlines(this.props.labels[i].label),
                      language,
                      i
                    )
                  }
                  options={Object.keys(Languages).map((lang) => {
                    return { id: lang, name: Languages[lang] };
                  })}
                  valueKey="id"
                  labelKey="name"
                  viewClass={"rieinput"}
                />
              )}
            </td>
            {!this.props.readOnly && (
              <td className={"short"}>
                <span className={"right"}>
                  <button
                    className={"buttonlink"}
                    onClick={() =>
                      this.props.onEdit("", this.props.labels[i].language, i)
                    }
                  >
                    <span role="img" aria-label={""}>
                      ❌
                    </span>
                  </button>
                </span>
              </td>
            )}
          </tr>
        ))}
        {!this.props.readOnly && (
          <tr>
            <td colSpan={2}>
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  this.props.addAltLabel(this.state.newAltInput);
                  this.setState({ newAltInput: "" });
                }}
              >
                <Form.Control
                  size={"sm"}
                  id={"newAltLabelInput"}
                  type="text"
                  value={this.state.newAltInput}
                  placeholder={
                    Locale[AppSettings.viewLanguage].addAltLabelPlaceholder
                  }
                  onChange={(event) =>
                    this.setState({ newAltInput: event.currentTarget.value })
                  }
                />
              </Form>
            </td>
            <td className={"short"}>
              <button
                className={"buttonlink"}
                onClick={() => {
                  this.props.addAltLabel(this.state.newAltInput);
                  this.setState({ newAltInput: "" });
                }}
              >
                <span role="img" aria-label={""}>
                  ➕
                </span>
              </button>
            </td>
          </tr>
        )}
      </TableList>
    );
  }
}
