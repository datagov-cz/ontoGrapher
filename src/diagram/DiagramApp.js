import React from "react";
import {Defaults, DefaultVocabularies} from "../config/Defaults";
import {PointModel} from "storm-react-diagrams";
import {MenuPanel} from "../panels/menu/MenuPanel";
import {ElementPanel} from "../panels/ElementPanel";
import {DetailPanel} from "../panels/DetailPanel";
import {DiagramCanvas} from "./DiagramCanvas";
import {OntoDiagramModel} from "./OntoDiagramModel";
import {Locale} from "../config/locale/Locale";
import {ContextMenuLink} from "../misc/ContextMenuLink";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import PropTypes from "prop-types";
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {BottomPanel} from "../panels/BottomPanel";
import * as OclEngine from "../lib/ocl.min";
import * as SemanticWebInterface from "../misc/SemanticWebInterface";
import {MenuFileNewDiagram} from "../panels/menu/file/MenuFileNewDiagram";
import {MenuDropdownList} from "../panels/menu/MenuDropdownList";
import {MenuFileDiagramSettings} from "../panels/menu/file/MenuFileDiagramSettings";
import {MenuFileLoadDiagram} from "../panels/menu/file/MenuFileLoadDiagram";
import {MenuFileSaveDiagram} from "../panels/menu/file/MenuFileSaveDiagram";
import {MenuFileExportDiagram} from "../panels/menu/file/MenuFileExportDiagram";
import {MenuViewCenter} from "../panels/menu/view/MenuViewCenter";
import {MenuViewZoom} from "../panels/menu/view/MenuViewZoom";
import {MenuToolsValidate} from "../panels/menu/tools/MenuToolsValidate";
import {MenuToolsEvaluate} from "../panels/menu/tools/MenuToolsEvaluate";
import {MenuSettingsLanguages} from "../panels/menu/settings/MenuSettingsLanguages";
import {MenuSettingsNodes} from "../panels/menu/settings/MenuSettingsNodes";
import {MenuSettingsLinks} from "../panels/menu/settings/MenuSettingsLinks";
import {MenuSettingsCardinalities} from "../panels/menu/settings/MenuSettingsCardinalities";
import {MenuSettingsAttributeTypes} from "../panels/menu/settings/MenuSettingsAttributeTypes";
import {MenuSettingsImportExport} from "../panels/menu/settings/MenuSettingsImportExport";
import {MenuSettingsConstraints} from "../panels/menu/settings/MenuSettingsConstraints";
import {MenuButtonHelp} from "../panels/menu/buttons/MenuButtonHelp";
import {importSettings} from "../misc/ImportExportInterface";
import {getElements, getElementsFromMultipleSources} from "../misc/SPARQLinterface";
import {MenuSettingsVocabularies} from "../panels/menu/settings/MenuSettingsVocabularies";
import {StereotypePool} from "../config/Variables";

//TODO: update react-bootstrap
export class DiagramApp extends React.Component {
    constructor(props) {
        super(props);
        document.title = Locale.untitled + " | " + Locale.appName;
        this.diagramCanvas = React.createRef();
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
            require("../lib/sax.js");
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
        this.deserialize = this.deserialize.bind(this);
        this.setName = this.setName.bind(this);
        this.handleChangeNotes = this.handleChangeNotes.bind(this);
        this.updateLinkPosition = this.updateLinkPosition.bind(this);
        this.evaluate = this.evaluate.bind(this);
        this.handleCloseBottomPanel = this.handleCloseBottomPanel.bind(this);
        this.handleLocate = this.handleLocate.bind(this);
        this.updateLinkPositionDelete = this.updateLinkPositionDelete.bind(this);
    }

    componentDidMount() {
        if (typeof this.props.loadSettings === "string") {
            importSettings(this.props.loadSettings);
        }
        if (typeof this.props.loadDiagram === "string") {
            this.deserialize(this.props.loadDiagram);
        }
        if (this.props.readOnly) {
            this.diagramCanvas.current.setReadOnly(true);
        }
        if (typeof this.props.loadOntology === "string"){
            SemanticWebInterface.fetchStereotypes(this.props.loadOntology, this.props.typeIRI, true, function(){
                this.forceUpdate();
            }.bind(this));
        }
        if (this.props.loadDefaultVocabularies){
            getElementsFromMultipleSources(DefaultVocabularies, function(){
                this.forceUpdate();
            }.bind(this));
        }
    }

    handleLocate(element){
        let links = this.diagramCanvas.current.engine.getDiagramModel().getLinks();
        let current = links[element];
        for (let link in links){
            let color = links[link].color === "black" ? "black" : "red";
            links[link].setColor(color);
        }
        if (current instanceof LinkCommonModel){
            current.setColor("yellow");
            current = current.getFirstPoint();
        }
        this.diagramCanvas.current.engine.getDiagramModel().setOffsetX(current.x);
        this.diagramCanvas.current.engine.getDiagramModel().setOffsetY(current.y);
    }

    handleCloseBottomPanel(){
        let links = this.diagramCanvas.current.engine.getDiagramModel().getLinks();
        for (let link in links) {
            links[link].setColor("black");
        }
        this.setState({bottomPanelActive: false});
    }

    evaluate(){
        let result = {};
        const oclEngine = OclEngine.create();
        let links = this.diagramCanvas.current.engine.getDiagramModel().getLinks();
        for (let link in links) {
            links[link].setColor("black");
        }
        for (let link in links){
            if (links[link].getTargetPort() === null || links[link].getTargetPort() === undefined){
                if (!(link in result)){
                    result[link] = [];
                }
                links[link].setColor("red");
                result[link].push(Locale.constraintRelationshipTargetMissing);
                continue;
            }
            for (let constraint of links[link].constraints){
                oclEngine.addOclExpression(constraint.constructStatement());
                let individualResult = oclEngine.evaluate(links[link]);
                if (!individualResult.getResult()){
                    if (!(link in result)){
                        result[link] = [];
                    }
                    result[link].push(constraint.getDescription());
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
            let coords = this.diagramCanvas.current.engine.getPortCenter(port);

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
            let coords = this.diagramCanvas.current.engine.getPortCenter(port);

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

    deserialize(diagram: string) {
        let response = this.diagramCanvas.current.deserialize(diagram);
        if (response){
            this.setState({
                language: Defaults.language,
                selectedLink: Defaults.selectedLink,
            });
            this.handleChangeName(this.diagramCanvas.current.engine.getDiagramModel().getName());
            return true;
        } else {
            return false;
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
        this.diagramCanvas.current.engine.getDiagramModel().selectedLink = linkType;
    }

    handleChangeFirstCardinality(event) {
        this.setState({firstCardinality: event.target.value});
        this.diagramCanvas.current.engine.getDiagramModel().firstCardinality = event.target.value;
    }

    handleChangeSecondCardinality(event) {
        this.setState({secondCardinality: event.target.value});
        this.diagramCanvas.current.engine.getDiagramModel().secondCardinality = event.target.value;
    }

    handleChangeLanguage(event) {
        this.setState({language: event.target.value});
        this.diagramCanvas.current.engine.getDiagramModel().language = event.target.value;
        let links = this.diagramCanvas.current.engine.getDiagramModel().getLinks();
        for (let link in links) {
            links[link].setNameLanguage(event.target.value);
        }
        this.diagramCanvas.current.forceUpdate();
    }

    handleChangePanelObject(thing) {
        if (thing instanceof PointModel) {
            this.setState({panelObject: thing.getLink()});
        } else {
            this.setState({panelObject: thing});
        }
    }

    handleChangeName(str: string) {
        if (str === "") {
            str = Locale.untitled;
        }
        this.setState({name: str});
        document.title = str + " | " + Locale.appName;
        this.diagramCanvas.current.engine.getDiagramModel().setName(str);

    }

    handleChangeNotes(str: string) {
        this.setState({notes: str});
        this.diagramCanvas.engine.getDiagramModel().setNotes(str);
    }

    handleNew() {
        this.diagramCanvas.current.registerFactories();
        this.diagramCanvas.current.engine.setDiagramModel(new OntoDiagramModel(this.diagramCanvas.current.props, this.diagramCanvas.current));
        document.title = Locale.untitledDiagram + " | " + Locale.appName;
        this.setState({name: Locale.untitledDiagram});
        this.diagramCanvas.current.forceUpdate();
    }

    hideContextMenu() {
        this.setState({contextMenuActive: false});
    }

    setName(str: string) {
        this.setState({name: str});
    }

    render() {
        let eventKeyCounter = 1;
        if (this.props.readOnly) {
            return (
                <div className="content"
                     onContextMenu={event => {
                         event.preventDefault();
                     }}
                     onClick={this.hideContextMenu}
                >
                    <MenuPanel
                        handleChangeLanguage={this.handleChangeLanguage}
                        language={this.state.language}
                        name={this.state.name}
                    >
                        <MenuDropdownList name={Locale.menuPanelView}>
                            <MenuViewCenter
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelCenter}
                                canvas={this.diagramCanvas.current}
                            />
                            <MenuViewZoom
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelZoom}
                                canvas={this.diagramCanvas.current}
                            />
                        </MenuDropdownList>
                        <MenuButtonHelp
                            name={Locale.menuPanelHelp}
                        />
                    </MenuPanel>
                    <DiagramCanvas
                        ref={this.diagramCanvas}
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
                        handleChangeLanguage={this.handleChangeLanguage}
                        language={this.state.language}
                        name={this.state.name}
                    >
                            <MenuDropdownList name={Locale.menuPanelFile}>
                                <MenuFileNewDiagram
                                    eventKey={eventKeyCounter++}
                                    handleNew={this.handleNew}
                                    name={Locale.menuPanelNew}
                                />
                                <MenuFileDiagramSettings
                                    eventKey={eventKeyCounter++}
                                    name={Locale.menuPanelDiagram}
                                    inputName={this.state.name}
                                    inputNotes={this.state.notes}
                                    handleChangeName={this.handleChangeName}
                                    handleChangeNotes={this.handleChangeNotes}
                                    canvas={this.diagramCanvas.current}
                                />
                                <MenuFileLoadDiagram
                                    eventKey={eventKeyCounter++}
                                    name={Locale.menuPanelLoad}
                                    deserialize={this.deserialize}
                                />
                                <MenuFileSaveDiagram
                                    eventKey={eventKeyCounter++}
                                    name={Locale.menuPanelSaveDiagram}
                                    canvas={this.diagramCanvas.current}
                                />
                                {/*//TODO: fix*/}
                                {/*<MenuFileExportDiagram*/}
                                {/*    eventKey={eventKeyCounter++}*/}
                                {/*    name={Locale.menuPanelExportDiagram}*/}
                                {/*    canvas={this.diagramCanvas.current}*/}
                                {/*/>*/}
                            </MenuDropdownList>
                        <MenuDropdownList name={Locale.menuPanelView}>
                            <MenuViewCenter
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelCenter}
                                canvas={this.diagramCanvas.current}
                            />
                            {/*//TODO: fix*/}
                            {/*<MenuViewZoom*/}
                            {/*    eventKey={eventKeyCounter++}*/}
                            {/*    name={Locale.menuPanelZoom}*/}
                            {/*    canvas={this.diagramCanvas.current}*/}
                            {/*/>*/}
                        </MenuDropdownList>
                        <MenuDropdownList name={Locale.menuPanelTools}>
                            <MenuToolsValidate
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelValidate}
                                canvas={this.diagramCanvas.current}
                            />
                            <MenuToolsEvaluate
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelEvaluate}
                                action={this.evaluate}
                            />
                        </MenuDropdownList>
                        { this.props.lockConfig ? "" :
                        <MenuDropdownList name={Locale.menuPanelSettings}>
                            <MenuSettingsLanguages
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelLanguages}
                                canvas={this.diagramCanvas.current}
                                />
                            <MenuSettingsNodes
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelStereotypes}
                                />
                            <MenuSettingsLinks
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelLinks}
                                />
                            <MenuSettingsCardinalities
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelCardinalities}
                                />
                            <MenuSettingsAttributeTypes
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelAttributeTypes}
                                />
                            <MenuSettingsImportExport
                                eventKey={eventKeyCounter++}
                                name={Locale.importExportSettings}
                                />
                            <MenuSettingsConstraints
                                eventKey={eventKeyCounter++}
                                name={Locale.constraintSettings}
                                />
                            <MenuSettingsVocabularies
                                eventKey={eventKeyCounter++}
                                name={Locale.menuPanelVocabulary}
                                />
                        </MenuDropdownList>
                        }
                        <MenuButtonHelp
                            name={Locale.menuPanelHelp}
                        />
                    </MenuPanel>
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
                        ref={this.diagramCanvas}
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
                    <BottomPanel
                        bottomPanelActive={this.state.bottomPanelActive}
                        bottomPanelData={this.state.bottomPanelData}
                        handleCloseBottomPanel={this.handleCloseBottomPanel}
                        handleEvaluate={this.evaluate}
                        handleLocate={this.handleLocate}
                        language={this.state.language}
                        canvas={this.diagramCanvas.current}
                    />
                    <ContextMenuLink
                        contextMenuActive={this.state.contextMenuActive}
                        contextMenuX={this.state.contextMenuX}
                        contextMenuY={this.state.contextMenuY}
                        contextMenuLink={this.state.contextMenuLink}
                        updateLinkPosition={this.updateLinkPosition}
                    />
                    <div className="build">build 80</div>
                </div>
            );
        }

    }
}

DiagramApp.propTypes = {
    loadDiagram: PropTypes.string,
    readOnly: PropTypes.bool,
    loadSettings: PropTypes.string,
    loadOntology: PropTypes.string,
    typeIRI: PropTypes.string,
    loadDefaultVocabularies: PropTypes.bool,
    lockConfig: PropTypes.bool
};