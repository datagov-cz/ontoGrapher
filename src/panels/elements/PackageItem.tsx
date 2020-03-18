import React from 'react';
import {ProjectElements, ProjectSettings, Stereotypes} from "../../var/Variables";
import {Button, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {PackageNode} from "../../components/PackageNode";
import * as LocaleMain from "../../locale/LocaleMain.json";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {deletePackageItem} from "../../misc/Helper";

interface Props {
    label: string;
    id: string;
    depth: number;
    update: Function;
}

interface State {
    hover: boolean;
    modalRemove: boolean;
}

const tooltipD = (
    <Tooltip id="tooltipS">{LocaleMain.del}</Tooltip>
);

export default class PackageItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hover: false,
            modalRemove: false,
        }
    }

    render() {
        return (<div>
                <div draggable
                     onDragStart={(event) => {
                         event.dataTransfer.setData("newClass", JSON.stringify({
                             type: "package",
                             elem: this.props.id,
                             package: false
                         }));
                     }}
                     onMouseOver={() => {
                         this.setState({hover: true})
                     }}
                     onMouseLeave={() => {
                         this.setState({hover: false})
                     }}
                     className={"stereotypeElementItem" + (ProjectElements[this.props.id].hidden[ProjectSettings.selectedDiagram] ? " hidden" : "")}
                     style={{marginLeft: ((this.props.depth * 10) + 5) + "px"}}>
                    <span className={"label"}>{this.props.label}</span>
                    <span className={"packageOptions right"}
                          style={{display: this.state.hover ? "inline-block" : "none"}}>
                        <OverlayTrigger placement="bottom" overlay={tooltipD}><a onClick={() => {
                            this.setState({modalRemove: true})
                        }} href="#">❌</a></OverlayTrigger>
                    </span>
                </div>
                <div>
                    <Modal centered show={this.state.modalRemove}>
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
                                this.setState({modalRemove: false});
                                this.props.update();
                            }}>{LocaleMenu.confirm}</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}