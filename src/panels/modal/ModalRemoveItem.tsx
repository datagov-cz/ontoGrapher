import React from 'react';
import {Button, Modal} from "react-bootstrap";
import {deletePackageItem} from "../../function/FunctionEditVars";
import {mergeTransactions, processTransaction, updateDeleteTriples} from "../../interface/TransactionInterface";
import {ProjectElements, ProjectSettings, Schemes, VocabularyElements} from "../../config/Variables";
import {Locale} from "../../config/Locale";

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
        this.props.handleChangeLoadingStatus(true, Locale[ProjectSettings.viewLanguage].updating, false);
        processTransaction(ProjectSettings.contextEndpoint, mergeTransactions(
            deletePackageItem(this.props.id), {
                add: [],
                delete: [],
                update: updateDeleteTriples(ProjectElements[this.props.id].iri,
                    Schemes[VocabularyElements[ProjectElements[this.props.id].iri].inScheme].graph, true, true)
            })).then(result => {
            if (result) {
                this.props.handleChangeLoadingStatus(false, "", false);
            } else {
                this.props.handleChangeLoadingStatus(false, Locale[ProjectSettings.viewLanguage].errorUpdating, true);
            }
        });
    }

    render() {
        return (
            <Modal centered show={this.props.modal}>
                <Modal.Header>
                    <Modal.Title>{Locale[ProjectSettings.viewLanguage].modalRemovePackageItemTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{Locale[ProjectSettings.viewLanguage].modalRemovePackageItemDescription}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        this.props.close();
                    }} variant="secondary">{Locale[ProjectSettings.viewLanguage].cancel}</Button>
                    <Button onClick={() => {
                        this.save();
                        this.props.close();
                        this.props.update();
                    }}>{Locale[ProjectSettings.viewLanguage].confirm}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}