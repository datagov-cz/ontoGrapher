import React from 'react';
import {PanelNodeItem} from "./PanelNodeItem";
import {Defaults} from "../config/Defaults";
import {Tabs} from "react-bootstrap";
import {Tab} from "react-bootstrap";
import {Locale} from "../config/Locale";
import {CardinalityPool} from "../config/CardinalityPool";
import {PanelLinkItem} from "./PanelLinkItem";
import {LinkPool} from "../config/LinkPool";


export class ElementPanel extends React.Component{
    constructor(props: PanelNodeItem) {
        super(props);
        this.stereotypeList = [];
        this.handleChangeSelectedLink = this.handleChangeSelectedLink.bind(this);



        /*
        this.stereotypeLists = StereotypePool.map((stereotype) =>
            <PanelNodeItem key={stereotype.toUpperCase()} model={{type: stereotype.toLowerCase()}} name={stereotype} color="white"/>
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

    handleChangeSelectedLink(linktype){
        this.props.handleChangeSelectedLink(linktype);
    }

    render(){


        /*
        this.linkPool = [];
        for (let link in LinkPool) {
            this.linkPool.push(
                <PanelLinkItem
                    key={link}
                    selectedLink={this.props.selectedLink}
                    handleChangeSelectedLink={this.handleChangeSelectedLink}
                    linktype={link}/>);
        }

        this.stereotype = this.state.stereotypes.map((stereotype)=>
            <PanelNodeItem key={stereotype.toUpperCase()} model={{type: stereotype.toLowerCase()}} name={stereotype} color="white"/>
        );
        */
        this.stereotype = [];
        for (let stereo in this.stereotypes){
            this.stereotype.push(<PanelNodeItem key={this.stereotypes[stereo].toUpperCase()} model={{
                type: this.stereotypes[stereo].toLowerCase(),
                rdf: stereo
            }} name={this.stereotypes[stereo]}/>);
        }
        return(
            <div className="stereotypePanel">
                <Tabs id="stereotypePanel" animation={false}>
                    <Tab eventKey={1} title={Locale.leftPanelStereotypes}>
                        <div className="stereotypes">
                            {this.stereotype}
                        </div>
                    </Tab>
                    <Tab eventKey={2} title={Locale.leftPanelLinks}>
                        {Object.keys(LinkPool).map((link)=>(
                            <PanelLinkItem
                                key={link}
                                selectedLink={this.props.selectedLink}
                                handleChangeSelectedLink={this.handleChangeSelectedLink}
                                linktype={link}
                            />
                        ))}
                    </Tab>
                </Tabs>


            </div>
        );
    }

}

ElementPanel.defaultProps = {};