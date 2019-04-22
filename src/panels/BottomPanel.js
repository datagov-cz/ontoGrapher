import * as React from "react";
import Table from "react-bootstrap/es/Table";
import {Locale} from "../config/Locale";
import Button from "react-bootstrap/es/Button";

export class BottomPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = ({
            active: this.props.bottomPanelActive
        });
    }

    render(){
        let left = document.getElementById("stereotypePanel");
        left = left === null ? 0 : left.offsetWidth;
        let right = document.getElementById("detailPanel");
        right = right === null ? 0 : right.offsetWidth;
        if (this.props.bottomPanelActive){
            let constraintEvaluations = Object.entries(this.props.bottomPanelData).map((evaluation, i) =>{
                return(<tr key={i}>
                    <td><a onClick={this.props.handleLocate.bind(this,evaluation[0])}>{i+1}</a></td>
                    <td>{evaluation[0]}</td>
                    <td>{evaluation[1]}</td>
                </tr>);
            });
            return (
                <div className="bottomPanel" style={{left: left + "px", width: "calc(100% - "+(right+left)+"px"}}>
                    <Table striped bordered hover condensed>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{Locale.relationship}</th>
                            <th>{Locale.evaluation}</th>
                        </tr>
                        </thead>
                        <tbody>
                            {constraintEvaluations}
                        </tbody>
                    </Table>
                    <Button bsStyle="primary" onClick={this.props.handleEvaluate}>{Locale.rerun}</Button>
                    <Button bsStyle="danger" onClick={this.props.handleCloseBottomPanel}>{Locale.close}</Button>
                </div>
            );
        } else {
            return (<div className="bottomPanelEmpty"></div>);
        }

    }
}