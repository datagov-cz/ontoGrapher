import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import {LinkPool} from "../../../config/LinkVariables";
import {Form, FormControl, FormGroup} from "react-bootstrap";
import {Constraint} from "../../../components/misc/Constraint";

export class MenuSettingsConstraints extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);
        this.state = {
            constraintLink: Object.keys(LinkPool)[0],
            constraint: undefined,
            newConstraint: "",
            newDescription: ""
        };
        this.handleChangeConstraintLink = this.handleChangeConstraintLink.bind(this);
        this.handleChangeConstraint = this.handleChangeConstraint.bind(this);
        this.deleteConstraint = this.deleteConstraint.bind(this);
        this.handleChangeNewConstraint = this.handleChangeNewConstraint.bind(this);
        this.addConstraint = this.addConstraint.bind(this);
        this.focus = this.focus.bind(this);
        this.handleChangeNewDescription = this.handleChangeNewDescription.bind(this);
    }

    handleChangeNewDescription(event){
        this.setState({
            newDescription: event.target.value
        });
    }

    addConstraint() {
        if (this.state.newConstraint !== "") {
            let constraint = new Constraint(this.state.newConstraint, this.state.constraintLink, this.state.newDescription);
            LinkPool[this.state.constraintLink][3].push(constraint);
            let links = this.props.canvas.engine.getDiagramModel().getLinks();
            for (let link in links){
                if (links[link].linkType === constraint.linkType){
                    links[link].constraints.push(constraint);
                }
            }
            this.setState({newConstraint: ""});
        }
    }

    deleteConstraint() {
        LinkPool[this.state.constraintLink][3].splice(this.state.constraint, 1);
        let links = this.props.canvas.engine.getDiagramModel().getLinks();
        for (let link in links){
            if (links[link].linkType === this.state.constraintLink){
                links[link].removeConstraintByIndex(this.state.constraint);
            }
        }
    }

    handleChangeNewConstraint(event) {
        this.setState({newConstraint: event.target.value});
    }

    handleChangeConstraint(event) {
        this.setState({constraint: event.target.value});
    }

    handleChangeConstraintLink(event) {
        this.setState({constraintLink: event.target.value});
    }


    focus(){
        if (LinkPool[this.state.constraintLink][3].length === 1) {
            this.setState({
                constraint: LinkPool[this.state.constraintLink][3][0]
            });
        }
    }

    render(){
        let constraintLinkList = Object.keys(LinkPool).map((link, i) => {
            return (
                <option key={i} value={link}>{link}</option>
            )
        });
        let constraintList = <option value={""}></option>;
        if (this.state.constraintLink !== undefined) {
            constraintList = LinkPool[this.state.constraintLink][3].map((constraint, i) =>
                <option key={i} value={i}>{constraint.statement}</option>
            );
        }

        let constraintListLength = constraintList.length;
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.constraintsSettingsHeader}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{Locale.constraintHelp}</p>
                        <FormControl
                            componentClass="select"
                            bsSize="small"
                            value={this.state.constraintLink}
                            onChange={this.handleChangeConstraintLink}
                        >
                            {constraintLinkList}
                        </FormControl>
                        <FormGroup>
                            <FormControl
                                componentClass="select"
                                bsSize="small"
                                value={this.state.constraint}
                                onChange={this.handleChangeConstraint}
                                onFocus={this.focus}
                                size={constraintListLength < 2 ? 2 : constraintListLength}
                                style={{height: 300}}
                            >
                                {constraintList}
                            </FormControl>
                            <Button onClick={this.deleteConstraint}
                                    bsStyle="danger">{Locale.del}</Button>
                        </FormGroup>
                        <h4>{Locale.createNew+Locale.constraint}</h4>
                        <Form>

                            <FormControl
                                type="text"
                                style={{width: "500px"}}
                                value={this.state.newConstraint}
                                placeholder={Locale.constraintPlaceholder}
                                onChange={this.handleChangeNewConstraint}
                            />
                            <FormControl
                                type="text"
                                style={{width: "500px"}}
                                value={this.state.newDescription}
                                placeholder={Locale.description}
                                onChange={this.handleChangeNewDescription}
                            />
                            <Button onClick={this.addConstraint} bsStyle="primary">{Locale.add}</Button>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal} bsStyle="primary">{Locale.close}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}