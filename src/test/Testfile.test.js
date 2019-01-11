import {OntoDiagramModel} from "../diagram/OntoDiagramModel";
import {DefaultLabelModel, DiagramEngine, PointModel} from "storm-react-diagrams";
import {Defaults} from "../config/Defaults";
import {NodeCommonModel} from "../components/common-node/NodeCommonModel";
import {LinkCommonModel} from "../components/common-link/LinkCommonModel";
import {AttributeObject} from "../components/misc/AttributeObject";
import renderer from 'react-test-renderer';
import React from "react";
import {MenuPanel} from "../panels/MenuPanel";
import {DiagramCanvas} from "../diagram/DiagramCanvas";
import {DiagramApp} from "../DiagramApp";
import {NodeCommonFactory} from "../components/common-node/NodeCommonFactory";
import {LinkCommonFactory} from "../components/common-link/LinkCommonFactory";
import {CommonLabelFactory} from "../components/misc/CommonLabelFactory";
import {NodeCommonPortFactory} from "../components/common-node/NodeCommonPortFactory";
import {LanguagePool} from "../config/LanguagePool";
describe("Manual modelling", () =>{
    var engine = new DiagramEngine();
    var model = new OntoDiagramModel({
        selectedLink: Defaults.selectedLink,
        language: Defaults.language,
        firstCardinality: Defaults.cardinality,
        secondCardinality: Defaults.cardinality
    },engine);

    afterEach(() => {
        engine = new DiagramEngine();
        model = new OntoDiagramModel({
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
        var node1 = new NodeCommonModel("test", "test", model);
        let random = 0;
        let additions  = 0;
        for (let i = 0; i<100; i++){
            random = Math.floor(Math.random() * 11);
            if (random%2 === 0){
                node1.addAttribute(new AttributeObject(random,random));
                additions++;
            } else {
                node1.removeAttributeByIndex(node1.attributes["cs"].length-1);
                if (additions >0){
                    additions--;
                }
            }
        }
        expect(node1.attributes["cs"].length).toBe(additions);

    });

    test("Label manipulation", () => {
        var node1 = new NodeCommonModel("test","test",model);
        var node2 = new NodeCommonModel("test2","test",model);
        var link1 = new LinkCommonModel(model);
        model.addNode(node1);
        model.addNode(node2);
        link1.setSourcePort(node1.getPort("left"));
        link1.setTargetPort(node2.getPort("left"));
        var additions = 4;
        var random = 0;
        var length = 0;
        for (let i = 0; i<100; i++){
            random = Math.floor(Math.random() * 11);
            if (random%2 === 0){
                link1.addLabel(new DefaultLabelModel(random));
                additions++;
            } else {
                if (link1.labels[random] !== undefined){
                    length = link1.labels.length;
                    link1.labels.splice(random,1);
                    if (additions >0 && length !== link1.labels.length){
                        additions--;
                    }

                }

            }
        }
        link1.getPoints().push(new PointModel(link1,{x: Math.random()*1000, y: Math.random()*1000}));
        expect(link1.labels.length).toBe(additions);

    });

    test("Random compound modelling", () => {
        var nodes = [];
        var random1 = 0;
        var random2 = 0;
        var random3 = 0;
        for (let i = 0; i<100; i++){
            random1 = Math.floor(Math.random() * 11);
           nodes.push(new NodeCommonModel(random1,random1,model));
        }
        var links = [];
        for (let i = 0; i<100; i++){
            random1 = Math.floor(Math.random() * 11);
            random2 = Math.floor(Math.random() * 100);
            random3 = Math.floor(Math.random() * 100);
            var link = new LinkCommonModel(model);
            link.setSourcePort(nodes[random2].getPort("left"));
            link.setTargetPort(nodes[random3].getPort("right"));
            links.push(link);
        }
        var save = JSON.stringify(model.serialize());
        model = new OntoDiagramModel({
            selectedLink: Defaults.selectedLink,
            language: Defaults.language,
            firstCardinality: Defaults.cardinality,
            secondCardinality: Defaults.cardinality
        },engine);
        model.deSerialize(JSON.parse(save),engine);
        expect(save).toBe(JSON.stringify(model.serialize()));
    });
});

describe("Function interoperability", ()=>{

    var engine = new DiagramEngine();
    var model = new OntoDiagramModel({
        selectedLink: Defaults.selectedLink,
        language: Defaults.language,
        firstCardinality: Defaults.cardinality,
        secondCardinality: Defaults.cardinality
    },engine);
    engine.setDiagramModel(model);

    afterEach(() => {
        engine = new DiagramEngine();
        model = new OntoDiagramModel({
            selectedLink: Defaults.selectedLink,
            language: Defaults.language,
            firstCardinality: Defaults.cardinality,
            secondCardinality: Defaults.cardinality
        },engine);
        engine.setDiagramModel(model);
    });

    test("Stereotype fetching", done => {
        const rdf = require('rdf-ext');
        const rdfFetch = require('rdf-fetch');
        var stereotypes = {};
        var stereotypeList = [];
        rdfFetch("http://onto.fel.cvut.cz/ontologies/ufo-b/current/ontology.ttl").then((res) => {
            return res.dataset();
        }).then((dataset) => {
            const classes = dataset.match(null,null,rdf.namedNode("http://www.w3.org/2002/07/owl#Class"));
            let result = {};
            for (let quad of classes.toArray()){
                if (quad.subject instanceof rdf.defaults.NamedNode){
                    result[quad.subject.value] = dataset.match(rdf.namedNode(quad.subject.value));
                }
            }
            return result;
        }).then((res)=>{
            for (let quad in res){
                for (let node of res[quad].toArray()){
                    if (node.object instanceof rdf.defaults.Literal && node.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label"){
                        stereotypes[node.subject.value] = node.object.value;
                        stereotypeList.push(node.object.value);
                        break;
                    }
                }
            }
            expect(stereotypeList.length).toBe(16);
            done();
        }).catch((err) => {
            console.error(err.stack || err.message);
        });

    });

    test("Engine testing", () => {
        engine.registerNodeFactory(new NodeCommonFactory(engine.getDiagramModel()));
        engine.registerLinkFactory(new LinkCommonFactory());
        engine.registerLabelFactory(new CommonLabelFactory());
        engine.registerPortFactory(new NodeCommonPortFactory());
        expect(engine.getDiagramModel()).toBe(model);
        expect(engine.isSmartRoutingEnabled()).toBe(false);
        expect(engine.getFactoryForLink(new LinkCommonModel(model) ) instanceof LinkCommonFactory).toBe(true);
    });

    test("Language and attribute testing", () => {
        var nodes = [];
        var random1 = 0;
        var random2 = 0;
        var random3 = 0;
        var random = 0;
        delete LanguagePool["cs"];
        delete LanguagePool["en"];
        for (let i = 0; i<100; i++){
            random1 = Math.floor(Math.random() * 11);
            LanguagePool[i] = random1*11;

        }


        for (let i = 0; i<100; i++){
            random1 = Math.floor(Math.random() * 11);
            var node = new NodeCommonModel(random1,random1,model);
            for (let i = 0; i<100; i++){
                random = Math.floor(Math.random() * 11);
                    node.attributes[i].push(new AttributeObject(random,random));

            }
            expect(node.attributes[Object.keys(node.attributes)[i]].length).toBe(1);
            model.addNode(node);
            nodes.push(node);

        }


    });

    test("Creating stereotypes", done => {
        const rdf = require('rdf-ext');
        const rdfFetch = require('rdf-fetch');
        var stereotypes = {};
        var stereotypeList = [];
        rdfFetch("http://onto.fel.cvut.cz/ontologies/ufo-c/current/ontology.ttl").then((res) => {
            return res.dataset();
        }).then((dataset) => {
            const classes = dataset.match(null,null,rdf.namedNode("http://www.w3.org/2002/07/owl#Class"));
            let result = {};
            for (let quad of classes.toArray()){
                if (quad.subject instanceof rdf.defaults.NamedNode){
                    result[quad.subject.value] = dataset.match(rdf.namedNode(quad.subject.value));
                }
            }
            return result;
        }).then((res)=>{
            for (let quad in res){
                for (let node of res[quad].toArray()){
                    if (node.object instanceof rdf.defaults.Literal && node.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label"){
                        stereotypes[node.subject.value] = node.object.value;
                        stereotypeList.push(node.object.value);
                        break;
                    }
                }
            }

            expect(stereotypeList.length).toBe(6);
            var nodes = [];
            for (let i = 0; i<6; i++){
                var node = new NodeCommonModel(Object.entries(stereotypes)[i][0],Object.entries(stereotypes)[i][1],model);
                model.addNode(node);
                nodes.push(node);
                }
            for (let i = 0; i<stereotypeList.length, i++;){
                expect(model.getNodes()[i].rdf).toBe(Object.entries(stereotypes)[i][0]);


            }

            done();
        }).catch((err) => {
            console.error(err.stack || err.message);
        });
    });

    test("Adding it all together", () => {
        var nodes = [];
        var random = 0;
        var random1 = 0;
        var random2 = 0;
        var random3 = 0;
        for (let i = 0; i<100; i++){
            random1 = Math.floor(Math.random() * 11);
            var node = new NodeCommonModel(random1,random1,model);

            let additions  = 0;
            for (let i = 0; i<100; i++){
                random = Math.floor(Math.random() * 11);
                if (random%2 === 0){
                    node.addAttribute(new AttributeObject(random,random));
                    additions++;
                } else {
                    node.removeAttributeByIndex(node.attributes[Object.keys(node.attributes)[0]].length-1);
                    if (additions >0){
                        additions--;
                    }
                }
            }
            expect(node.attributes[Object.keys(node.attributes)[0]].length).toBe(additions);
            model.addNode(node);
            nodes.push(node);

        }
        var links = [];
        var length = 0;
        for (let i = 0; i<100; i++){
            random1 = Math.floor(Math.random() * 11);
            random2 = Math.floor(Math.random() * 100);
            random3 = Math.floor(Math.random() * 100);
            var link = new LinkCommonModel(model);
            link.setSourcePort(nodes[random2].getPort("left"));
            link.setTargetPort(nodes[random3].getPort("right"));
            for (let i = 0; i<100; i++){
                random = Math.floor(Math.random() * 11);
                let additions  = 0;
                if (random%2 === 0){
                    link.addLabel(new DefaultLabelModel(random));
                    additions++;
                } else {
                    if (link.labels[random] !== undefined){
                        length = link.labels.length;
                        link.labels.splice(random,1);
                        if (additions >0 && length !== link.labels.length){
                            additions--;
                        }

                    }

                }
            }
            model.addLink(link);
        }
        var save = JSON.stringify(model.serialize());
        model = new OntoDiagramModel({
            selectedLink: Defaults.selectedLink,
            language: Defaults.language,
            firstCardinality: Defaults.cardinality,
            secondCardinality: Defaults.cardinality
        },engine);
        model.deSerialize(JSON.parse(save),engine);
        expect(save).toBe(JSON.stringify(model.serialize()));
    });

});
