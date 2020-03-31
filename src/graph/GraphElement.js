import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('examples.CustomTextElement', {
        attrs: {
            // root: {
            //     magnet: false
            // },
            body: {
                ref: 'label',
                refX: '-15%',
                refY: '-30%',
                // width:  100,
                refWidth: '133%',
                refHeight: '150%',
                strokeWidth: 2,
                stroke: '#000000',
                fill: '#FFF'
            },
            // link: {
            //     ref: 'body',
            //
            // },
            // pointers: {
            //     pointerShape: 'rectangle',
            //     ref: 'label',
            //     refX: '-12.5%',
            //     refY: '-25%',
            //     refWidth: '125%',
            //     refHeight: '150%'
            // },
            label: {
                textVerticalAnchor: 'middle',
                textAnchor: 'middle',
                refX: '50%',
                refY: '50%',
           //     pointerEvents: 'none',
            }
        }
    }, {
        markup: [
            // {
            //     tagName: 'rect',
            //     selector: 'pointers',
            //     attributes: {
            //         'magnet': 'on-shift',
            //         'fill': 'transparent'
            //     }
            // },
            {
                tagName: 'rect',
                selector: 'body',
                // attributes: {
                //     'pointer-events': 'none'
                //  }
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
