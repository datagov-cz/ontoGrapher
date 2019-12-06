import React from 'react';
import {DiagramEngine} from 'storm-react-diagrams';
import {OntoDiagramModel} from "./OntoDiagramModel.js";
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {NodeCommonFactory} from "../components/common-node/NodeCommonFactory";
import {NodeCommonPortFactory} from "../components/common-node/NodeCommonPortFactory";
import {LinkCommonFactory} from "../components/common-link/LinkCommonFactory";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import {LabelCommonFactory} from "../components/common-label/LabelCommonFactory";
import {OntoDiagramWidget} from "./OntoDiagramWidget";
import {Defaults} from "../config/Defaults";
import {Locale} from "../config/locale/Locale";
import {
    StereotypePool,
    StereotypePoolPackage,
    default as Variables,
    globalCount,
    ClassPackage, HiddenRelationships, HiddenInstances
} from "../config/Variables";
import {Stereotype} from "../components/misc/Stereotype";
import {Class} from "../components/misc/Class";


export class DiagramCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.readOnly = false;
        this.engine = new DiagramEngine();
        this.engine.setDiagramModel(new OntoDiagramModel(this.props, this));
        this.registerFactories();
        this.engine.getDiagramModel().setOffset(Defaults.offset.x,Defaults.offset.y);
    }

    registerFactories() {
        this.engine.registerNodeFactory(new NodeCommonFactory(this.engine.getDiagramModel()));
        this.engine.registerLinkFactory(new LinkCommonFactory());
        this.engine.registerLabelFactory(new LabelCommonFactory());
        this.engine.registerPortFactory(new NodeCommonPortFactory());
    }

    updatePanel() {
        let selected = this.engine.getDiagramModel().getSelectedItems();
        for (let i = 0; i < selected.length; i++) {
            if (!selected[i].selected) {
                selected.splice(i, 1);
            }
        }
        if (selected.length === 1) {
            this.props.handleChangePanelObject(selected[0]);
        } else if (selected[0] instanceof NodeCommonModel) {
            this.props.handleChangePanelObject(selected[0]);
        } else {
            this.props.handleChangePanelObject(null);
        }

    }

    setReadOnly(value: boolean){
        this.readOnly = value;
    }

    nullPanel() {
        this.props.handleChangePanelObject(null);
    }

    serialize() {
        let saveData = JSON.stringify(this.engine.getDiagramModel().serializeDiagram());
        return saveData;
    }

    showContextMenu(event: MouseEvent, link: LinkCommonModel) {
        event.preventDefault();
        this.props.showContextMenu(event.clientX, event.clientY, link);

    }
    /*
    export() {
        const rdf = require('rdf-ext');
        const SerializerNtriples = require('@rdfjs/serializer-ntriples');

        let dataset = rdf.dataset();
        let diagram = this.engine.getDiagramModel().serializeDiagram();
        for (let node of diagram.nodes) {
            dataset.add(rdf.quad(rdf.namedNode(node.rdf), rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), rdf.namedNode("http://www.w3.org/2002/07/owl#Class")));
            dataset.add(rdf.quad(rdf.namedNode(node.rdf), rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#label"), rdf.literal(node.stereotype)));
        }
        const serializerNtriples = new SerializerNtriples();
        const input = dataset.toStream();
        const output = serializerNtriples.import(input);
        output.on('data', ntriples => {
            console.log(ntriples.toString());
        });
    }
    */
    deserialize(diagramSerialization: string) {
        let diagram = (function(raw) {
            try {
                return JSON.parse(raw);
            } catch (err) {
                console.log(err);
                return false;
            }
        })(diagramSerialization);
        if (!diagram){
            let err =  Error(Locale.loadUnsuccessful);
            console.log(err);
            return false;
        }
        try {
            this.registerFactories();
            let model = new OntoDiagramModel(this.props, this);
            model.deSerializeDiagram(diagram, this.engine);
            this.engine.setDiagramModel(model);
        } catch (err) {
            console.log(err);
            return false;
        }
        this.forceUpdate();
        return true;
    }

    setName(str: string) {
        this.props.setName(str);
    }

    render() {
        return (
            <div
                onDrop={event => {
                    try {
                        const data = JSON.parse(event.dataTransfer.getData("newNode"));
                        let name = Locale.untitled + " " + data.stereotype.name;
                        let cls = new Class(data.stereotype, name);
                        const points = this.engine.getRelativeMousePoint(event);
                        let node = new NodeCommonModel(name, cls, data.stereotype, this.engine.getDiagramModel());
                        if (data.newNode){
                            ClassPackage[Locale.root].push(cls);
                            node.x = points.x;
                            node.y = points.y;
                            this.engine.getDiagramModel().addNode(node);
                        } else {
                            cls = data.class;
                            name = data.class.name;
                            for (let nodeID in this.engine.getDiagramModel().getNodes()){
                                for (let linkID in this.engine.getDiagramModel().getNode(nodeID).class.connections){
                                    if (linkID in HiddenRelationships){
                                        let hiddenNodeID = HiddenRelationships[linkID].getTargetNode().getID();
                                        if (hiddenNodeID in HiddenInstances){
                                            node = _.cloneDeep(HiddenInstances[hiddenNodeID]);
                                            // node.x = points.x;
                                            // node.y = points.y;
                                            this.engine.getDiagramModel().addNode(node);
                                            delete HiddenInstances[hiddenNodeID];
                                        }
                                        let link = _.cloneDeep(HiddenRelationships[linkID]);
                                        let port = node.getPort(link.getTargetPort().getName());
                                        link.setTargetPort(port);
                                        //link.getLastPoint().updateLocation(this.engine.getPortCenter(port));
                                        this.engine.getDiagramModel().addLink(link);
                                        delete HiddenRelationships[link];
                                    }
                                }
                            }
                        }
                        this.forceUpdate();
                    } catch(err) {
                        console.log(err);
                    }
                }}
                onDragOver={event => {
                    event.preventDefault();
                }}>
                <OntoDiagramWidget
                    diagramEngine={this.engine}
                    allowLooseLinks={false}
                    smartRouting={false}
                    deleteKeys={this.readOnly ? [] : [46]}
                />
            </div>
        );
    }
}
