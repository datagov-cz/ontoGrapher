import React from 'react';
//import Lodash from 'lodash';
import {
    DiagramWidget,
    DiagramEngine,
    DefaultNodeFactory,
    DefaultLinkFactory,
    DiagramModel,
    DefaultNodeModel,
    DefaultPortModel,
    LinkModel,
    DefaultLabelFactory,
    DefaultPortFactory, DefaultLabelModel
} from 'storm-react-diagrams';
import {CommonPortFactory} from "../components/nodes/common/CommonPortFactory";
import {CommonLinkFactory, CommonLinkModel, CommonPortModel} from "../components/links/CommonLink";
import Lodash from "lodash";
import {CharacterizationLinkFactory} from "../components/links/CharacterizationLink";
import {ComponentLinkFactory} from "../components/links/ComponentLink";
import {DerivationLinkFactory} from "../components/links/DerivationLink";
import {FormalLinkFactory, FormalLinkModel} from "../components/links/FormalLink";
import {MaterialLinkFactory} from "../components/links/MaterialLink";
import {MediationLinkFactory} from "../components/links/MediationLink";
import {MemberLinkFactory} from "../components/links/MemberLink";
import {SubCollectionLinkFactory} from "../components/links/SubCollectionLink";
import {SubQuantityLinkFactory} from "../components/links/SubQuantityLink";
import {MenuPanel} from "../panel/MenuPanel";
import {CustomDiagramModel} from "./CustomDiagramModel.js";
import {NodeCommonModel} from "../components/nodes/common/NodeCommonModel";
import {NodeCommonFactory} from "../components/nodes/common/NodeCommonFactory";
import {NodeCommonPortFactory} from "../components/nodes/common/NodeCommonPortFactory";


export class DiagramCanvas extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selectedlink: 'common',
            firstcard: '1',
            secondcard: '1',
            language: "cs"
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChange1 = this.handleChange1.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
        this.handleChange3 = this.handleChange3.bind(this);
    }

    registerFactories(){
        this.engine.registerNodeFactory(new DefaultNodeFactory());

        this.engine.registerNodeFactory(new NodeCommonFactory(this.engine.getDiagramModel()));

        this.engine.registerLinkFactory(new DefaultLinkFactory());

        this.engine.registerLinkFactory(new CommonLinkFactory());
        this.engine.registerLinkFactory(new CharacterizationLinkFactory());
        this.engine.registerLinkFactory(new ComponentLinkFactory());
        this.engine.registerLinkFactory(new DerivationLinkFactory());
        this.engine.registerLinkFactory(new FormalLinkFactory());
        this.engine.registerLinkFactory(new MaterialLinkFactory());
        this.engine.registerLinkFactory(new MediationLinkFactory());
        this.engine.registerLinkFactory(new MemberLinkFactory());
        this.engine.registerLinkFactory(new SubCollectionLinkFactory());
        this.engine.registerLinkFactory(new SubQuantityLinkFactory());

        this.engine.registerLabelFactory(new DefaultLabelFactory());

        this.engine.registerPortFactory(new DefaultPortFactory());
        this.engine.registerPortFactory(new CommonPortFactory());

        this.engine.registerPortFactory(new NodeCommonPortFactory());

    }

    componentWillMount() {
        this.engine = new DiagramEngine();
        this.engine.setDiagramModel(new CustomDiagramModel());
        this.registerFactories();
        this.engine.getDiagramModel().addListener({
            linksUpdated: e => {
                if (!e.link.established){
                    e.link.linktype = this.state.selectedlink;
                    if(this.state.firstcard != "None"){
                        let fcl = new DefaultLabelModel();
                        fcl.setLabel(this.state.firstcard);
                        e.link.addLabel(fcl);
                    }
                    if (e.link.linktype == "mediation"){
                        e.link.addLabel("«mediation»");
                    } else if (e.link.linktype == "characterization"){
                        e.link.addLabel("«characterization»");
                    } else if (e.link.linktype == "material"){
                        e.link.addLabel("«material»");
                    } else if (e.link.linktype == "formal"){
                        e.link.addLabel("«formal»");
                    }
                    if (this.state.secondcard != "None"){
                        let scl = new DefaultLabelModel();
                        scl.setLabel(this.state.secondcard);
                        e.link.addLabel(scl);
                    }
                    e.link.established = true;
                }
            }
            });

    }

    handleChange(event){
        this.setState({selectedlink: event.target.value});
        this.engine.getDiagramModel().selectedLink = event.target.value;
    }

    handleChange1(event){
        this.setState({firstcard: event.target.value});
    }
    handleChange2(event){
        this.setState({secondcard: event.target.value});
    }
    handleChange3(event){
        this.setState({language: event.target.value});
        this.engine.getDiagramModel().language = event.target.value;
    }
    render() {
        return (
            <div>
                <select value={this.state.selectedlink} onChange={this.handleChange}>
                    <option value="common">Common</option>
                    <option value="characterization">Characterization</option>
                    <option value="component">Component</option>
                    <option value="derivation">Derivation</option>
                    <option value="formal">Formal</option>
                    <option value="material">Material</option>
                    <option value="mediation">Mediation</option>
                    <option value="member">Member</option>
                    <option value="subcollection">SubCollection</option>
                    <option value="subquantity">SubQuantity</option>
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
                    <option value="cs">Čeština</option>
                    <option value="en">Angličtina</option>
                </select>
                <button onClick={event => {
                    console.log(JSON.stringify(this.engine.diagramModel.serializeDiagram()));
                }}>Serialize</button>
                <button onClick={event => {
                    let str = prompt("Enter JSON");
                    this.registerFactories();
                    let model = new CustomDiagramModel();
                    model.deSerializeDiagram(JSON.parse(str), this.engine);
                    this.engine.setDiagramModel(model);
                    alert("Loaded!");
                    this.forceUpdate();
                }}>Deserialize</button>
            <div
                onDrop={event => {
                    var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                    var node = new NodeCommonModel(data.type);
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
