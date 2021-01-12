import React from 'react';
import {Button, Form, Modal} from "react-bootstrap";
import {deletePackageItem} from "../../function/FunctionEditVars";
import {mergeTransactions, updateDeleteTriples} from "../../interface/TransactionInterface";
import {ProjectElements, ProjectSettings, Schemes, VocabularyElements} from "../../config/Variables";
import {Locale} from "../../config/Locale";

interface Props {
    modal: boolean;
    id: string;
    close: Function;
    update: Function;
    performTransaction: (transaction: { add: string[], delete: string[], update: string[] }) => void;
}

interface State {

}

export default class ModalRemoveItem extends React.Component<Props, State> {

    save() {
        this.props.performTransaction(mergeTransactions(
            deletePackageItem(this.props.id), {
                add: [],
                delete: [],
                update: updateDeleteTriples(ProjectElements[this.props.id].iri,
                    Schemes[VocabularyElements[ProjectElements[this.props.id].iri].inScheme].graph, true, true)
            }));
    }

    render() {
        return (
            <Modal centered show={this.props.modal} keyboard onEscapeKeyDown={() => this.props.close()}
                   onEntering={() => {
                       let elem = document.getElementById("modalRemoveItemConfirm");
                       if (elem) elem.focus();
                   }}>
                <Modal.Header>
                    <Modal.Title>{Locale[ProjectSettings.viewLanguage].modalRemovePackageItemTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{Locale[ProjectSettings.viewLanguage].modalRemovePackageItemDescription}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Form onSubmit={event => {
                        event.preventDefault();
                        this.save();
                        this.props.close();
                        this.props.update();
                    }}>
                        <Button type={"submit"}
                                id={"modalRemoveItemConfirm"}>{Locale[ProjectSettings.viewLanguage].confirm}</Button>
                    </Form>
                    <Button onClick={() => {
                        this.props.close();
                    }} variant="secondary">{Locale[ProjectSettings.viewLanguage].cancel}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}