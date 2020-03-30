import React from 'react';

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
            hover: false
        }
    }

    render() {
        return (<span
            onMouseOver={()=>{this.setState({hover: true});}}
            onMouseOut={()=>{this.setState({hover: false});}}
        >
            {this.props.label}<a target="_blank" rel="noopener noreferrer"
                                 style={{display: this.state.hover ? "inline" : "none"}}
                                 href={this.props.iri}>↱</a>
        </span>);
    }
}