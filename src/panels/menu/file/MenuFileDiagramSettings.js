import React from "react";
import {MenuAbstractDropdownModal} from "../abstract/MenuAbstractDropdownModal"
import {Locale} from "../../../config/Locale";
import {Button, FormControl, MenuItem, Modal} from "react-bootstrap";

export class MenuFileDiagramSettings extends MenuAbstractDropdownModal {
    constructor(props){
        super(props);

        this.state = {
            modal: false,
            inputName: "",
            inputNotes: ""
        };

        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeNotes = this.handleChangeNotes.bind(this);
        this.handleName = this.handleName.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.canvas !== prevProps.canvas){
            this.setState({
                inputName: this.props.canvas.engine.getDiagramModel().getName(),
                inputNotes: this.props.canvas.engine.getDiagramModel().getNotes()
            });
        }
    }

    handleChangeName(event){
        this.setState({inputName: event.target.value});
    }

    handleChangeNotes(event){
        this.setState({inputNotes: event.target.value});
    }

    handleName(){
        this.handleCloseModal();
        this.props.handleChangeName(this.state.inputName);
        this.props.handleChangeNotes(this.state.inputNotes);
    }

    render(){
        return (
            <div>
                {this.getMenuItem()}

                <Modal show={this.state.modal} onHide={this.handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {Locale.menuModalNameHeading}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{Locale.menuModalNameText}</p>
                        <FormControl
                            bsSize="small"
                            type="text"
                            value={this.state.inputName}
                            placeholder={Locale.menuModalNameHeading}
                            onChange={this.handleChangeName}
                        />
                        <p>{Locale.notes}</p>
                        <FormControl
                            style={{height: 50, resize: "none"}}
                            bsSize="small"
                            componentClass="textarea"
                            placeholder={Locale.notes}
                            value={this.state.inputNotes}
                            onChange={this.handleChangeNotes}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleCloseModal}>{Locale.close}</Button>
                        <Button onClick={this.handleName} bsStyle="primary">{Locale.confirm}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}