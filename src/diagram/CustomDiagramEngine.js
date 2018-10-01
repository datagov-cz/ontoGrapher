import {
    AbstractLabelFactory,
    AbstractLinkFactory, AbstractNodeFactory,
    AbstractPortFactory,
    DiagramEngine,
    Toolkit
} from "storm-react-diagrams";
import {CustomDiagramModel} from "./CustomDiagramModel";


export class CustomDiagramEngine extends DiagramEngine{
    nodeFactories: { [s: string]: AbstractNodeFactory };
    linkFactories: { [s: string]: AbstractLinkFactory };
    portFactories: { [s: string]: AbstractPortFactory };
    labelFactories: { [s: string]: AbstractLabelFactory };

    diagramModel: CustomDiagramModel;
    canvas: Element;
    paintableWidgets: {};
    linksThatHaveInitiallyRendered: {};
    nodesRendered: boolean;
    maxNumberPointsPerLink: number;
    smartRouting: boolean;

    constructor() {
        super();
        this.diagramModel = new CustomDiagramModel();
        this.nodeFactories = {};
        this.linkFactories = {};
        this.portFactories = {};
        this.labelFactories = {};
        this.canvas = null;
        this.paintableWidgets = null;
        this.linksThatHaveInitiallyRendered = {};

        if (Toolkit.TESTING) {
            Toolkit.TESTING_UID = 0;

            //pop it onto the window so our E2E helpers can find it
            //if (window) {
            //    (window as any)["diagram_instance"] = this;
            //}
        }
    }
    isSmartRoutingEnabled(): boolean{
        return false;
    }
}