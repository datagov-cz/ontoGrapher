import React from "react";
import {Defaults} from "../components/misc/Defaults";
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
import {BottomPanel} from "../panels/BottomPanel";
import * as OclEngine from "../misc/ocl.min";
import * as SemanticWebInterface from "../misc/SemanticWebInterface";
import {Constraint} from "../components/misc/Constraint";
import {LinkPool} from "../config/LinkVariables";
import * as Helper from "../misc/Helper";


export class DiagramApp extends React.Component {
    constructor(props) {
        super(props);
        document.title = Locale.untitledDiagram + " | " + Locale.appName;
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
            success: true,
            bottomPanelActive: false,
            bottomPanelData: null,
            validationResults: [],
            exportData: ""
        };

        if (!this.props.disableSCSS) {
            require("../sass/main.scss");
            require("babel-core/register");
            require("babel-polyfill");
            require("../misc/sax.js");
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
        this.evaluate = this.evaluate.bind(this);
        this.handleCloseBottomPanel = this.handleCloseBottomPanel.bind(this);
        this.handleLocate = this.handleLocate.bind(this);
        this.validateModel = this.validateModel.bind(this);
        this.validateSettings = this.validateSettings.bind(this);
        this.validateCurrent = this.validateCurrent.bind(this);
        this.addConstraintGlobal = this.addConstraintGlobal.bind(this);
        this.deleteConstraintGlobal = this.deleteConstraintGlobal.bind(this);
        this.updateLinkPositionDelete = this.updateLinkPositionDelete.bind(this);
    }

    componentDidMount() {
        if (typeof this.props.loadSettings === "string") {
            SemanticWebInterface.importSettings(this.props.loadSettings);
        }
        if (typeof this.props.loadDiagram === "string") {
            this.deserialize(this.props.loadDiagram);
        }
        if (this.props.readOnly) {
            this.diagramCanvas.engine.getDiagramModel().setLocked(true);
        }
        if (typeof this.props.loadOntology === "string"){
            SemanticWebInterface.fetchStereotypes(this.props.loadOntology,true, function(){
                this.forceUpdate();
            }.bind(this));
        }
    }

    addConstraintGlobal(constraint: Constraint){
        let links = this.diagramCanvas.engine.getDiagramModel().getLinks();
        for (let link in links){
            console.log(link);
            if (links[link].linkType === constraint.linkType){
                links[link].constraints.push(constraint);
            }
        }
    }

    deleteConstraintGlobal(constraintIndex: number, linkType: string){
        let links = this.diagramCanvas.engine.getDiagramModel().getLinks();
        for (let link in links){
            if (links[link].linkType === linkType){
                links[link].removeConstraintByIndex(constraintIndex);
            }
        }
    }

    validateCurrent(){
        let errors = SemanticWebInterface.validateCurrent(this.diagramCanvas.engine.getDiagramModel());
        this.setState({
            validationResults: errors
        });
    }

    validateModel(source: string) {
        let errors = SemanticWebInterface.validateSettingsWithModel(this.diagramCanvas.engine.getDiagramModel(), source);
        this.setState({
            validationResults: errors
        });
    }

    validateSettings(source: string) {
        let errors = SemanticWebInterface.validateSettingsWithCurrentSettings(source);
        this.setState({
            validationResults: errors
        });
    }

    handleLocate(element){
        let links = this.diagramCanvas.engine.getDiagramModel().getLinks();
        let current = links[element];
        for (let link in links){
            let color = links[link].color === "black" ? "black" : "red";
            links[link].setColor(color);
        }
        if (current instanceof LinkCommonModel){
            current.setColor("yellow");
            current = current.getFirstPoint();
        }
        this.diagramCanvas.engine.getDiagramModel().setOffsetX(current.x);
        this.diagramCanvas.engine.getDiagramModel().setOffsetY(current.y);
    }

    handleCloseBottomPanel(){
        let links = this.diagramCanvas.engine.getDiagramModel().getLinks();
        for (let link in links) {
            links[link].setColor("black");
        }
        this.setState({bottomPanelActive: false});
    }

    evaluate(){
        let result = {};
        const oclEngine = OclEngine.create();
        let links = this.diagramCanvas.engine.getDiagramModel().getLinks();
        for (let link in links) {
            links[link].setColor("black");
        }
        for (let link in links){
            if (links[link].getTargetPort() === null || links[link].getTargetPort() === undefined){
                if (!(link in result)){
                    result[link] = [];
                }
                links[link].setColor("red");
                result[link].push("self.getTargetPort() <> null");
                continue;
            }
            for (let constraint of links[link].constraints){
                oclEngine.addOclExpression(constraint.constructStatement());
                let individualResult = oclEngine.evaluate(links[link]);
                if (!individualResult.getResult()){
                    if (!(link in result)){
                        result[link] = [];
                    }
                    result[link].push(constraint.statement);
                    links[link].setColor("red");
                }
                oclEngine.clearAllOclExpressions();
            }
        }

        this.setState({
           bottomPanelActive: true,
           bottomPanelData: result
        });
    }

    updateLinkPosition(node: NodeCommonModel) {
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
                    link.getFirstPoint().updateLocation(coords);
                }

                if (link.getTargetPort() === port) {

                    if (port.getName() === "left" || port.getName() === "right"){
                        coords.y +=8;
                    }

                    if (port.getName() === "bottom"){
                        coords.y +=16;
                    }

                    link.getLastPoint().updateLocation(coords);
                }
            }
        }


    }

    updateLinkPositionDelete(node: NodeCommonModel) {
        for (let portKey in node.getPorts()) {
            let port = node.getPorts()[portKey];
            let coords = this.diagramCanvas.engine.getPortCenter(port);

            for (let linkKey in port.getLinks()) {
                let link = port.getLinks()[linkKey];

                if (link.getSourcePort() === port) {
                    if (port.getName() === "left" || port.getName() === "right"){
                        coords.y +=8-16;
                    }

                    if (port.getName() === "bottom"){
                        coords.y +=16-16;
                    }
                    link.getFirstPoint().updateLocation(coords);
                }

                if (link.getTargetPort() === port) {

                    if (port.getName() === "left" || port.getName() === "right"){
                        coords.y +=8-16;
                    }

                    if (port.getName() === "bottom"){
                        coords.y +=16-16;
                    }

                    link.getLastPoint().updateLocation(coords);
                }
            }
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
        let owl = SemanticWebInterface.exportDiagram(this.diagramCanvas.engine.getDiagramModel());
        let serializer = new XMLSerializer();
        let owlSerialized = serializer.serializeToString(owl);
        this.setState({exportData: owlSerialized});
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
        this.diagramCanvas.engine.getDiagramModel().setOffsetX(Defaults.offset.x);
        this.diagramCanvas.engine.getDiagramModel().setOffsetY(Defaults.offset.y);
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
                        handleEvaluate={this.evaluate}
                        validateSettings={this.validateSettings}
                        validateModel={this.validateModel}
                        validationResults={this.state.validationResults}
                        validateCurrent={this.validateCurrent}
                        exportData={this.state.exportData}
                        addConstraintGlobal={this.addConstraintGlobal}
                        deleteConstraintGlobal={this.deleteConstraintGlobal}
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
                        handleEvaluate={this.evaluate}
                        validateSettings={this.validateSettings}
                        validateModel={this.validateModel}
                        validationResults={this.state.validationResults}
                        validateCurrent={this.validateCurrent}
                        exportData={this.state.exportData}
                        addConstraintGlobal={this.addConstraintGlobal}
                        deleteConstraintGlobal={this.deleteConstraintGlobal}
                    />
                    <ElementPanel
                        handleChangeSelectedLink={this.handleChangeSelectedLink}
                        selectedLink={this.state.selectedLink}
                    />
                    <DetailPanel
                        panelObject={this.state.panelObject}
                        language={this.state.language}
                        updateLinkPosition={this.updateLinkPosition}
                        updateLinkPositionDelete={this.updateLinkPositionDelete}
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
                    <BottomPanel
                        bottomPanelActive={this.state.bottomPanelActive}
                        bottomPanelData={this.state.bottomPanelData}
                        handleCloseBottomPanel={this.handleCloseBottomPanel}
                        handleEvaluate={this.evaluate}
                        handleLocate={this.handleLocate}
                    />
                    <ContextMenuLink
                        contextMenuActive={this.state.contextMenuActive}
                        contextMenuX={this.state.contextMenuX}
                        contextMenuY={this.state.contextMenuY}
                        contextMenuLink={this.state.contextMenuLink}
                        updateLinkPosition={this.updateLinkPosition}
                    />

                </div>
            );
        }

    }
}

DiagramApp.propTypes = {
    loadDiagram: PropTypes.string,
    readOnly: PropTypes.bool,
    loadSettings: PropTypes.string,
    loadOntology: PropTypes.string
};