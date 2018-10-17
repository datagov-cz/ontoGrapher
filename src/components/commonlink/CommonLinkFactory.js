import {AbstractLinkFactory, DiagramEngine} from "storm-react-diagrams";
import React from "react";
import {LinkPool} from "../../diagram/LinkPool";
import {CommonLinkWidget} from "./CommonLinkWidget";
import {CommonLinkModel} from "./CommonLinkModel";

export class CommonLinkFactory extends AbstractLinkFactory<CommonLinkModel>{

    constructor(){
        super();
        this.type = "link-common";
    }

    getNewInstance(initialConfig?: any): CommonLinkModel{
        return new CommonLinkModel();
    }

    generateReactWidget(diagramEngine: DiagramEngine, link: CommonLinkModel): JSX.Element {
        return React.createElement(LinkPool[link.linktype],{
            link: link,
            diagramEngine: diagramEngine,
        });
    }

    generateLinkSegment(model: CommonLinkModel, widget: CommonLinkWidget, selected: boolean, path:string){
        if (model.linktype === "Derivation"){
            return (

                <path className={selected ? "link-derivation--path-selected" : "link-derivation"}
                      ref={ref => {
                          this.path = ref;
                      }}
                      strokeWidth={model.width}
                      stroke="black"
                      strokeDasharray="10,10"
                      d={path}
                />

            );
        } else {
            return (

                <path className={selected ? "link-common--path-selected" : "link-common"}
                      ref={ref => {
                          this.path = ref;
                      }}
                      strokeWidth={model.width}
                      stroke="black"
                      d={path}
                />

            );
        }

    }
}