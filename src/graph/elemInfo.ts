import * as joint from "jointjs";

// @ts-ignore
export var ElemInfoButton = joint.elementTools.Button.extend({
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
    }
});