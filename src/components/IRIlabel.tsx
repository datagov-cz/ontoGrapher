import React from "react";

interface Props {
  label: string;
  iri: string;
}

interface State {
  hover: boolean;
}

export default class IRIlabel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hover: false,
    };
  }

  render() {
    return (
      <td
        onMouseOver={() => {
          this.setState({ hover: true });
        }}
        onMouseOut={() => {
          this.setState({ hover: false });
        }}
      >
        <span>
          {this.props.label}
          <a
            target="_blank"
            rel="noopener noreferrer"
            style={{ visibility: this.state.hover ? "visible" : "hidden" }}
            href={this.props.iri}
          >
            ↱
          </a>
        </span>
      </td>
    );
  }
}
