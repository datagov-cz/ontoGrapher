import React from 'react';
import {Button, Modal} from "react-bootstrap";
import {deletePackageItem} from "../../function/FunctionEditVars";
import {updateDeleteProjectElement} from "../../interface/TransactionInterface";
import {ProjectElements, ProjectSettings} from "../../config/Variables";
import {Locale} from "../../config/Locale";

interface Props {
    modal: boolean;
    id: string;
    close: Function;
    update: Function;
    handleChangeLoadingStatus: Function;
    projectLanguage: string;
}

interface State {

}

export default class ModalRemoveItem extends React.Component<Props, State> {

    save() {
        updateDeleteProjectElement(ProjectSettings.contextEndpoint, ProjectElements[this.props.id].iri).then(result => {
            this.props.handleChangeLoadingStatus(true, Locale[this.props.projectLanguage].updating, false);
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
                    <Modal.Title>{Locale[this.props.projectLanguage].modalRemovePackageItemTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{Locale[this.props.projectLanguage].modalRemovePackageItemDescription}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        this.setState({modalRemove: false});
                    }} variant="secondary">{Locale[this.props.projectLanguage].cancel}</Button>
                    <Button onClick={() => {
                        this.save();
                        this.props.close();
                        this.props.update();
                    }}>{Locale[this.props.projectLanguage].confirm}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}