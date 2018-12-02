import React from 'react';
import {
    DiagramWidget,
    DiagramEngine,
    DefaultLabelFactory, PointModel,
} from 'storm-react-diagrams';
import {CustomDiagramModel} from "./CustomDiagramModel.js";
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {NodeCommonFactory} from "../components/common-node/NodeCommonFactory";
import {NodeCommonPortFactory} from "../components/common-node/NodeCommonPortFactory";
import {LinkPool} from "../config/LinkPool";
import {LanguagePool} from "../config/LanguagePool";
import {CommonLinkFactory} from "../components/common-link/CommonLinkFactory";
import {Defaults} from "../config/Defaults";
import {Locale} from "../config/Locale";
import {CommonLinkModel} from "../components/common-link/CommonLinkModel";
import {ContextMenuLink} from "../misc/ContextMenuLink";
import {CommonLabelFactory} from "../components/misc/CommonLabelFactory";

Array.prototype.removeIf = function(callback) {
    var i = 0;
    while (i < this.length) {
        if (callback(this[i], i)) {
            this.splice(i, 1);
        }
        else {
            ++i;
        }
    }
};

export class DiagramCanvas extends React.Component {
    constructor(props) {
        super(props);
    }

    registerFactories() {
        this.engine.registerNodeFactory(new NodeCommonFactory(this.engine.getDiagramModel()));
        this.engine.registerLinkFactory(new CommonLinkFactory());
        //this.engine.registerLabelFactory(new DefaultLabelFactory());
        this.engine.registerLabelFactory(new CommonLabelFactory());
        this.engine.registerPortFactory(new NodeCommonPortFactory());
    }

    componentWillMount() {
        this.engine = new DiagramEngine();
        this.engine.setDiagramModel(new CustomDiagramModel(this.props,this));
        this.registerFactories();
    }

    updatePanel(){
        let selected = this.engine.getDiagramModel().getSelectedItems();
        selected.removeIf(function(item, index){return !item.selected});
        if (selected.length === 1){
           this.props.handleChangePanelObject(selected[0]);
        } else {
            this.props.handleChangePanelObject(null);
        }

    }

    nullPanel(){
        this.props.handleChangePanelObject(null);
    }

    serialize(){
        console.log(JSON.stringify(this.engine.getDiagramModel().serializeDiagram()));
    }

    showContextMenu(event: MouseEvent, link: CommonLinkModel){
        event.preventDefault();
        /*
        console.log({
            coords: "x: "+coords.x+" y: "+coords.y,
            offset: "x: "+event.offsetX+" y: "+event.offsetY,
            screen: "x: "+event.screenX+" y: "+event.screenY,
            page: "x: "+event.pageX+" y: "+event.pageY,
            client: "x: "+event.clientX+" y: "+event.clientY

        });
        */
        this.props.showContextMenu(event.clientX,event.clientY,link);

    }

    export(){
        const rdf = require('rdf-ext');
        const SerializerNtriples = require('@rdfjs/serializer-ntriples');

        let dataset = rdf.dataset();
        let diagram = this.engine.getDiagramModel().serializeDiagram();
        for (let node of diagram.nodes){
            dataset.add(rdf.quad(rdf.namedNode(node.rdf),rdf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),rdf.namedNode("http://www.w3.org/2002/07/owl#Class")));
            dataset.add(rdf.quad(rdf.namedNode(node.rdf),rdf.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),rdf.literal(node.stereotype)));
        }
        const serializerNtriples = new SerializerNtriples();
        const input = dataset.toStream();
        const output = serializerNtriples.import(input);
        output.on('data', ntriples => {
            console.log(ntriples.toString());
        });
    }
    // TODO: change language, name, etc. settings when deserializing
    // TODO: check for missing stereotypes and links when deserializing
    deserialize(){
        let str = prompt(Locale.menuPanelInsertJSON);
        this.registerFactories();
        let model = new CustomDiagramModel(this.props,this);
        model.deSerializeDiagram(JSON.parse(str), this.engine);
        this.engine.setDiagramModel(model);
        alert(Locale.menuPanelLoaded);
        this.forceUpdate();
    }
    // TODO: select newly placed stereotype
    render() {
        return (
                <div
                    onDrop={event => {
                        var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                        var node = new NodeCommonModel(data.type,data.rdf,this.engine.getDiagramModel());
                        var points = this.engine.getRelativeMousePoint(event);
                        node.x = points.x;
                        node.y = points.y;
                        this.engine.getDiagramModel().addNode(node);
                        this.forceUpdate();
                    }}
                    onDragOver={event => {
                        event.preventDefault();
                    }}>
                    <DiagramWidget
                        diagramEngine={this.engine}
                        allowLooseLinks={true}
                        smartRouting={false}
                        deleteKeys={[46]}
                    />
                </div>
        );
    }
}
