import React from 'react';
import {
    DiagramWidget,
    DiagramEngine,
    DefaultLabelFactory,
} from 'storm-react-diagrams';
import {CommonPortFactory} from "../components/nodes/CommonPortFactory";
import {CustomDiagramModel} from "./CustomDiagramModel.js";
import {NodeCommonModel} from "../components/nodes/NodeCommonModel";
import {NodeCommonFactory} from "../components/nodes/NodeCommonFactory";
import {NodeCommonPortFactory} from "../components/nodes/NodeCommonPortFactory";
import {LinkPool} from "../config/LinkPool";
import {LanguagePool} from "../config/LanguagePool";
import {CommonLinkFactory} from "../components/commonlink/CommonLinkFactory";
import {Defaults} from "../config/Defaults";
import {Locale} from "../config/Locale";


export class DiagramCanvas extends React.Component {
    constructor(props) {
        super(props);
    }

    registerFactories() {
        this.engine.registerNodeFactory(new NodeCommonFactory(this.engine.getDiagramModel()));
        this.engine.registerLinkFactory(new CommonLinkFactory());
        this.engine.registerLabelFactory(new DefaultLabelFactory());
        this.engine.registerPortFactory(new NodeCommonPortFactory());
    }

    componentWillMount() {
        this.engine = new DiagramEngine();
        this.engine.setDiagramModel(new CustomDiagramModel(this.props));
        this.registerFactories();
    }

    serialize(){
        console.log(JSON.stringify(this.engine.getDiagramModel().serializeDiagram()));
    }

    deserialize(){
        let str = prompt(Locale.menuPanelInsertJSON);
        this.registerFactories();
        let model = new CustomDiagramModel();
        model.deSerializeDiagram(JSON.parse(str), this.engine);
        this.engine.setDiagramModel(model);
        alert(Locale.menuPanelLoaded);
        this.forceUpdate();
    }

    render() {
        return (
                <div
                    onDrop={event => {
                        var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                        var node = new NodeCommonModel(data.type,this.engine.getDiagramModel());
                        var points = this.engine.getRelativeMousePoint(event);
                        node.x = points.x;
                        node.y = points.y;
                        this.engine.getDiagramModel().addNode(node);
                        this.forceUpdate();
                    }}
                    onDragOver={event => {
                        event.preventDefault();
                    }}>
                    <DiagramWidget diagramEngine={this.engine} allowLooseLinks={false} smartRouting={false}/>
                </div>
        );
    }
}
