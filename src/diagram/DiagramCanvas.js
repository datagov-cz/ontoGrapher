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
import {LinkPool} from "./LinkPool";
import {LanguagePool} from "./LanguagePool";
import {CommonLinkFactory} from "../components/commonlink/CommonLinkFactory";


export class DiagramCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedlink: 'Mediation',
            firstcard: '1',
            secondcard: '1',
            language: "cs"
        };
        this.linkPool = [];
        for (let link in LinkPool) {
            this.linkPool.push(<option key={link} value={link}>{link}</option>);
        }
        this.languagePool = [];
        for (let language in LanguagePool) {
            this.languagePool.push(<option key={language} value={language}>{LanguagePool[language]}</option>)
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleChange1 = this.handleChange1.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
        this.handleChange3 = this.handleChange3.bind(this);
    }

    registerFactories() {
        this.engine.registerNodeFactory(new NodeCommonFactory(this.engine.getDiagramModel()));
        this.engine.registerLinkFactory(new CommonLinkFactory());
        this.engine.registerLabelFactory(new DefaultLabelFactory());
        this.engine.registerPortFactory(new CommonPortFactory());
        this.engine.registerPortFactory(new NodeCommonPortFactory());

    }

    componentWillMount() {
        this.engine = new DiagramEngine();
        this.engine.setDiagramModel(new CustomDiagramModel());
        this.registerFactories();
    }

    handleChange(event) {
        this.setState({selectedlink: event.target.value});
        this.engine.getDiagramModel().selectedLink = event.target.value;
    }

    handleChange1(event) {
        this.setState({firstcard: event.target.value});
        this.engine.getDiagramModel().firstcard = event.target.value;
    }

    handleChange2(event) {
        this.setState({secondcard: event.target.value});
        this.engine.getDiagramModel().secondcard = event.target.value;
    }

    handleChange3(event) {
        this.setState({language: event.target.value});
        this.engine.getDiagramModel().language = event.target.value;
    }

    render() {
        return (
            <div>
                <select value={this.state.selectedlink} onChange={this.handleChange}>
                    {this.linkPool}
                </select>
                <select value={this.state.firstcard} onChange={this.handleChange1}>
                    <option value="1">1</option>
                    <option value="0..1">0..1</option>
                    <option value="1..*">1..*</option>
                    <option value="0..*">0..*</option>
                    <option value="None">None</option>
                </select>
                <select value={this.state.secondcard} onChange={this.handleChange2}>
                    <option value="1">1</option>
                    <option value="0..1">0..1</option>
                    <option value="1..*">1..*</option>
                    <option value="0..*">0..*</option>
                    <option value="None">None</option>
                </select>
                <select value={this.state.language} onChange={this.handleChange3}>
                    {this.languagePool}
                </select>
                <button onClick={event => {
                    console.log(JSON.stringify(this.engine.diagramModel.serializeDiagram()));
                }}>Uložit
                </button>
                <button onClick={event => {
                    let str = prompt("Vložte JSON");
                    this.registerFactories();
                    let model = new CustomDiagramModel();
                    model.deSerializeDiagram(JSON.parse(str), this.engine);
                    this.engine.setDiagramModel(model);
                    alert("Načteno!");
                    this.forceUpdate();
                }}>Načíst
                </button>
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
            </div>

        );
    }
}
