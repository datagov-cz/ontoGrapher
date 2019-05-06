import React from 'react';
import {DiagramEngine} from 'storm-react-diagrams';
import {OntoDiagramModel} from "./OntoDiagramModel.js";
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {NodeCommonFactory} from "../components/common-node/NodeCommonFactory";
import {NodeCommonPortFactory} from "../components/common-node/NodeCommonPortFactory";
import {LinkCommonFactory} from "../components/common-link/LinkCommonFactory";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import {CommonLabelFactory} from "../components/misc/CommonLabelFactory";
import {OntoDiagramWidget} from "./OntoDiagramWidget";
import * as SemanticWebInterface from "../misc/SemanticWebInterface";


export class DiagramCanvas extends React.Component {
    constructor(props) {
        super(props);
    }

    registerFactories() {
        this.engine.registerNodeFactory(new NodeCommonFactory(this.engine.getDiagramModel()));
        this.engine.registerLinkFactory(new LinkCommonFactory());
        this.engine.registerLabelFactory(new CommonLabelFactory());
        this.engine.registerPortFactory(new NodeCommonPortFactory());
    }

    componentWillMount() {
        this.engine = new DiagramEngine();
        this.engine.setDiagramModel(new OntoDiagramModel(this.props, this));
        this.registerFactories();
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

    nullPanel() {
        this.props.handleChangePanelObject(null);
    }

    serialize() {
        let saveData = JSON.stringify(this.engine.getDiagramModel().serializeDiagram());
        this.props.handleSerialize(saveData);
    }

    showContextMenu(event: MouseEvent, link: LinkCommonModel) {
        event.preventDefault();
        this.props.showContextMenu(event.clientX, event.clientY, link);

    }

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

    deserialize(diagramSerialization: string) {
        let diagram = (function(raw) {
            try {
                return JSON.parse(raw);
            } catch (err) {
                return false;
            }
        })(diagramSerialization);
        if (!diagram){
            return false;
        }
        try {
            this.registerFactories();
            let model = new OntoDiagramModel(this.props, this);
            model.deSerializeDiagram(diagram, this.engine);
            this.engine.setDiagramModel(model);
        } catch (err) {
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
                        const node = new NodeCommonModel(data.type, data.rdf, this.engine.getDiagramModel());
                        const points = this.engine.getRelativeMousePoint(event);
                        node.x = points.x;
                        node.y = points.y;
                        this.engine.getDiagramModel().addNode(node);
                        this.forceUpdate();
                    } catch(err) {
                        // TODO: Log service
                    }
                }}
                onDragOver={event => {
                    event.preventDefault();
                }}>
                <OntoDiagramWidget
                    diagramEngine={this.engine}
                    allowLooseLinks={true}
                    smartRouting={false}
                    deleteKeys={[46]}
                />
            </div>
        );
    }
}
