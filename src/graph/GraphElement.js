import * as joint from "jointjs";

export var graphElement = joint.dia.Element.define('custom.customRectangle', {
    z: 2,
    attrs: {
        root: {
            magnet: false
        },
        pointers: {
            pointerShape: 'rectangle'
        },
        border: {
            stroke: '#000',
            strokeWidth: 1,
            rough: {
                type: 'rectangle'
            }
        },
        body: {
            strokeWidth: 1,
            stroke: '#000',
            fill: '#FFFFFF',
            rough: {
                type: 'rectangle'
            }
        },
        label: {
            textVerticalAnchor: 'middle',
            textAnchor: 'middle',
            refX: '50%',
            refY: '50%',
            pointerEvents: 'none'
        }
    }
}, {
    markup: [{
        tagName: 'path',
        selector: 'pointers',
        attributes: {
            'magnet': 'on-shift',
            'fill': 'transparent'
        }
    }, {
        tagName: 'path',
        selector: 'body',
        attributes: {
            'pointer-events': 'none',
            'fill': 'transparent'
        }
    }, {
        tagName: 'path',
        selector: 'border',
        attributes: {
            'pointer-events': 'none',
            'fill': 'transparent'
        }
    }, {
        tagName: 'text',
        selector: 'label'
    }]
}, {

    create: function(id) {
        return new this({id: id});
    }
    ,attributes: {
        rough: {
            set: function(opt, bbox) {
                var width = bbox.width;
                var height = bbox.height;
                var vel = joint.V('rect').attr({
                    'width': width,
                    'height': height
                });
                return { d: vel.convertToPathData() };
            }
        },
        pointerShape: {
            set: function(type, bbox) {

                var width = bbox.width;
                var height = bbox.height;
                var vel = joint.V('rect').attr({
                    'width': width,
                    'height': height
                });
                return { d: vel.convertToPathData() };
            }
        }
    }
});