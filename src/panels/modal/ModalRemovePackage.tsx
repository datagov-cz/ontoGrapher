import React from 'react';
import {Button, Modal} from "react-bootstrap";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {ProjectElements} from "../../config/Variables";
import {PackageNode} from "../../datatypes/PackageNode";
import {graph} from "../../graph/Graph";

interface Props {
    modal: boolean;
    node: PackageNode;
    close: Function;
    update: Function;
}

interface State {

}

export default class ModalRemovePackage extends React.Component<Props, State> {

    render() {
        return (
            <Modal centered show={this.props.modal}>
                <Modal.Header>
                    <Modal.Title>{LocaleMenu.modalRemovePackageTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{LocaleMenu.modalRemovePackageDescription}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        this.setState({modalRemove: false});
                    }} variant="secondary">{LocaleMenu.cancel}</Button>
                    <Button onClick={() => {
                        if (this.props.node.parent) {
                            this.props.node.parent.children.splice(this.props.node.parent.children.indexOf(this.props.node), 1);
                            for (let id of this.props.node.elements) {
                                ProjectElements[id].active = false;
                                graph.getCell(id).remove();
                            }
                            this.props.close();
                            this.props.update();
                        }

                    }}>{LocaleMenu.confirm}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}