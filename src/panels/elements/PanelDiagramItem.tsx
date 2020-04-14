import React from 'react';
import {Diagrams, graph, ProjectSettings} from "../../var/Variables";
import {Button, Form, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import * as LocaleMain from "../../locale/LocaleMain.json";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import {changeDiagrams, loadDiagram, saveDiagram} from "../../misc/Helper";

interface Props {
    diagram: number;
    update: Function;
    selectedDiagram: number;
}

interface State {
    hover: boolean;
    modalEdit: boolean;
    modalRemove: boolean;
    inputEdit: string;
    name: string;
}

const tooltipE = (
    <Tooltip id="tooltipE">{LocaleMain.renameDiagram}</Tooltip>
);

export default class PanelDiagramItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hover: false,
            modalEdit: false,
            modalRemove: false,
            inputEdit: Diagrams[this.props.diagram].name,
            name: this.props.diagram === ProjectSettings.selectedDiagram ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram"
        };
        this.alertPanel = this.alertPanel.bind(this);
    }

    alertPanel() {
        if (this.props.diagram !== ProjectSettings.selectedDiagram) {
            Diagrams[ProjectSettings.selectedDiagram].json = saveDiagram();
            let load = Diagrams[this.props.diagram].json;
            if (Object.keys(load).length === 0) {
                graph.clear();
            } else {
                loadDiagram(load);
            }
            ProjectSettings.selectedDiagram = this.props.diagram;
            this.setClassName();
            this.props.update();

        }
    }

    componentDidMount(): void {
        this.setClassName();
    }

    componentDidUpdate(prevProps: { selectedDiagram: any }) {
        if (prevProps.selectedDiagram !== this.props.selectedDiagram) {
            this.setClassName();
            this.forceUpdate();
        }
    }

    // componentDidUpdate(prevProps: { selectedLink: any; }) {
    //     if (prevProps.selectedLink !== ProjectSettings.selectedModel) {
    //         this.setClassName();
    //         this.forceUpdate();
    //     }
    // }

    setClassName() {
        this.setState({name: this.props.diagram === ProjectSettings.selectedDiagram ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram"});
    }

    render() {
        return (<div>
                <div>
                    <div
                        className={this.state.name}
                        onClick={this.alertPanel}
                        onMouseOver={(event) => {
                            this.setState({hover: true})
                        }}
                        onMouseLeave={(event) => {
                            this.setState({hover: false})
                        }}
                    >
                        <span className={"label"}>{Diagrams[this.props.diagram].name}</span>
                        <span className={"packageOptions right"}
                              style={{display: this.state.hover ? "inline-block" : "none"}}>
                               <OverlayTrigger  overlay={tooltipE}
                                               popperConfig={{
                                                   modifiers: {
                                                       preventOverflow: {
                                                           enabled: false
                                                       }
                                                   }
                                               }}
                                               placement={"bottom"}
                               >
                                    <button className={"buttonlink"} onClick={() => {
                                    this.setState({modalEdit: true})
                                    }} ><span role="img" aria-label={""}>✏</span></button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    popperConfig={{
                                        modifiers: {
                                            preventOverflow: {
                                                enabled: false
                                            }
                                        }
                                    }}
                                    placement={"bottom"}
                                    overlay={
                                        (<Tooltip id={"tltip"} >{LocaleMain.del}</Tooltip>)
                                    }>
                                    <button className={"buttonlink"} onClick={() => {
                                    this.setState({modalRemove: true})
                                    }} ><span role="img" aria-label={""}>❌</span></button>
                                </OverlayTrigger>
                        </span>
                    </div>
                </div>
                <div>
                    <Modal centered show={this.state.modalEdit}>
                        <Modal.Header>
                            <Modal.Title>{LocaleMenu.modalEditDiagramTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                <Form.Control onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputEdit: event.currentTarget.value})
                                }} type="text" value={this.state.inputEdit}
                                              placeholder={LocaleMain.modalEditDiagramPlaceholder}
                                              required/>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => {
                                this.setState({modalEdit: false});
                            }} variant="secondary">{LocaleMenu.cancel}</Button>
                            <Button onClick={() => {
                                Diagrams[this.props.diagram].name = this.state.inputEdit;
                                this.setState({modalEdit: false});
                            }}>{LocaleMenu.confirm}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal centered show={this.state.modalRemove}>
                        <Modal.Header>
                            <Modal.Title>{LocaleMenu.modalRemoveDiagramTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{LocaleMenu.modalRemoveDiagramDescription}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => {
                                this.setState({modalRemove: false});
                            }} variant="secondary">{LocaleMenu.cancel}</Button>
                            <Button onClick={() => {
                                delete Diagrams[this.props.diagram];
                                if (ProjectSettings.selectedDiagram.name === this.props.diagram) {
                                    changeDiagrams(Object.keys(Diagrams)[0]);
                                }
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