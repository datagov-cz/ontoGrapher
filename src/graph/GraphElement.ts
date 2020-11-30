import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('custom.graphElement', {
        attrs: {
            bodyBox: {
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            bodyEllipse: {
                display: "none",
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            bodyTrapezoid: {
                display: "none",
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            bodyDiamond: {
                display: "none",
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            label: {
                textVerticalAnchor: 'top',
                textAnchor: 'middle',
                y: 5,
                fontSize: 16
            },
            labelAttrs: {
                textVerticalAnchor: 'top',
                textAnchor: 'start',
                fontSize: 14,
                y: 25,
                x: 2
            }
        }
    }, {
        markup: [
            {
                tagName: 'rect',
                selector: 'bodyBox',
            },
            {
                tagName: 'ellipse',
                selector: 'bodyEllipse',
            },
            {
                tagName: 'polygon',
                selector: 'bodyTrapezoid',
            },
            {
                tagName: 'polygon',
                selector: 'bodyDiamond',
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
