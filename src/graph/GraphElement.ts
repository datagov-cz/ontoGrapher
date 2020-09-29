import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('custom.graphElement', {
        attrs: {
            body: {
                //ref: 'label',
                //refX: '-15%',
                //refY: '-30%',
                //refWidth: '133%',
                //refHeight: '150%',
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            label: {
                // ref: 'body',
                textVerticalAnchor: 'top',
                textAnchor: 'middle',
                y: 5,
                fontSize: 16
                //refX: '50%',
                //refY: '50%'
            },
            labelAttrs: {
                //ref: 'body',
                textVerticalAnchor: 'top',
                textAnchor: 'start',
                fontSize: 14,
                y: 30,
                x: 5
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
