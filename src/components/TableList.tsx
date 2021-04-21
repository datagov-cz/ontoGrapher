import React from "react";
import { Table } from "react-bootstrap";

interface Props {
  width: string;
  height: string;
  headings?: string[];
}

export default class TableList extends React.Component<Props> {
  public static defaultProps = {
    width: "100%",
    height: "100%",
  };

  render() {
    return (
      <div
        className={"tableList"}
        style={{ width: this.props.width, height: this.props.height }}
      >
        <Table striped bordered={true} hover size={"sm"} responsive="md">
          {this.props.headings && (
            <thead>
              <tr>
                {this.props.headings.map((head) => (
                  <th key={head}>
                    <strong>{head}</strong>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody style={{ overflow: "auto" }}>{this.props.children}</tbody>
        </Table>
      </div>
    );
  }
}
