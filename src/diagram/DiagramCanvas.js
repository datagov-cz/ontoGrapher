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
import {NodeKindModel} from "../components/nodes/kind/NodeKindModel";
import {NodeKindFactory} from "../components/nodes/kind/NodeKindFactory";
import {NodeKindPortFactory} from "../components/nodes/kind/NodeKindPortFactory";
import {CommonPortFactory} from "../components/nodes/common/CommonPortFactory";
import {CommonLinkFactory, CommonLinkModel, CommonPortModel} from "../components/links/CommonLink";
import Lodash from "lodash";
import {AttributeObject} from "../components/nodes/common/AttributeObject";
import {NodeCategoryFactory} from "../components/nodes/category/NodeCategoryFactory";
import {NodeCategoryPortFactory} from "../components/nodes/category/NodeCategoryPortFactory";
import {NodeCategoryModel} from "../components/nodes/category/NodeCategoryModel";
import {NodeCollectiveFactory} from "../components/nodes/collective/NodeCollectiveFactory";
import {NodeMixinFactory} from "../components/nodes/mixin/NodeMixinFactory";
import {NodeModeFactory} from "../components/nodes/mode/NodeModeFactory";
import {NodePhaseFactory} from "../components/nodes/phase/NodePhaseFactory";
import {NodeQualityFactory} from "../components/nodes/quality/NodeQualityFactory";
import {NodeQuantityFactory} from "../components/nodes/quantity/NodeQuantityFactory";
import {NodeRelatorFactory} from "../components/nodes/relator/NodeRelatorFactory";
import {NodeRoleFactory} from "../components/nodes/role/NodeRoleFactory";
import {NodeRoleMixinFactory} from "../components/nodes/rolemixin/NodeRoleMixinFactory";
import {NodeSubkindFactory} from "../components/nodes/subkind/NodeSubkindFactory";
import {NodeCollectivePortFactory} from "../components/nodes/collective/NodeCollectivePortFactory";
import {NodeMixinPortFactory} from "../components/nodes/mixin/NodeMixinPortFactory";
import {NodeModePortFactory} from "../components/nodes/mode/NodeModePortFactory";
import {NodePhasePortFactory} from "../components/nodes/phase/NodePhasePortFactory";
import {NodeQualityPortFactory} from "../components/nodes/quality/NodeQualityPortFactory";
import {NodeQuantityPortFactory} from "../components/nodes/quantity/NodeQuantityPortFactory";
import {NodeRelatorPortFactory} from "../components/nodes/relator/NodeRelatorPortFactory";
import {NodeRolePortFactory} from "../components/nodes/role/NodeRolePortFactory";
import {NodeRoleMixinPortFactory} from "../components/nodes/rolemixin/NodeRoleMixinPortFactory";
import {NodeSubkindPortFactory} from "../components/nodes/subkind/NodeSubkindPortFactory";
import {NodeCollectiveModel} from "../components/nodes/collective/NodeCollectiveModel";
import {NodeMixinModel} from "../components/nodes/mixin/NodeMixinModel";
import {NodeModeModel} from "../components/nodes/mode/NodeModeModel";
import {NodePhaseModel} from "../components/nodes/phase/NodePhaseModel";
import {NodeQualityModel} from "../components/nodes/quality/NodeQualityModel";
import {NodeQuantityModel} from "../components/nodes/quantity/NodeQuantityModel";
import {NodeRelatorModel} from "../components/nodes/relator/NodeRelatorModel";
import {NodeRoleModel} from "../components/nodes/role/NodeRoleModel";
import {NodeSubkindModel} from "../components/nodes/subkind/NodeSubkindModel";
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


export class DiagramCanvas extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            selectedlink: 'common',
            firstcard: '1',
            secondcard: '1'
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChange1 = this.handleChange1.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
    }

    registerFactories(){
        this.engine.registerNodeFactory(new DefaultNodeFactory());

        this.engine.registerNodeFactory(new NodeCategoryFactory());
        this.engine.registerNodeFactory(new NodeCollectiveFactory());
        this.engine.registerNodeFactory(new NodeKindFactory());
        this.engine.registerNodeFactory(new NodeMixinFactory());
        this.engine.registerNodeFactory(new NodeModeFactory());
        this.engine.registerNodeFactory(new NodePhaseFactory());
        this.engine.registerNodeFactory(new NodeQualityFactory());
        this.engine.registerNodeFactory(new NodeQuantityFactory());
        this.engine.registerNodeFactory(new NodeRelatorFactory());
        this.engine.registerNodeFactory(new NodeRoleFactory());
        this.engine.registerNodeFactory(new NodeRoleMixinFactory());
        this.engine.registerNodeFactory(new NodeSubkindFactory());


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

        this.engine.registerPortFactory(new NodeCategoryPortFactory());
        this.engine.registerPortFactory(new NodeCollectivePortFactory());
        this.engine.registerPortFactory(new NodeKindPortFactory());
        this.engine.registerPortFactory(new NodeMixinPortFactory());
        this.engine.registerPortFactory(new NodeModePortFactory());
        this.engine.registerPortFactory(new NodePhasePortFactory());
        this.engine.registerPortFactory(new NodeQualityPortFactory());
        this.engine.registerPortFactory(new NodeQuantityPortFactory());
        this.engine.registerPortFactory(new NodeRelatorPortFactory());
        this.engine.registerPortFactory(new NodeRolePortFactory());
        this.engine.registerPortFactory(new NodeRoleMixinPortFactory());
        this.engine.registerPortFactory(new NodeSubkindPortFactory());
    }

    componentWillMount() {
        this.engine = new DiagramEngine();

        this.registerFactories();

        this.engine.setDiagramModel(new CustomDiagramModel());
        const kind = new NodeKindModel();
        kind.addAttribute(new AttributeObject("me","string"));
        kind.addAttribute(new AttributeObject("you","string"));
        kind.addAttribute(new AttributeObject("we","string"));

        this.engine.getDiagramModel().addNode(kind);
        this.engine.getDiagramModel().addListener({
            linksUpdated: e => {
                if (!e.link.established){
                    e.link.linktype = this.state.selectedlink;
                    let fcl = new DefaultLabelModel();
                    let scl = new DefaultLabelModel();
                    fcl.setLabel(this.state.firstcard);
                    scl.setLabel(this.state.secondcard);
                    e.link.addLabel(fcl);
                    if (e.link.linktype == "mediation"){
                        e.link.addLabel("«mediation»");
                    } else if (e.link.linktype == "characterization"){
                        e.link.addLabel("«characterization»");
                    } else if (e.link.linktype == "material"){
                        e.link.addLabel("«material»");
                    } else if (e.link.linktype == "formal"){
                        e.link.addLabel("«formal»");
                    }
                    e.link.addLabel(scl);
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
                </select>
                <select value={this.state.secondcard} onChange={this.handleChange2}>
                    <option value="1">1</option>
                    <option value="0..1">0..1</option>
                    <option value="1..*">1..*</option>
                    <option value="0..*">0..*</option>
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
                    var nodesCount = Lodash.keys(this.engine.getDiagramModel().getNodes()).length;
                    var node = null;
                    if (data.type === 'category') {
                        node = new NodeCategoryModel('Category ', 'peru');
                    } else if (data.type === 'collective') {
                        node = new NodeCollectiveModel('Collective ', 'peru');
                    } else if (data.type === 'kind') {
                        node = new NodeKindModel('Kind ', 'peru');
                    } else if (data.type === 'mixin') {
                        node = new NodeMixinModel('Mixin ', 'peru');
                    } else if (data.type === 'mode') {
                        node = new NodeModeModel('Mode ', 'peru');
                    } else if (data.type === 'phase') {
                        node = new NodePhaseModel('Phase ', 'peru');
                    } else if (data.type === 'quality') {
                        node = new NodeQualityModel('Quality ', 'peru');
                    } else if (data.type === 'quantity') {
                        node = new NodeQuantityModel('Quantity ', 'peru');
                    } else if (data.type === 'relator') {
                        node = new NodeRelatorModel('Relator ', 'peru');
                    } else if (data.type === 'role') {
                        node = new NodeRoleModel('Role ', 'peru');
                    } else if (data.type === 'roleMixin') {
                        node = new NodeRoleMixinModel('RoleMixin ', 'peru');
                    } else if (data.type === 'subkind') {
                        node = new NodeSubkindModel('Subkind ', 'peru');
                    }
                    var points = this.engine.getRelativeMousePoint(event);
                    node.name = 'Node ' + (nodesCount + 1);
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
