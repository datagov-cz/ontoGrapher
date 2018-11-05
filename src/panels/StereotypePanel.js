import React from 'react';
import {StereotypePanelItem} from "./StereotypePanelItem";
import {StereotypePool} from "../config/StereotypePool";
import {getStereotypes} from "../rdf/StereotypeGetter";
import {Defaults} from "../config/Defaults";


export class StereotypePanel extends React.Component{
    constructor(props: StereotypePanelItem) {
        super(props);
        this.stereotypeList = [];
        this.state = {
            stereotypes: []
        };
        /*
        this.stereotypeLists = StereotypePool.map((stereotype) =>
            <StereotypePanelItem key={stereotype.toUpperCase()} model={{type: stereotype.toLowerCase()}} name={stereotype} color="white"/>
        );
        */
    }

    componentWillMount(){
        const rdf = require('rdf-ext');
        const rdfFetch = require('rdf-fetch');
        this.stereotypes = {};
        this.stereotypeList = [];
        rdfFetch(Defaults.stereotypeUrl).then((res) => {
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
            //console.log(res);
            for (let quad in res){
                for (let node of res[quad].toArray()){
                    if (node.object instanceof rdf.defaults.Literal && node.predicate.value === "http://www.w3.org/2000/01/rdf-schema#label"){
                        if (node.object.language === "en"){
                            this.stereotypes[node.subject.value] = node.object.value;
                            this.stereotypeList.push(node.object.value);
                        }
                    }
                }
            }
            //this.stereotypeList = {};
            //for (let stereotype o)
            this.setState({
                stereotypes: this.stereotypeList
            });

        }).catch((err) => {
            console.error(err.stack || err.message);
        });

    }

    render(){
        /*
        this.stereotype = this.state.stereotypes.map((stereotype)=>
            <StereotypePanelItem key={stereotype.toUpperCase()} model={{type: stereotype.toLowerCase()}} name={stereotype} color="white"/>
        );
        */
        this.stereotype = [];
        for (let stereo in this.stereotypes){
            this.stereotype.push(<StereotypePanelItem key={this.stereotypes[stereo].toUpperCase()} model={{
                type: this.stereotypes[stereo].toLowerCase(),
                rdf: stereo
            }} name={this.stereotypes[stereo]} color="white"/>);
        }
        return(
            <div className="stereotypePanel">
                {this.stereotype}
            </div>
        );
    }

}

StereotypePanel.defaultProps = {};