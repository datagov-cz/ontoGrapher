import {CustomDiagramModel} from "../diagram/CustomDiagramModel";
import {DiagramEngine} from "storm-react-diagrams";
import {Defaults} from "../config/Defaults";
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";

//TODO: testing
describe("Manual modelling", () =>{
    var engine = new DiagramEngine();
    var model = new CustomDiagramModel({
        selectedLink: Defaults.selectedLink,
        language: Defaults.language,
        firstCardinality: Defaults.cardinality,
        secondCardinality: Defaults.cardinality
    },engine);

    afterEach(() => {
        engine = new DiagramEngine();
        model = new CustomDiagramModel({
            selectedLink: Defaults.selectedLink,
            language: Defaults.language,
            firstCardinality: Defaults.cardinality,
            secondCardinality: Defaults.cardinality
        },engine);
    });

    test("Basic stereotype manipulation", () => {
        var node1 = new NodeCommonModel("test","test",model);
        var node2 = new NodeCommonModel("test2","test",model);
        var link1 = new LinkCommonModel(model);
        model.addNode(node1);
        model.addNode(node2);
        link1.setSourcePort(node1.getPort("left"));
        link1.setTargetPort(node2.getPort("left"));
        model.addLink(link1);
        expect(model.getLink(link1).getSourcePort()).toBe(node1.getPort("left"));
        expect(model.getLink(link1).getTargetPort()).toBe(node2.getPort("left"));
    });

    test("Setup check", () => {
        expect(Object.entries(model.getLinks()).length).toBe(0);
        expect(Object.entries(model.getNodes()).length).toBe(0);
    });

    test("Stereotype attribute allocation", () => {
        
    });

    test("Label manipulation", () => {

    });

    test("Random compound modelling", () => {

    });
});

describe("Panel interoperability", ()=>{

    test("Stereotype fetching", () => {

    });

    test("Changes in menu panel invokes change in whole component", () => {

    });

    test("Detail panel invokes change in stereotype", () => {

    });

    test("Context menu invokes change in relation", () => {

    });

    test("Main component interoperability", () => {

    });

});
