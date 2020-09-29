import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('custom.graphElement', {
        attrs: {
            body: {
                ref: 'label',
                refX: '-15%',
                refY: '-30%',
                refWidth: '133%',
                refHeight: '150%',
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            label: {
                textVerticalAnchor: 'middle',
                textAnchor: 'middle',
                refX: '50%',
                refY: '50%'
            },
            labelAttrs: {
                ref: 'body',
                textVerticalAnchor: 'top',
                textAnchor: 'start',
                fontSize: 14,
                refY: 30,
                refX: 5
            }
        }
    }, {
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'label'
            },
            {
                tagName: 'text',
                selector: 'labelAttrs'
            }
        ]
    },
);
