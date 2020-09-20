import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {deletePackageItem} from "../../function/FunctionEditVars";
import {updateDeleteProjectElement} from "../../interface/TransactionInterface";
import {ProjectElements, ProjectSettings, Schemes, VocabularyElements} from "../../config/Variables";
import * as LocaleMain from "../../locale/LocaleMain.json";

interface Props {
    modal: boolean;
    id: string;
    close: Function;
    update: Function;
    handleChangeLoadingStatus: Function;
}

interface State {

}

export default class ModalRemoveItem extends React.Component<Props, State> {

    save() {
        updateDeleteProjectElement(ProjectSettings.contextEndpoint, ProjectElements[this.props.id].iri,
            Schemes[VocabularyElements[ProjectElements[this.props.id].iri].inScheme].graph).then(result => {
            this.props.handleChangeLoadingStatus(true, LocaleMain.updating, false);
            if (result) {
                deletePackageItem(this.props.id);
                this.props.handleChangeLoadingStatus(false, "", false);
            } else {
                this.props.handleChangeLoadingStatus(false, "", true);
            }
        });
    }

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
                        this.save();
                        this.props.close();
                        this.props.update();
                    }}>{LocaleMenu.confirm}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}