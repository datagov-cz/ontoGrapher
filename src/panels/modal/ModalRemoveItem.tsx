import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {deletePackageItem} from "../../function/FunctionEditVars";

interface Props {
    modal: boolean;
    id: string;
    close: Function;
    update: Function;
}

interface State {

}

export default class ModalRemoveItem extends React.Component<Props, State> {

    render() {
        return (
            <Modal centered show={this.props.modal}>
                <Modal.Header>
                    <Modal.Title>{LocaleMenu.modalRemovePackageItemTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{LocaleMenu.modalRemovePackageItemDescription}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        this.setState({modalRemove: false});
                    }} variant="secondary">{LocaleMenu.cancel}</Button>
                    <Button onClick={() => {
                        deletePackageItem(this.props.id);
                        this.props.close();
                        this.props.update();
                    }}>{LocaleMenu.confirm}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}