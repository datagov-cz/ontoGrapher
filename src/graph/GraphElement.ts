import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('custom.graphElement', {
        attrs: {
            body: {
                ref: 'label',
                refX: '-15%',
                refY: '-30%',
                refWidth: '133%',
                refHeight: '100%',
                refHeight2: 20,
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            label: {
                textVerticalAnchor: 'middle',
                textAnchor: 'middle',
                refX: '50%',
                refY: '50%'
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
            },]
    },
    {
        create: function (id: string) {
            return new this({id: id});
        }
    }
);
