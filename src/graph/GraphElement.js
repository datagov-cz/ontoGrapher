import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('examples.CustomTextElement', {
        attrs: {
            body: {
                ref: 'label',
                refX: '-15%',
                refY: '-30%',
                // width:  100,
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
                refY: '50%',
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
        create: function (id) {
            return new this({id: id});
        }
    }
);
