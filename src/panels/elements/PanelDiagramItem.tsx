import React from 'react';
import {Diagrams, graph, ProjectElements, ProjectSettings} from "../../var/Variables";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {Button, Form, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {PackageNode} from "../../components/PackageNode";
import * as LocaleMain from "../../locale/LocaleMain.json";
import * as LocaleMenu from "../../locale/LocaleMenu.json";
import TableList from "../../components/TableList";
import {changeDiagrams, loadDiagram, saveDiagram} from "../../misc/Helper";

interface Props{
    diagram: number;
    update: Function;
    selectedModel: number;
}

interface State {
    hover: boolean;
    modalEdit: boolean;
    modalRemove: boolean;
    inputEdit: string;
    name:string;
}

const tooltipA = (
    <Tooltip id="tooltipS">{LocaleMain.addDiagram}</Tooltip>
);
const tooltipE = (
    <Tooltip id="tooltipS">{LocaleMain.renameDiagram}</Tooltip>
);
const tooltipD = (
    <Tooltip id="tooltipS">{LocaleMain.del}</Tooltip>
);
const tooltipU = (
    <Tooltip id="tooltipS">{LocaleMain.moveUp}</Tooltip>
);
const tooltipB = (
    <Tooltip id="tooltipS">{LocaleMain.moveDown}</Tooltip>
);

export default class PanelDiagramItem extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hover: false,
            modalEdit: false,
            modalRemove: false,
            inputEdit: Diagrams[this.props.diagram].name,
            name: this.props.diagram === ProjectSettings.selectedModel ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram"
        };
        this.alertPanel = this.alertPanel.bind(this);
        this.setClassName();
    }

    alertPanel() {
        if (this.props.diagram !== ProjectSettings.selectedModel){
            Diagrams[ProjectSettings.selectedModel].json = saveDiagram();
            let load = Diagrams[this.props.diagram].json;
            if (Object.keys(load).length === 0){
                graph.clear();
            } else {
                loadDiagram(load);
            }
            ProjectSettings.selectedModel = this.props.diagram;
            this.setClassName();
            this.props.update();



        //     Diagrams[ProjectSettings.selectedModel].json = JSON.stringify(graph.toJSON());
        //
        //     ProjectSettings.selectedModel = this.props.diagram;
        //
        //     let load = Diagrams[this.props.diagram].json;
        //     if (Object.keys(load).length === 0){
        //         graph.clear();
        //     } else {
        //         graph.fromJSON(JSON.parse(load));
        //     }
        //     this.setClassName();
        //     this.props.update();
        }
    }

    componentDidMount(): void {
        this.setClassName();
    }

    componentDidUpdate(prevProps:{selectedModel: any}) {
        if (prevProps.selectedModel !== this.props.selectedModel) {
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
        this.setState({name: this.props.diagram === ProjectSettings.selectedModel ? "stereotypeElementItem diagram selected" : "stereotypeElementItem diagram"});
    }

    render() {
        return (<div>
                <div>
                        <div className={this.state.name}
                             onClick={this.alertPanel}
                             onMouseOver={() => {
                                 this.setState({hover: true})
                             }}
                             onMouseLeave={() => {
                                 this.setState({hover: false})
                             }}
                        >
                            <span className={"label"}>{Diagrams[this.props.diagram].name}</span><span className={"packageOptions right"} style={{display: this.state.hover ? "inline-block" : "none"}}>
                            <OverlayTrigger placement="bottom" overlay={tooltipA}><a onClick={() => {
                                Diagrams.push({name: LocaleMain.untitled, json: {}});
                                for (let key of Object.keys(ProjectElements)){
                                    ProjectElements[key].hidden[Diagrams.length-1] = false;
                                }
                                this.props.update();
                            }} href="#">➕</a></OverlayTrigger>
                            <OverlayTrigger placement="bottom" overlay={tooltipE}><a onClick={() => {
                                this.setState({modalEdit: true})
                            }} href="#">✏</a></OverlayTrigger>
                            <OverlayTrigger placement="bottom" overlay={tooltipD}><a onClick={() => {
                                this.setState({modalRemove: true})
                            }} href="#">❌</a></OverlayTrigger>
                        </span>
                        </div>
                </div>
                <div>
                    <Modal centered show={this.state.modalEdit}>
                        <Modal.Header>
                            <Modal.Title>{LocaleMenu.modalEditDiagramTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Control onChange={(event: { currentTarget: { value: any; }; }) => {
                                    this.setState({inputEdit: event.currentTarget.value})
                                }} type="text" value={this.state.inputEdit}
                                              placeholder={LocaleMain.modalEditDiagramPlaceholder}
                                              required/>
                            </Form>
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
                                    if (ProjectSettings.selectedModel.name === this.props.diagram){
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