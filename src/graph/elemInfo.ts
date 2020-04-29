import * as joint from "jointjs";
import {graph} from "./graph";

joint.elementTools.InfoButton = joint.elementTools.Button.extend({
    name: 'info-button',
    options: {
        markup: [{
            tagName: 'circle',
            selector: 'button',
            attributes: {
                'r': 10,
                'fill': '#001DFF',
                'cursor': 'pointer'
            }
        }, {
            tagName: 'path',
            selector: 'icon',
            attributes: {
                'd': 'M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4',
                'fill': 'none',
                'stroke': '#FFFFFF',
                'transform': 'scale(1.5)',
                'stroke-width': 2,
                'pointer-events': 'none'
            }
        }],
        distance: 60,
        offset: 0,
        action: (evt) => {
            let id = evt.currentTarget.getAttribute("model-id");
            this.props.prepareDetails(id);
            for (let cell of graph.getCells()) {
                this.unHighlightCell(cell.id);
                //this.paper?.findViewByModel(cell).unhighlight();
            }
            this.highlight = id;
            this.highlightCell(id);
        }
    }
});