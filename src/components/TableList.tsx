import React from 'react';
import {Table} from "react-bootstrap";

interface Props {
    width: string;
    height: string;
    headings?: string[];
}

interface State {

}

export default class TableList extends React.Component<Props, State> {
    public static defaultProps = {
        width: "100%",
        height: "100%"
    };

    constructor(props: Props) {
        super(props);
    }

    render() {
        if (this.props.headings){
            return (<div className={"tableList"} style={{width: this.props.width, height: this.props.height}}>
                <Table striped bordered={true} hover size={"sm"} responsive="md">
                    <thead>
                    <tr>
                        {this.props.headings.map((head) => <th>{head}</th>)}
                    </tr>
                    </thead>
                    <tbody style={{overflow: "auto"}}>
                    {this.props.children}
                    </tbody>
                </Table>
            </div>);
        } else {
            return (<div className={"tableList"} style={{width: this.props.width, height: this.props.height}}>
                <Table striped bordered={true} hover size={"sm"}>
                    <tbody style={{overflow: "auto"}}>
                    {this.props.children}
                    </tbody>
                </Table>
            </div>);
        }

    }
}