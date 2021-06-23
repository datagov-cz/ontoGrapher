import React from "react";
import TableList from "../../../components/TableList";
import { AppSettings, WorkspaceTerms } from "../../../config/Variables";
import { Button, Form } from "react-bootstrap";
import { Locale } from "../../../config/Locale";
import {
  getElemFromIRI,
  getLabelOrBlank,
} from "../../../function/FunctionGetVars";
import { parsePrefix } from "../../../function/FunctionEditVars";
import { QualityTableSelect } from "./QualityTableSelect";

interface Props {
  iri: string;
  qualities: string[];
  onEdit: Function;
  onRemove: Function;
  onAdd: Function;
  onCreate: Function;
  readOnly: boolean;
  projectLanguage: string;
}

interface State {
  newQualityInput: string;
  newQualitySelect: string;
  hover: number;
}

export default class QualityTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      newQualityInput: "",
      newQualitySelect: "",
      hover: -1,
    };
  }

  render() {
    return (
      <TableList>
        {this.props.qualities.map((iri, i) => (
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
              {getLabelOrBlank(
                WorkspaceTerms[iri].labels,
                this.props.projectLanguage
              )}
            </td>
            <td className={"short"}>
              <span className={"right"}>
                <button
                  className={"buttonlink"}
                  onClick={() => this.props.onEdit(getElemFromIRI(iri))}
                >
                  <span role="img" aria-label={""}>
                    📝
                  </span>
                </button>
              </span>
            </td>
            {!this.props.readOnly && (
              <td className={"short"}>
                <span className={"right"}>
                  <button
                    className={"buttonlink"}
                    onClick={() => this.props.onRemove()}
                  >
                    <span role="img" aria-label={""}>
                      ➖
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
              <QualityTableSelect
                projectLanguage={this.props.projectLanguage}
                iri={this.props.iri}
                handleChange={(value: string) =>
                  this.setState({ newQualitySelect: value })
                }
                handleInput={(value: string) =>
                  this.setState({ newQualityInput: value })
                }
                qualities={this.props.qualities}
              />
            </td>
            <td className={"short"}>
              <button
                className={"buttonlink"}
                onClick={() => {
                  this.props.onCreate();
                  this.setState({ newQualitySelect: "" });
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
