import React from 'react';

interface Props {
    label:string;
}

interface State {
    open: boolean;
}

export default class PackageFolder extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            open: false
        }
    }

    render() {
        return (<div onClick={()=>{this.setState({open: !this.state.open});}} className={"packageFolder" + (this.state.open ? " open" : "")}>
            {"📁 "+this.props.label}
            {this.state.open ?
                this.props.children
                : <span></span>}
        </div>);
    }
}