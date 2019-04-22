import {AbstractLinkFactory, DiagramEngine} from "storm-react-diagrams";
import React from "react";
import {LinkCommonWidget} from "./LinkCommonWidget";
import {LinkCommonModel} from "./LinkCommonModel";
export class LinkCommonFactory extends AbstractLinkFactory<LinkCommonModel> {

    constructor() {
        super();
        this.type = "link-common";
    }

    getNewInstance(initialConfig?: any): LinkCommonModel {
        return new LinkCommonModel();
    }

    generateReactWidget(diagramEngine: DiagramEngine, link: LinkCommonModel): JSX.Element {
        return React.createElement(LinkCommonWidget, {
            link: link,
            diagramEngine: diagramEngine,
        });
    }

    generateLinkSegment(model: LinkCommonModel, widget: LinkCommonWidget, selected: boolean, path: string) {
        if (model.dashed) {
            return (
                <path className={selected ? "link-derivation--path-selected" : "link-derivation"}
                      ref={ref => {
                          this.path = ref;
                      }}
                      shapeRendering="optimizeSpeed"
                      strokeWidth={model.width}
                      stroke={model.color}
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
                      shapeRendering="optimizeSpeed"
                      strokeWidth={model.width}
                      stroke={model.color}
                      d={path}
                />

            );
        }

    }
}