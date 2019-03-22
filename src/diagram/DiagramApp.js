import React from "react";
import {Defaults} from "../config/Defaults";
import {PointModel} from "storm-react-diagrams";
import {MenuPanel} from "../panels/MenuPanel";
import {ElementPanel} from "../panels/ElementPanel";
import {DetailPanel} from "../panels/DetailPanel";
import {DiagramCanvas} from "./DiagramCanvas";
import {OntoDiagramModel} from "./OntoDiagramModel";
import {Locale} from "../config/Locale";
import {ContextMenuLink} from "../misc/ContextMenuLink";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import PropTypes from "prop-types";
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";


export class DiagramApp extends React.Component {
    constructor(props) {
        super(props);
        document.title = Locale.untitled + " | " + Locale.appName;
        this.state = {
            selectedLink: Defaults.selectedLink,
            firstCardinality: Defaults.cardinality,
            secondCardinality: Defaults.cardinality,
            language: Defaults.language,
            panelObject: null,
            name: Locale.untitled,
            notes: "",
            contextMenuActive: false,
            contextMenuX: 0,
            contextMenuY: 0,
            contextMenuLink: null,
            saveData: "",
            success: true
        };

        if (!this.props.disableSCSS) {
            require("../sass/main.scss");
            require("babel-core/register");
            require("babel-polyfill");
        }


        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);
        this.handleChangeFirstCardinality = this.handleChangeFirstCardinality.bind(this);
        this.handleChangeSecondCardinality = this.handleChangeSecondCardinality.bind(this);
        this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
        this.handleChangePanelObject = this.handleChangePanelObject.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.serialize = this.serialize.bind(this);
        this.deserialize = this.deserialize.bind(this);
        this.export = this.export.bind(this);
        this.handleSerialize = this.handleSerialize.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.centerView = this.centerView.bind(this);
        this.setName = this.setName.bind(this);
        this.handleChangeNotes = this.handleChangeNotes.bind(this);
        this.updateLinkPosition = this.updateLinkPosition.bind(this);
    }

    updateLinkPosition(node: NodeCommonModel) {
        this.diagramCanvas.engine.repaintCanvas();
        for (let portKey in node.getPorts()) {
            let port = node.getPorts()[portKey];
            let coords = this.diagramCanvas.engine.getPortCenter(port);

            for (let linkKey in port.getLinks()) {
                let link = port.getLinks()[linkKey];

                if (link.getSourcePort() === port) {
                    if (port.getName() === "left" || port.getName() === "right"){
                        coords.y +=8;
                    }

                    if (port.getName() === "bottom"){
                        coords.y +=16;
                    }
                    link.points[0].updateLocation(coords);
                }

                if (link.getTargetPort() === port) {

                    if (port.getName() === "left" || port.getName() === "right"){
                        coords.y +=8;
                    }

                    if (port.getName() === "bottom"){
                        coords.y +=16;
                    }

                    link.points[link.points.length - 1].updateLocation(coords);
                }
            }
        }


    }

    componentDidMount() {
        if (typeof this.props.loadDiagram === "string") {
            this.deserialize(this.props.loadDiagram);
        }
        if (this.props.readOnly) {
            this.diagramCanvas.engine.getDiagramModel().setLocked(true);
        }
    }


    showContextMenu(x: number, y: number, link: LinkCommonModel) {
        this.setState({
            contextMenuActive: true,
            contextMenuX: x,
            contextMenuY: y,
            contextMenuLink: link
        });
    }

    handleChangeSelectedLink(linkType) {
        this.setState({selectedLink: linkType});
        this.diagramCanvas.engine.getDiagramModel().selectedLink = linkType;
    }

    handleChangeFirstCardinality(event) {
        this.setState({firstCardinality: event.target.value});
        this.diagramCanvas.engine.getDiagramModel().firstCardinality = event.target.value;
    }

    handleChangeSecondCardinality(event) {
        this.setState({secondCardinality: event.target.value});
        this.diagramCanvas.engine.getDiagramModel().secondCardinality = event.target.value;
    }

    handleChangeLanguage(event) {
        this.setState({language: event.target.value});
        this.diagramCanvas.engine.getDiagramModel().language = event.target.value;
        let links = this.diagramCanvas.engine.getDiagramModel().getLinks();
        for (let link in links) {
            links[link].setNameLanguage(event.target.value);
        }
        this.diagramCanvas.forceUpdate();
    }

    handleChangePanelObject(thing) {
        if (thing instanceof PointModel) {
            this.setState({panelObject: thing.getLink()});
        } else {
            this.setState({panelObject: thing});
        }
    }

    handleChangeName(event) {
        if (event === "") {
            event = "untitled";
        }
        this.setState({name: event});
        document.title = event + " | " + Locale.appName;
        this.diagramCanvas.engine.getDiagramModel().name = event;

    }

    handleChangeNotes(event) {
        this.setState({notes: event});
        this.diagramCanvas.engine.getDiagramModel().notes = event;
    }

    handleNew() {
        this.diagramCanvas.registerFactories();
        this.diagramCanvas.engine.setDiagramModel(new OntoDiagramModel(this.diagramCanvas.props, this.diagramCanvas));
        document.title = Locale.untitledDiagram + " | " + Locale.appName;
        this.setState({name: Locale.untitledDiagram});
        this.diagramCanvas.forceUpdate();
    }

    serialize() {
        this.diagramCanvas.serialize();
    }

    deserialize(diagram: string) {
        let response = this.diagramCanvas.deserialize(diagram);
        if (response){
            this.setState({language: Defaults.language, selectedLink: Defaults.selectedLink, success: true});
        } else {
            this.setState({success: false});
        }

    }

    export() {
        this.diagramCanvas.export();
    }

    hideContextMenu() {
        this.setState({contextMenuActive: false});
    }

    handleSerialize(str) {
        this.setState({saveData: str});
    }

    handleZoom() {
        this.diagramCanvas.engine.getDiagramModel().zoom = 100;
    }

    centerView() {
        this.diagramCanvas.engine.getDiagramModel().setOffsetX(0);
        this.diagramCanvas.engine.getDiagramModel().setOffsetY(0);
    }

    setName(str: string) {
        this.setState({name: str});
    }

    render() {
        if (this.props.readOnly) {
            return (
                <div className="content"
                     onContextMenu={event => {
                         event.preventDefault();
                     }}
                     onClick={this.hideContextMenu}
                >
                    <MenuPanel
                        handleChangeSelectedLink={this.handleChangeSelectedLink}
                        handleChangeFirstCardinality={this.handleChangeFirstCardinality}
                        handleChangeSecondCardinality={this.handleChangeSecondCardinality}
                        handleChangeLanguage={this.handleChangeLanguage}
                        handleChangeName={this.handleChangeName}
                        handleNew={this.handleNew}
                        selectedLink={this.state.selectedLink}
                        firstCardinality={this.state.firstCardinality}
                        secondCardinality={this.state.secondCardinality}
                        language={this.state.language}
                        name={this.state.names}
                        notes={this.state.notes}
                        saveData={this.state.saveData}
                        handleSerialize={this.serialize}
                        handleDeserialize={this.deserialize}
                        handleExport={this.export}
                        readOnly={this.props.readOnly}
                    />
                    <DiagramCanvas
                        ref={instance => {
                            this.diagramCanvas = instance;
                        }}
                        handleSerialize={this.handleSerialize}
                        selectedLink={this.state.selectedLink}
                        firstCardinality={this.state.firstCardinality}
                        secondCardinality={this.state.secondCardinality}
                        language={this.state.language}
                        handleChangePanelObject={this.handleChangePanelObject}
                        contextMenuActive={this.state.contextMenuActive}
                        contextMenuX={this.state.contextMenuX}
                        contextMenuY={this.state.contextMenuY}
                        contextMenuLink={this.state.contextMenuLink}
                        showContextMenu={this.showContextMenu}
                        setName={this.setName}
                    />
                </div>
            );
        } else {
            return (
                <div className="content"
                     onContextMenu={event => {
                         event.preventDefault();
                     }}
                     onClick={this.hideContextMenu}
                >
                    <MenuPanel
                        handleChangeNotes={this.handleChangeNotes}
                        handleChangeSelectedLink={this.handleChangeSelectedLink}
                        handleChangeFirstCardinality={this.handleChangeFirstCardinality}
                        handleChangeSecondCardinality={this.handleChangeSecondCardinality}
                        handleChangeLanguage={this.handleChangeLanguage}
                        handleChangeName={this.handleChangeName}
                        handleNew={this.handleNew}
                        selectedLink={this.state.selectedLink}
                        firstCardinality={this.state.firstCardinality}
                        secondCardinality={this.state.secondCardinality}
                        language={this.state.language}
                        name={this.state.name}
                        notes={this.state.notes}
                        handleSerialize={this.serialize}
                        handleDeserialize={this.deserialize}
                        handleExport={this.export}
                        readOnly={this.props.readOnly}
                        saveData={this.state.saveData}
                        centerView={this.centerView}
                        restoreZoom={this.handleZoom}
                        success={this.state.success}
                    />
                    <ElementPanel
                        handleChangeSelectedLink={this.handleChangeSelectedLink}
                        selectedLink={this.state.selectedLink}
                    />
                    <DetailPanel
                        panelObject={this.state.panelObject}
                        language={this.state.language}
                        updateLinkPosition={this.updateLinkPosition}
                    />
                    <DiagramCanvas
                        ref={instance => {
                            this.diagramCanvas = instance;
                        }}
                        selectedLink={this.state.selectedLink}
                        firstCardinality={this.state.firstCardinality}
                        secondCardinality={this.state.secondCardinality}
                        language={this.state.language}
                        handleChangePanelObject={this.handleChangePanelObject}
                        contextMenuActive={this.state.contextMenuActive}
                        contextMenuX={this.state.contextMenuX}
                        contextMenuY={this.state.contextMenuY}
                        contextMenuLink={this.state.contextMenuLink}
                        showContextMenu={this.showContextMenu}
                        handleSerialize={this.handleSerialize}
                        setName={this.setName}
                    />
                    <ContextMenuLink
                        contextMenuActive={this.state.contextMenuActive}
                        contextMenuX={this.state.contextMenuX}
                        contextMenuY={this.state.contextMenuY}
                        contextMenuLink={this.state.contextMenuLink}
                    />
                </div>
            );
        }

    }
}

DiagramApp.propTypes = {
    loadDiagram: PropTypes.string,
    readOnly: PropTypes.bool
};